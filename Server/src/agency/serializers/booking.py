from rest_framework import serializers

from ..models import Arrangement, Booking
from .arrangement import ArrangementSerializer
from .user import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    arrangement = ArrangementSerializer(read_only=True)
    arrangement_id = serializers.PrimaryKeyRelatedField(
        queryset=Arrangement.objects.all(),
        source='arrangement',
        write_only=True,
    )

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'arrangement',
            'arrangement_id',
            'guests',
            'adults',
            'children',
            'unit_price',
            'total_price',
            'status',
            'payment_status',
            'booked_at',
            'cancelled_at',
            'notes',
        ]
        read_only_fields = ['id', 'user', 'guests', 'unit_price', 'total_price', 'status', 'payment_status', 'booked_at', 'cancelled_at']

    def validate(self, data):
        adults = data.get('adults', data.get('guests', 1))
        children = data.get('children', 0)
        if adults < 1:
            raise serializers.ValidationError({'adults': 'At least one adult is required.'})
        data['adults'] = adults
        data['children'] = children
        return data

    def create(self, validated_data):
        arrangement = validated_data['arrangement']
        adults = validated_data['adults']
        children = validated_data['children']
        child_price = arrangement.price_per_child if arrangement.price_per_child is not None else arrangement.price
        validated_data['guests'] = adults + children
        validated_data['unit_price'] = arrangement.price
        validated_data['total_price'] = arrangement.price * adults + child_price * children
        return super().create(validated_data)
