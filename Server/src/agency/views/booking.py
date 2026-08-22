from django.shortcuts import get_object_or_404
from django.db import models, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Arrangement, Booking
from ..serializers import BookingSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bookings(request):
    if request.method == 'GET':
        bookings = Booking.objects.filter(user=request.user).select_related('arrangement__destination', 'arrangement__hotel')
        serializer = BookingSerializer(bookings, many=True)
        return Response({"success": True, "data": serializer.data})

    if request.method == 'POST':
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                arrangement = Arrangement.objects.select_for_update().get(pk=serializer.validated_data['arrangement'].pk)
                reserved = arrangement.bookings.exclude(status='CANCELLED').aggregate(total=models.Sum('guests'))['total'] or 0
                requested = serializer.validated_data['adults'] + serializer.validated_data['children']
                if reserved + requested > arrangement.capacity:
                    return Response({"success": False, "message": "Not enough available capacity."}, status=status.HTTP_400_BAD_REQUEST)
                serializer.validated_data['arrangement'] = arrangement
                serializer.save(user=request.user)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def booking_detail(request, id):
    booking = get_object_or_404(Booking, id=id, user=request.user)

    if request.method == 'DELETE':
        if booking.status != 'CANCELLED':
            return Response({"success": False, "message": "Only cancelled bookings can be removed."}, status=status.HTTP_400_BAD_REQUEST)
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.data.get('action') == 'pay':
        if booking.payment_status == 'PAID':
            return Response({"success": False, "message": "Booking is already paid."}, status=status.HTTP_400_BAD_REQUEST)
        booking.payment_status = 'PAID'
        booking.status = 'CONFIRMED'
        booking.save()
        serializer = BookingSerializer(booking)
        return Response({"success": True, "data": serializer.data})

    if request.data.get('action') == 'cancel':
        if booking.status == 'CANCELLED':
            return Response({"success": False, "message": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = 'CANCELLED'
        booking.save()
        serializer = BookingSerializer(booking)
        return Response({"success": True, "data": serializer.data})

    return Response({"success": False, "message": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
