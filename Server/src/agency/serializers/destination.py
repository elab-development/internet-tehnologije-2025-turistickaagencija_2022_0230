from rest_framework import serializers

from ..models import Country, Destination


class DestinationSerializer(serializers.ModelSerializer):
    country_id = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(),
        source='country',
        write_only=True,
    )
    country = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Destination
        fields = ['id', 'name', 'country', 'country_id', 'image']

    def get_country(self, obj):
        from .country import CountrySerializer

        return CountrySerializer(obj.country).data


class TopDestinationSerializer(serializers.Serializer):
    destination = DestinationSerializer()
    arrangement_count = serializers.IntegerField()
