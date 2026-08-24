from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

from ..models import Arrangement
from ..serializers import ArrangementSerializer


@extend_schema(methods=['GET'], summary='List travel arrangements', responses=ArrangementSerializer(many=True), operation_id='arrangements_list')
@extend_schema(methods=['POST'], summary='Create a travel arrangement', request=ArrangementSerializer, responses=ArrangementSerializer, operation_id='arrangements_create')
@api_view(['GET', 'POST'])
def arrangements(request):
    if request.method == 'GET':
        arrangements = Arrangement.objects.all()
        if request.user.is_authenticated and request.user.is_staff and not request.user.is_superuser:
            arrangements = arrangements.filter(created_by=request.user)
        serializer = ArrangementSerializer(arrangements, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(
                {"success": False, "message": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ArrangementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(methods=['GET'], summary='Retrieve a travel arrangement', responses=ArrangementSerializer, operation_id='arrangements_retrieve')
@extend_schema(methods=['PUT'], summary='Update a travel arrangement', request=ArrangementSerializer, responses=ArrangementSerializer, operation_id='arrangements_update')
@extend_schema(methods=['DELETE'], summary='Delete a travel arrangement', responses=None, operation_id='arrangements_delete')
@api_view(['GET', 'PUT', 'DELETE'])
def arrangement_detail(request, id):
    filters = {'id': id}
    if request.user.is_authenticated and request.user.is_staff and not request.user.is_superuser:
        filters['created_by'] = request.user
    arrangement = get_object_or_404(Arrangement, **filters)

    if request.method == 'GET':
        serializer = ArrangementSerializer(arrangement)
        return Response({"success": True, "data": serializer.data})

    if not request.user.is_authenticated:
        return Response(
            {"success": False, "message": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    elif request.method == 'PUT':
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ArrangementSerializer(arrangement, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

    elif request.method == 'DELETE':
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        arrangement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    summary='List the top-rated travel arrangements',
    responses=ArrangementSerializer(many=True),
    operation_id='top_arrangements_list',
)
@api_view(['GET'])
@permission_classes([AllowAny])
def top_arrangements(request):
    arrangements = Arrangement.objects.order_by('-hotel__rating')[:8]

    serializer = ArrangementSerializer(arrangements, many=True)
    return Response({
        "success": True,
        "data": serializer.data,
    })


@extend_schema(
    summary='Filter travel arrangements',
    request=inline_serializer(
        name='ArrangementFilterRequest',
        fields={
            'destination_id': serializers.IntegerField(required=False),
            'start_date': serializers.DateField(required=False),
            'end_date': serializers.DateField(required=False),
            'capacity': serializers.IntegerField(required=False),
        },
    ),
    responses=dict,
    operation_id='arrangements_filter_create',
)
@api_view(['POST'])
def arrangements_filter(request):
    queryset = Arrangement.objects.all()
    if request.user.is_authenticated and request.user.is_staff and not request.user.is_superuser:
        queryset = queryset.filter(created_by=request.user)

    destination_id = request.data.get('destination_id')
    start_date = request.data.get('start_date')
    end_date = request.data.get('end_date')
    capacity = request.data.get('capacity')

    parsed_start_date = parse_date(start_date) if start_date else None
    parsed_end_date = parse_date(end_date) if end_date else None

    if start_date and not parsed_start_date:
        return Response(
            {"success": False, "message": "Invalid start_date."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if end_date and not parsed_end_date:
        return Response(
            {"success": False, "message": "Invalid end_date."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if parsed_start_date and parsed_end_date and parsed_start_date > parsed_end_date:
        return Response(
            {"success": False, "message": "start_date must be before end_date."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if destination_id:
        queryset = queryset.filter(destination_id=destination_id)

    if parsed_start_date and parsed_end_date:
        queryset = queryset.filter(
            start_date__gte=parsed_start_date,
            end_date__lte=parsed_end_date,
        )
    elif parsed_start_date:
        start = parsed_start_date
        end = start + timedelta(days=30)

        queryset = queryset.filter(
            start_date__gte=start,
            end_date__lte=end,
        )
    elif parsed_end_date:
        end = parsed_end_date
        start = end - timedelta(days=30)

        queryset = queryset.filter(
            end_date__lte=end,
            start_date__gte=start,
        )

    if capacity:
        queryset = queryset.filter(capacity__gte=capacity)

    serializer = ArrangementSerializer(queryset, many=True)
    return Response({
        "success": True,
        "data": serializer.data,
    })
