from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Arrangement, Booking, Country, Destination, Hotel, Transport
from .agent import is_agent


def _analytics_data(arrangements, bookings, include_catalog=False):
    active_bookings = bookings.exclude(status='CANCELLED')
    paid_bookings = active_bookings.filter(payment_status='PAID')
    confirmed_bookings = active_bookings.filter(status='CONFIRMED')

    monthly = list(
        active_bookings.annotate(month=TruncMonth('booked_at'))
        .values('month')
        .annotate(bookings=Count('id'), guests=Sum('guests'))
        .order_by('month')
    )
    revenue_monthly = list(
        confirmed_bookings.annotate(month=TruncMonth('booked_at'))
        .values('month')
        .annotate(revenue=Sum('total_price'))
        .order_by('month')
    )
    revenue_by_month = {item['month']: float(item['revenue'] or 0) for item in revenue_monthly}

    destination_rows = list(
        active_bookings.values('arrangement__destination__name')
        .annotate(bookings=Count('id'), guests=Sum('guests'))
        .order_by('-bookings', '-guests')[:6]
    )
    arrangement_rows = list(
        arrangements.values('id', 'name', 'capacity')
        .annotate(
            booking_count=Count('bookings', filter=~Q(bookings__status='CANCELLED')),
            guest_count=Sum('bookings__guests', filter=~Q(bookings__status='CANCELLED')),
            revenue=Sum('bookings__total_price', filter=Q(bookings__status='CONFIRMED')),
        )
        .order_by('-booking_count', '-guest_count')[:8]
    )

    data = {
        'summary': {
            'arrangements': arrangements.count(),
            'active_arrangements': arrangements.filter(is_active=True).count(),
            'bookings': active_bookings.count(),
            'guests': active_bookings.aggregate(total=Sum('guests'))['total'] or 0,
            'revenue': float(confirmed_bookings.aggregate(total=Sum('total_price'))['total'] or 0),
            'paid_revenue': float(paid_bookings.aggregate(total=Sum('total_price'))['total'] or 0),
            'capacity': arrangements.aggregate(total=Sum('capacity'))['total'] or 0,
        },
        'bookings_over_time': [
            {
                'label': item['month'].strftime('%b %Y'),
                'bookings': item['bookings'],
                'guests': item['guests'] or 0,
            }
            for item in monthly
        ],
        'revenue_over_time': [
            {
                'label': item['month'].strftime('%b %Y'),
                'revenue': revenue_by_month.get(item['month'], 0),
            }
            for item in monthly
        ],
        'booking_status': [
            {'label': label, 'value': bookings.filter(status=value).count()}
            for value, label in Booking.STATUS_CHOICES
        ],
        'payment_status': [
            {'label': label, 'value': bookings.filter(payment_status=value).count()}
            for value, label in Booking.PAYMENT_STATUS_CHOICES
        ],
        'arrangement_status': [
            {'label': label, 'value': arrangements.filter(status=value).count()}
            for value, label in Arrangement.STATUS_CHOICES
        ],
        'top_destinations': [
            {
                'name': item['arrangement__destination__name'],
                'bookings': item['bookings'],
                'guests': item['guests'] or 0,
            }
            for item in destination_rows
        ],
        'arrangement_performance': [
            {
                'id': item['id'],
                'name': item['name'],
                'bookings': item['booking_count'],
                'guests': item['guest_count'] or 0,
                'capacity': item['capacity'],
                'revenue': float(item['revenue'] or 0),
            }
            for item in arrangement_rows
        ],
    }

    if include_catalog:
        data['catalog'] = {
            'users': get_user_model().objects.count(),
            'countries': Country.objects.count(),
            'destinations': Destination.objects.count(),
            'hotels': Hotel.objects.count(),
            'transports': Transport.objects.count(),
        }

    return data


def _forbidden(message):
    return Response({'success': False, 'message': message}, status=403)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    if not request.user.is_superuser:
        return _forbidden('Admin only')
    return Response({
        'success': True,
        'data': _analytics_data(Arrangement.objects.all(), Booking.objects.all(), include_catalog=True),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agent_analytics(request):
    if not is_agent(request.user):
        return _forbidden('Agent only')
    arrangements = Arrangement.objects.filter(created_by=request.user)
    bookings = Booking.objects.filter(arrangement__created_by=request.user)
    return Response({'success': True, 'data': _analytics_data(arrangements, bookings)})
