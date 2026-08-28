from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..serializers import UserSerializer
from ..models import UserProfile


@extend_schema(
    summary='List users grouped by role',
    responses=dict,
    operation_id='users_list',
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users(request):
    if not request.user.is_superuser:
        return Response({
            "success": False,
            "message": "Admin only",
        }, status=403)

    admins = User.objects.filter(is_superuser=True).select_related('profile')
    agents = User.objects.filter(is_staff=True, is_superuser=False).select_related('profile')
    clients = User.objects.filter(is_staff=False, is_superuser=False).select_related('profile')

    return Response({
        "success": True,
        "data": {
            "admins": UserSerializer(admins, many=True).data,
            "agents": UserSerializer(agents, many=True).data,
            "clients": UserSerializer(clients, many=True).data,
        },
    })


@extend_schema(methods=['PUT'], summary='Update a user', request=UserSerializer, responses=UserSerializer, operation_id='user_detail_update')
@extend_schema(methods=['DELETE'], summary='Delete a user', responses=None, operation_id='user_detail_delete')
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail(request, id):
    if not request.user.is_superuser:
        return Response({
            "success": False,
            "message": "Admin only",
        }, status=403)

    user = get_object_or_404(User, id=id)

    if request.method == 'PUT':
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role')
        is_active = request.data.get('is_active')

        if username:
            if User.objects.filter(username=username).exclude(id=id).exists():
                return Response({
                    "success": False,
                    "message": "Username already in use",
                }, status=status.HTTP_400_BAD_REQUEST)
            user.username = username

        if email:
            if User.objects.filter(email=email).exclude(id=id).exists():
                return Response({
                    "success": False,
                    "message": "Email already in use",
                }, status=status.HTTP_400_BAD_REQUEST)
            user.email = email

        if password:
            user.set_password(password)

        if is_active is not None:
            if not isinstance(is_active, bool):
                return Response({
                    "success": False,
                    "message": "is_active must be a boolean",
                }, status=status.HTTP_400_BAD_REQUEST)
            user.is_active = is_active

        if role:
            if role == 'ADMIN':
                user.is_superuser = True
                user.is_staff = True
            elif role == 'AGENT':
                user.is_superuser = False
                user.is_staff = True
            elif role == 'CLIENT':
                user.is_superuser = False
                user.is_staff = False

        user.save()
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.gender = request.data.get('gender', profile.gender)
        profile.date_of_birth = request.data.get('date_of_birth') or None
        profile.phone_number = request.data.get('phone_number', profile.phone_number)
        profile.save()
        return Response({
            "success": True,
            "data": UserSerializer(user).data,
        })

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
