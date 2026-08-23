from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..models import Hotel
from ..serializers import HotelSerializer


@extend_schema(methods=['GET'], summary='List hotels', responses=HotelSerializer(many=True), operation_id='hotels_list')
@extend_schema(methods=['POST'], summary='Create a hotel', request=HotelSerializer, responses=HotelSerializer, operation_id='hotels_create')
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


@extend_schema(methods=['GET'], summary='Retrieve a hotel', responses=HotelSerializer, operation_id='hotels_retrieve')
@extend_schema(methods=['PUT'], summary='Update a hotel', request=HotelSerializer, responses=HotelSerializer, operation_id='hotels_update')
@extend_schema(methods=['DELETE'], summary='Delete a hotel', responses=None, operation_id='hotels_delete')
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
