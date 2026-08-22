from rest_framework import serializers

from ..models import Transport


class TransportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transport
        fields = [
            'id', 'company_name', 'transport_type', 'vehicle_name',
            'departure_location', 'arrival_location', 'description', 'is_active',
        ]