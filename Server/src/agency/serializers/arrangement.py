from rest_framework import serializers

from ..models import Arrangement, Destination, Hotel, Transport


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
        allow_null=True,
    )
    transport_id = serializers.PrimaryKeyRelatedField(
        queryset=Transport.objects.all(), source='transport', write_only=True,
        allow_null=True, required=False,
    )

    destination = serializers.SerializerMethodField(read_only=True)
    hotel = serializers.SerializerMethodField(read_only=True)
    transport = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Arrangement
        fields = [
            'id',
            'name',
            'destination',
            'destination_id',
            'hotel',
            'hotel_id',
            'transport',
            'transport_id',
            'start_date',
            'end_date',
            'number_of_nights',
            'price',
            'price_per_child',
            'capacity',
            'description',
            'included_services',
            'excluded_services',
            'meeting_point',
            'status',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_destination(self, obj):
        from .destination import DestinationSerializer

        return DestinationSerializer(obj.destination).data

    def get_hotel(self, obj):
        from .hotel import HotelSerializer

        return HotelSerializer(obj.hotel).data

    def get_transport(self, obj):
        from .transport import TransportSerializer

        return TransportSerializer(obj.transport).data if obj.transport else None

    def validate(self, data):
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError(
                "End date must be after start date."
            )
        hotel = data.get('hotel')
        destination = data.get('destination')
        if hotel and destination and hotel.destination_id != destination.id:
            raise serializers.ValidationError('Hotel must belong to the selected destination.')
        if data.get('number_of_nights', 0) != (data['end_date'] - data['start_date']).days:
            raise serializers.ValidationError('Number of nights must match the selected dates.')
        return data
