from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import Arrangement
from ..serializers import ArrangementSerializer


@api_view(['GET', 'POST'])
def arrangements(request):
    if request.method == 'GET':
        arrangements = Arrangement.objects.all()
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
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def arrangement_detail(request, id):
    arrangement = get_object_or_404(Arrangement, id=id)

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


@api_view(['GET'])
@permission_classes([AllowAny])
def top_arrangements(request):
    arrangements = Arrangement.objects.order_by('-hotel__rating')[:8]

    serializer = ArrangementSerializer(arrangements, many=True)
    return Response({
        "success": True,
        "data": serializer.data,
    })


@api_view(['POST'])
def arrangements_filter(request):
    queryset = Arrangement.objects.all()

    destination_id = request.data.get('destination_id')
    start_date = request.data.get('start_date')
    end_date = request.data.get('end_date')
    capacity = request.data.get('capacity')

    if destination_id:
        queryset = queryset.filter(destination_id=destination_id)

    if start_date and end_date:
        queryset = queryset.filter(
            start_date__gte=start_date,
            end_date__lte=end_date,
        )
    elif start_date:
        start = parse_date(start_date)
        end = start + timedelta(days=30)

        queryset = queryset.filter(
            start_date__gte=start,
            end_date__lte=end,
        )
    elif end_date:
        end = parse_date(end_date)
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
