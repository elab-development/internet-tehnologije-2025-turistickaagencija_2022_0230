from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'ADMIN'
        if obj.is_staff:
            return 'AGENT'
        return 'CLIENT'


class DrzavaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drzava
        fields = '__all__'

class DestinacijaSerializer(serializers.ModelSerializer):
    drzava_id = serializers.PrimaryKeyRelatedField(
        queryset=Drzava.objects.all(),
        source='drzava',
        write_only=True
    )
    drzava = DrzavaSerializer(read_only=True)
    
    class Meta:
        model = Destinacija
        fields = ['id','naziv','drzava','drzava_id','slika']
    
        
class AranzmanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aranzman
        fields = '__all__'
    
    def validate(self, data):
        if data['datum_zavrsetka'] <= data['datum_pocetka']:
            raise serializers.ValidationError(
                "Datum završetka mora biti posle datuma početka."
            )
        return data

        
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("User already exists")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    

class HotelSerializer(serializers.ModelSerializer):
    destinacija_id = serializers.PrimaryKeyRelatedField(
        queryset=Destinacija.objects.all(),
        source='destinacija',
        write_only=True
    )
    
    destinacija = DestinacijaSerializer(read_only=True)
    
    class Meta:
        model = Hotel
        fields = [
            'id',
            'naziv',
            'slika',
            'ocena',
            'cena_nocenja',
            'destinacija',
            'destinacija_id'
        ]