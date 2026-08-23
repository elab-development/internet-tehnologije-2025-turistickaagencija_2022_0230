from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..models import Transport
from ..serializers import TransportSerializer


def is_admin(user):
    return user.is_authenticated and (user.is_superuser or user.is_staff)


@extend_schema(methods=['GET'], summary='List transports', responses=TransportSerializer(many=True), operation_id='transports_list')
@extend_schema(methods=['POST'], summary='Create a transport', request=TransportSerializer, responses=TransportSerializer, operation_id='transports_create')
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


@extend_schema(methods=['GET'], summary='Retrieve a transport', responses=TransportSerializer, operation_id='transports_retrieve')
@extend_schema(methods=['PUT'], summary='Update a transport', request=TransportSerializer, responses=TransportSerializer, operation_id='transports_update')
@extend_schema(methods=['DELETE'], summary='Delete a transport', responses=None, operation_id='transports_delete')
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