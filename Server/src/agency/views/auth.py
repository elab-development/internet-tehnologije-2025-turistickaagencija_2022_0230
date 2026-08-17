from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

from ..serializers import LoginSerializer, RegisterSerializer

logger = logging.getLogger(__name__)


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

    user = User.objects.filter(username=username).first()
    if user is None:
        user = User.objects.filter(email__iexact=username).first()

    if user is None or not user.check_password(password):
        return Response({
            "success": False,
            "data": None,
            "message": "Invalid username or password",
        }, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({
            "success": False,
            "data": None,
            "message": "Your account is not activated yet. Please check your email and verify your account before logging in.",
        }, status=status.HTTP_403_FORBIDDEN)

    user = authenticate(username=user.username, password=password)

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

    user = serializer.save()

    # make user inactive until email activation
    user.is_active = False
    user.save()

    # send activation email
    try:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        # build activation link for frontend
        frontend_base = getattr(settings, 'FRONTEND_URL', None)
        if frontend_base:
            frontend_activation_url = f"{frontend_base.rstrip('/')}/activate/{uid}/{token}"
        else:
            # fallback to request host
            frontend_activation_url = f"{request.scheme}://{request.get_host()}/activate/{uid}/{token}"
        subject = 'Activate your account'
        message = f'Please click the link to activate your account: {frontend_activation_url}'
        from_email = None
        recipient_list = [user.email]
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
    except Exception as e:
        # log error but continue
        logger.error(f'Failed to send activation email: {e}')

    return Response({
        "success": True,
        "data": {
            "message": "User registered successfully",
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def activate(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    if not uid or not token:
        return Response({"success": False, "message": "Missing uid or token"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        uid_decoded = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=uid_decoded)
    except Exception:
        return Response({"success": False, "message": "Invalid uid"}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({"success": False, "message": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = True
    user.save()

    # Return JWT token so frontend can log user in immediately
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
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = (request.data.get('email') or '').strip()

    if not email:
        return Response({
            "success": False,
            "message": "Email is required.",
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            "success": True,
            "message": "If an account with that email exists, a reset link has been sent.",
        })

    try:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_base = getattr(settings, 'FRONTEND_URL', None)
        if frontend_base:
            reset_url = f"{frontend_base.rstrip('/')}/password-reset/{uid}/{token}"
        else:
            reset_url = f"{request.scheme}://{request.get_host()}/password-reset/{uid}/{token}"

        subject = 'Reset your password'
        message = f'Please click the link to reset your password: {reset_url}'
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
    except Exception as exc:
        logger.error(f'Failed to send password reset email: {exc}')

    return Response({
        "success": True,
        "message": "If an account with that email exists, a reset link has been sent.",
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    if not uid or not token or not new_password:
        return Response({
            "success": False,
            "message": "Missing required fields.",
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({
            "success": False,
            "message": "Invalid reset token.",
        }, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({
            "success": False,
            "message": "Invalid or expired reset token.",
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({
            "success": False,
            "message": "Password must be at least 6 characters long.",
        }, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({
        "success": True,
        "message": "Password updated successfully.",
    })


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
