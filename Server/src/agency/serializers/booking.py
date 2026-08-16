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
            'total_price',
            'status',
            'payment_status',
            'booked_at',
        ]
        read_only_fields = ['id', 'user', 'total_price', 'status', 'payment_status', 'booked_at']

    def create(self, validated_data):
        arrangement = validated_data['arrangement']
        guests = validated_data.get('guests', 1)
        validated_data['total_price'] = arrangement.price * guests
        return super().create(validated_data)
