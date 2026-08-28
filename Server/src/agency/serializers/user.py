from django.contrib.auth.models import User
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'profile']

    @extend_schema_field(dict)
    def get_profile(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile is None:
            return None
        return {
            'gender': profile.gender,
            'date_of_birth': profile.date_of_birth,
            'phone_number': profile.phone_number,
            'created_at': profile.created_at,
        }

    @extend_schema_field(str)
    def get_role(self, obj):
        if obj.is_superuser:
            return 'ADMIN'
        if obj.is_staff:
            return 'AGENT'
        return 'CLIENT'
