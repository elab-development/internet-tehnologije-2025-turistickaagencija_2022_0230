from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from ..serializers import LoginSerializer, RegisterSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            "success": False,
            "data": None,
            "message": "Validation error",
            "errors": serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({
            "success": False,
            "data": None,
            "message": "Invalid username or password",
        }, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)

    if user.is_superuser:
        role = 'ADMIN'
    elif user.is_staff:
        role = 'AGENT'
    else:
        role = 'CLIENT'

    return Response({
        "success": True,
        "data": {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": role,
            },
            "token": str(refresh.access_token),
        },
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            "success": False,
            "data": None,
            "message": "Validation error",
            "errors": serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer.save()

    return Response({
        "success": True,
        "data": {
            "message": "User registered successfully",
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    if user.is_superuser:
        role = 'ADMIN'
    elif user.is_staff:
        role = 'AGENT'
    else:
        role = 'CLIENT'

    return Response({
        "success": True,
        "data": {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": role,
            },
        },
    })
