from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from ..models import Destination, Hotel


class HotelSerializer(serializers.ModelSerializer):
    destination_id = serializers.PrimaryKeyRelatedField(
        queryset=Destination.objects.all(),
        source='destination',
        write_only=True,
    )
    destination = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Hotel
        fields = [
            'id',
            'name',
            'image',
            'rating',
            'price_per_night',
            'address',
            'description',
            'stars',
            'amenities',
            'phone_number',
            'email',
            'latitude',
            'longitude',
            'is_active',
            'destination',
            'destination_id',
        ]

    @extend_schema_field(dict)
    def get_destination(self, obj):
        from .destination import DestinationSerializer

        return DestinationSerializer(obj.destination).data
