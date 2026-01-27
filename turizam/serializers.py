from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

class DrzavaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drzava
        fields = '__all__'

class DestinacijaSerializer(serializers.ModelSerializer):
    drzava = DrzavaSerializer(read_only=True)
    
    class Meta:
        model = Destinacija
        fields = '__all__'
        
class AranzmanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aranzman
        fields = '__all__'
        
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