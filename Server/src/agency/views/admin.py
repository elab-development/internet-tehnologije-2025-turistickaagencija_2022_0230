from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Arrangement, Country, Destination, Hotel
from ..serializers import ArrangementSerializer, CountrySerializer, DestinationSerializer, HotelSerializer, UserSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if not request.user.is_superuser:
        return Response({
            "success": False,
            "message": "Admin only",
        }, status=403)

    return Response({
        "success": True,
        "data": {
            "stats": {
                "countries": Country.objects.count(),
                "destinations": Destination.objects.count(),
                "hotels": Hotel.objects.count(),
                "arrangements": Arrangement.objects.count(),
                "users": request.user.__class__.objects.count(),
            },
            "users": UserSerializer(request.user.__class__.objects.order_by('username'), many=True).data,
            "countries": CountrySerializer(Country.objects.order_by('name'), many=True).data,
            "destinations": DestinationSerializer(Destination.objects.select_related('country').order_by('name'), many=True).data,
            "hotels": HotelSerializer(Hotel.objects.select_related('destination').order_by('name'), many=True).data,
            "arrangements": ArrangementSerializer(Arrangement.objects.select_related('destination', 'hotel').order_by('name'), many=True).data,
        },
    })
