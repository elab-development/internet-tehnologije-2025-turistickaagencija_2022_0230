from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import Hotel
from ..serializers import HotelSerializer


@api_view(['GET', 'POST'])
def hotels(request):
    if request.method == 'GET':
        hotels = Hotel.objects.all()
        serializer = HotelSerializer(hotels, many=True)
        return Response(serializer.data)

    if not request.user.is_authenticated:
        return Response(
            {"success": False, "message": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if request.method == 'POST':
        if not request.user.is_superuser:
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = HotelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def hotel_detail(request, id):
    hotel = get_object_or_404(Hotel, id=id)

    if request.method == 'GET':
        serializer = HotelSerializer(hotel)
        return Response(serializer.data)

    if not request.user.is_authenticated:
        return Response(
            {"success": False, "message": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not request.user.is_superuser:
        return Response(
            {"success": False, "message": "Permission denied"},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == 'PUT':
        serializer = HotelSerializer(hotel, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        hotel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
