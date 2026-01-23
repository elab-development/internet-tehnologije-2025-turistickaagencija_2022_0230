from rest_framework import serializers
from .models import Destinacija, Aranzman

class DestinacijaSerializer(serializers.ModelSerializer):
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