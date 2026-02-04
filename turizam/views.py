from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Destinacija, Aranzman
from .serializers import *
from datetime import timedelta
from django.utils.dateparse import parse_date
from django.db.models import Count

# Create your views here.

# LOGIN
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
         "success": False,
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
@permission_classes([AllowAny])
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
            "message": "User registered successfully"
        },
    }, status=status.HTTP_201_CREATED)

#---------------------------------------------------
# /ME ENDPOINT
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
                "role": role
            }
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users(request):
    if not request.user.is_superuser:
        return Response({
            "success": False,
            "message": "Admin only"
        }, status=403)

    admins = User.objects.filter(is_superuser=True)
    agents = User.objects.filter(is_staff=True, is_superuser=False)
    clients = User.objects.filter(is_staff=False, is_superuser=False)

    return Response({
        "success": True,
        "data": {
            "admins": UserSerializer(admins, many=True).data,
            "agents": UserSerializer(agents, many=True).data,
            "clients": UserSerializer(clients, many=True).data
        }
    })


#------------------------------------------------
# ZAHTEVI ZA DESTINACIJE
@api_view(['GET','POST'])
def destinacije(request):
    if request.method == 'GET':
        data = Destinacija.objects.all()
        serializer = DestinacijaSerializer(data, many=True)
        return Response({"success": True, "data": serializer.data})
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(
                {"success": False, "message": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not (request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
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
    
    if not request.user.is_authenticated:
        return Response(
            {"success": False, "message": "Authentication required"}, 
            status=status.HTTP_401_UNAUTHORIZED
            )

    if request.method == 'PUT':
        if not (request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = DestinacijaSerializer(destinacija, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
    elif request.method == 'DELETE':
        if not request.user.is_superuser:
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        destinacija.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# -----------------------------------------------------------   
# ZAHTEVI ZA TOP DESTINACIJE

@api_view(['GET'])
def top_destinacije(request):
    destinacije = (
        Destinacija.objects
        .annotate(broj_aranzmana=Count('aranzmani'))
        .order_by('-broj_aranzmana')[:8]
    )

    serializer = DestinacijaSerializer(destinacije, many=True)
    return Response({
        "success": True,
        "data": serializer.data
    })

# -----------------------------------------------------------
# ZAHTEVI ZA ARANZMANE

@api_view(['GET','POST'])
def aranzmani(request):
    if request.method == 'GET':
        aranzmani = Aranzman.objects.all()
        serializer = AranzmanSerializer(aranzmani, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(
                {"success": False, "message": "Authentication required"},
                  status=status.HTTP_401_UNAUTHORIZED
                )

        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )        
        
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
    
    if not request.user.is_authenticated:
            return Response(
                {"success": False, "message": "Authentication required"},
                  status=status.HTTP_401_UNAUTHORIZED
                )
    
    elif request.method == 'PUT':
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            ) 
        
        serializer = AranzmanSerializer(aranzman, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
    
    elif request.method == 'DELETE':
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            ) 
        
        aranzman.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
#------------------------------------------------------------------------
# ZAHTEV ZA TOP ARANZMANE
@api_view(['GET'])
def top_aranzmani(request):
    aranzmani = (
        Aranzman.objects.order_by('-hotel__ocena')[:8]
    )
    
    serializer = AranzmanSerializer(aranzmani, many=True)
    return Response({
        "success": True,
        "data": serializer.data
    })

#---------------------------------------------------------------
# ZAHTEVI ZA FILTRIRANE ARANZMANE
@api_view(['POST'])
def aranzmani_filter(request):
    queryset = Aranzman.objects.all()
    
    destinacija_id = request.data.get('destinacija_id')
    datum_pocetka = request.data.get('datum_pocetka')
    datum_zavrsetka = request.data.get('datum_zavrsetka')
    broj_mesta = request.data.get('broj_mesta')
    
    if destinacija_id:
        queryset = queryset.filter(destinacija_id=destinacija_id)
        
    if datum_pocetka and datum_zavrsetka:
        queryset = queryset.filter(
            datum_pocetka__gte=datum_pocetka,
            datum_zavrsetka__lte=datum_zavrsetka
        )
    elif datum_pocetka:
        start = parse_date(datum_pocetka)
        end = start + timedelta(days=30)
        
        queryset = queryset.filter(
            datum_pocetka__gte=start,
            datum_zavrsetka__lte=end
        )
    elif datum_zavrsetka:
        end = parse_date(datum_zavrsetka)
        start = end - timedelta(days=30)
        
        queryset = queryset.filter(
            datum_zavrsetka__lte=end,
            datum_pocetka__gte=start
        )
    
    if broj_mesta:
        queryset = queryset.filter(broj_mesta__gte=broj_mesta)
    
    serializer = AranzmanSerializer(queryset, many=True)
    
    return Response({
        "success": True,
        "data": serializer.data
    })

#------------------------------------------------
# ZAHTEVI ZA DRZAVE
@api_view(['GET','POST'])
def drzave(request):
    if request.method == 'GET':
        data = Drzava.objects.all()
        serializer = DrzavaSerializer(data, many=True)
        return Response({"success": True, "data": serializer.data})
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(
                {"success": False, "message": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not (request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = DrzavaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#---------------------------------------------------------------------------------
# ZAHTEVI SA PROSLEDJENIM ID-EM DRZAVE
@api_view(['GET','PUT','DELETE'])
def drzava_detail(request, id):
    drzava = get_object_or_404(Drzava,id=id)
    
    if request.method == 'GET':
        serializer = DrzavaSerializer(drzava)
        return Response(serializer.data)
    
    if not request.user.is_authenticated:
        return Response(
            {"success": False, "message": "Authentication required"}, 
              status=status.HTTP_401_UNAUTHORIZED
            )

    if request.method == 'PUT':
        if not (request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = DrzavaSerializer(drzava, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
    elif request.method == 'DELETE':
        if not request.user.is_superuser:
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        drzava.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

#-----------------------------------------------------------------------
# ZAHTEVI ZA HOTELE
@api_view(['GET', 'POST'])
def hoteli(request):
    if request.method == 'GET':
        hoteli = Hotel.objects.all()
        serializer = HotelSerializer(hoteli, many=True)
        return Response(serializer.data)

    if not request.user.is_authenticated:
        return Response(
            {"success": False, "message": "Authentication required"}, 
              status=status.HTTP_401_UNAUTHORIZED
            )

    if request.method == 'POST':
        if not (request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = HotelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#--------------------------------------------------------------------------------
# ZAHTEVI SA PROSLEDJENIM ID-JEM HOTELA
@api_view(['GET', 'PUT', 'DELETE'])
def hotel_detail(request, id):
    hotel = get_object_or_404(Hotel, id=id)

    if request.method == 'GET':
        serializer = HotelSerializer(hotel)
        return Response(serializer.data)
    
    if not request.user.is_authenticated:
        return Response(
            {"success": False, "message": "Authentication required"}, 
              status=status.HTTP_401_UNAUTHORIZED
            )
    
    if not (request.user.is_superuser):
            return Response(
                {"success": False, "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

    if request.method == 'PUT':
        serializer = HotelSerializer(hotel, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        hotel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


