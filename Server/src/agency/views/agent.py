from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..models import Booking
from ..serializers import BookingSerializer


def agent_booking_queryset(user):
    return Booking.objects.filter(
        arrangement__created_by=user,
    ).select_related('user', 'arrangement__destination', 'arrangement__hotel').order_by('-booked_at')


def is_agent(user):
    return user.is_staff and not user.is_superuser


@extend_schema(summary='List bookings for arrangements created by the agent', responses=BookingSerializer(many=True), operation_id='agent_bookings_list')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agent_bookings(request):
    if not is_agent(request.user):
        return Response({'success': False, 'message': 'Agent only'}, status=status.HTTP_403_FORBIDDEN)
    return Response({'success': True, 'data': BookingSerializer(agent_booking_queryset(request.user), many=True).data})


@extend_schema(methods=['GET'], summary='Retrieve an agent booking', responses=BookingSerializer, operation_id='agent_booking_retrieve')
@extend_schema(methods=['PUT'], summary='Update an agent booking', request=BookingSerializer, responses=BookingSerializer, operation_id='agent_booking_update')
@extend_schema(methods=['DELETE'], summary='Delete an agent booking', responses=None, operation_id='agent_booking_delete')
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def agent_booking_detail(request, id):
    if not is_agent(request.user):
        return Response({'success': False, 'message': 'Agent only'}, status=status.HTTP_403_FORBIDDEN)

    booking = get_object_or_404(agent_booking_queryset(request.user), id=id)
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