from rest_framework import serializers

from ..models import Arrangement, Destination, Hotel


class ArrangementSerializer(serializers.ModelSerializer):
    destination_id = serializers.PrimaryKeyRelatedField(
        queryset=Destination.objects.all(),
        source='destination',
        write_only=True,
    )
    hotel_id = serializers.PrimaryKeyRelatedField(
        queryset=Hotel.objects.all(),
        source='hotel',
        write_only=True,
    )

    destination = serializers.SerializerMethodField(read_only=True)
    hotel = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Arrangement
        fields = [
            'id',
            'name',
            'destination',
            'destination_id',
            'hotel',
            'hotel_id',
            'start_date',
            'end_date',
            'number_of_nights',
            'price',
            'capacity',
            'description',
        ]

    def get_destination(self, obj):
        from .destination import DestinationSerializer

        return DestinationSerializer(obj.destination).data

    def get_hotel(self, obj):
        from .hotel import HotelSerializer

        return HotelSerializer(obj.hotel).data

    def validate(self, data):
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError(
                "End date must be after start date."
            )
        return data
