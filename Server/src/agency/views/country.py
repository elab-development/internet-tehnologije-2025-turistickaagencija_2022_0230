from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..models import Country
from ..serializers import CountrySerializer


@extend_schema(methods=['GET'], summary='List countries', responses=CountrySerializer(many=True), operation_id='countries_list')
@extend_schema(methods=['POST'], summary='Create a country', request=CountrySerializer, responses=CountrySerializer, operation_id='countries_create')
@api_view(['GET', 'POST'])
def countries(request):
    if request.method == 'GET':
        data = Country.objects.all()
        serializer = CountrySerializer(data, many=True)
        return Response({"success": True, "data": serializer.data})

    elif request.method == 'POST':
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

        serializer = CountrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(methods=['GET'], summary='Retrieve a country', responses=CountrySerializer, operation_id='countries_retrieve')
@extend_schema(methods=['PUT'], summary='Update a country', request=CountrySerializer, responses=CountrySerializer, operation_id='countries_update')
@extend_schema(methods=['DELETE'], summary='Delete a country', responses=None, operation_id='countries_delete')
@api_view(['GET', 'PUT', 'DELETE'])
def country_detail(request, id):
    country = get_object_or_404(Country, id=id)

    if request.method == 'GET':
        serializer = CountrySerializer(country)
        return Response(serializer.data)

    if not request.user.is_authenticated:
        return Response(
            {"success": False, "message": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if request.method == 'PUT':
        if not request.user.is_superuser:
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CountrySerializer(country, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

    elif request.method == 'DELETE':
        if not request.user.is_superuser:
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        country.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
