from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from ..models import Arrangement, Booking, Country, Destination, Hotel, Transport
from ..serializers import ArrangementSerializer, BookingSerializer, CountrySerializer, DestinationSerializer, HotelSerializer, UserSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if not request.user.is_superuser:
        return Response({
            "success": False,
            "message": "Admin only",
        }, status=403)

    return Response({
        "success": True,
        "data": {
            "stats": {
                "countries": Country.objects.count(),
                "destinations": Destination.objects.count(),
                "hotels": Hotel.objects.count(),
                "arrangements": Arrangement.objects.count(),
                "bookings": Booking.objects.count(),
                "transports": Transport.objects.count(),
                "users": request.user.__class__.objects.count(),
            },
            "users": UserSerializer(request.user.__class__.objects.order_by('username'), many=True).data,
            "countries": CountrySerializer(Country.objects.order_by('name'), many=True).data,
            "destinations": DestinationSerializer(Destination.objects.select_related('country').order_by('name'), many=True).data,
            "hotels": HotelSerializer(Hotel.objects.select_related('destination').order_by('name'), many=True).data,
            "arrangements": ArrangementSerializer(Arrangement.objects.select_related('destination', 'hotel').order_by('name'), many=True).data,
        },
    })


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_bookings(request, id=None):
    if not request.user.is_superuser:
        return Response({'success': False, 'message': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET' and id is None:
        bookings = Booking.objects.select_related('user', 'arrangement__destination', 'arrangement__hotel').order_by('-booked_at')
        return Response({'success': True, 'data': BookingSerializer(bookings, many=True).data})

    booking = get_object_or_404(Booking, id=id)
    if request.method == 'DELETE':
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == 'GET':
        return Response({'success': True, 'data': BookingSerializer(booking).data})

    allowed_fields = [field for field in ('status', 'payment_status', 'notes') if field in request.data]
    if not allowed_fields:
        return Response({'success': False, 'message': 'No editable fields provided.'}, status=status.HTTP_400_BAD_REQUEST)
    for field in allowed_fields:
        setattr(booking, field, request.data[field])
    booking.save(update_fields=allowed_fields)
    return Response({'success': True, 'data': BookingSerializer(booking).data})
