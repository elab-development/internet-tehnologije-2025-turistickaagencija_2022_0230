from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Destinacija, Aranzman
from .serializers import *

# Create your views here.

# LOGIN
@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
         "succes": False,
         "data": None,
         "message": "Validation error",
         "errors": serializer.errors  
        }, status=status.HTTP_400_BAD_REQUEST)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response({
            "success": False,
            "data": None,
            "message": "Invalid username or password"
        }, status=status.HTTP_401_UNAUTHORIZED)
        
    refresh = RefreshToken.for_user(user)
    
    return Response({
        "success": True,
        "data": {
            "user": {
                "id": 1,
                "username": user.username,
                "email": user.email,
            },
            "token": str(refresh.access_token)
        }
    }, status=status.HTTP_200_OK)

#--------------------------------------------------
# REGISTER
@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            "success": False,
            "data": None,
            "message": "Validation error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    user = serializer.save()
    
    return Response({
        "success": True,
        "data": {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        },
        "message": "User registered successfully"
    }, status=status.HTTP_201_CREATED)

#---------------------------------------------------
# /ME ENDPOINT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        "success": True,
        "data": {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }
    })

#------------------------------------------------
# ZAHTEVI ZA DESTINACIJE
@api_view(['GET','POST'])
def destinacije(request):
    if request.method == 'GET':
        data = Destinacija.objects.all()
        serializer = DestinacijaSerializer(data, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = DestinacijaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#---------------------------------------------------------------------------------
# ZAHTEVI SA PROSLEDJENIM ID-EM DESTINACIJE
@api_view(['GET','PUT','DELETE'])
def destinacija_detail(request, id):
    destinacija = get_object_or_404(Destinacija,id=id)
    
    if request.method == 'GET':
        serializer = DestinacijaSerializer(destinacija)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = DestinacijaSerializer(destinacija, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
    elif request.method == 'DELETE':
        destinacija.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# -----------------------------------------------------------
# ZAHTEVI ZA ARANZMANE

@api_view(['GET','POST'])
#@permission_classes([IsAuthenticated])
def aranzmani(request):
    if request.method == 'GET':
        aranzmani = Aranzman.objects.all()
        serializer = AranzmanSerializer(aranzmani, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = AranzmanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#---------------------------------------------------------------------------------
# ZAHTEVI SA PROSLEDJENIM ID-EM ARANZMANA   
     
@api_view(['GET','PUT','DELETE'])
#@permission_classes([IsAuthenticated])    
def aranzman_detail(request, id):
    aranzman = get_object_or_404(Aranzman,id=id)
    
    if request.method == 'GET':
        serializer = AranzmanSerializer(aranzman)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = AranzmanSerializer(aranzman, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
    
    elif request.method == 'DELETE':
        aranzman.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)