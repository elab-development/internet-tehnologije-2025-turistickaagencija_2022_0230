from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import Transport
from ..serializers import TransportSerializer


def is_admin(user):
    return user.is_authenticated and (user.is_superuser or user.is_staff)


@api_view(['GET', 'POST'])
def transports(request):
    if request.method == 'GET':
        return Response(TransportSerializer(Transport.objects.all(), many=True).data)
    if not is_admin(request.user):
        return Response({'success': False, 'message': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    serializer = TransportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def transport_detail(request, id):
    transport = get_object_or_404(Transport, id=id)
    if request.method == 'GET':
        return Response(TransportSerializer(transport).data)
    if not is_admin(request.user):
        return Response({'success': False, 'message': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    if request.method == 'DELETE':
        transport.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = TransportSerializer(transport, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)