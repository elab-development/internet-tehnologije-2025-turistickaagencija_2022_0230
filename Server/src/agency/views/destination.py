from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import Destination
from ..serializers import DestinationSerializer, TopDestinationSerializer


@api_view(['GET', 'POST'])
def destinations(request):
    if request.method == 'GET':
        data = Destination.objects.all()
        serializer = DestinationSerializer(data, many=True)
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

        serializer = DestinationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def destination_detail(request, id):
    destination = get_object_or_404(Destination, id=id)

    if request.method == 'GET':
        serializer = DestinationSerializer(destination)
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

        serializer = DestinationSerializer(destination, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

    elif request.method == 'DELETE':
        if not request.user.is_superuser:
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        destination.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def top_destinations(request):
    queryset = (
        Destination.objects
        .annotate(arrangement_count=Count('arrangements'))
        .order_by('-arrangement_count')[:8]
    )

    data = [
        {
            "destination": destination,
            "arrangement_count": destination.arrangement_count,
        }
        for destination in queryset
    ]

    serializer = TopDestinationSerializer(data, many=True)
    return Response({
        "success": True,
        "data": serializer.data,
    })
