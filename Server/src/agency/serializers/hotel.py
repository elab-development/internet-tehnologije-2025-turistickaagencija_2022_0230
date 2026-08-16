from rest_framework import serializers

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
            'destination',
            'destination_id',
        ]

    def get_destination(self, obj):
        from .destination import DestinationSerializer

        return DestinationSerializer(obj.destination).data
