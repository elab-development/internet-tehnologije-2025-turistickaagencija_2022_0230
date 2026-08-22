from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from agency.models import Arrangement, Booking, Country, Destination, Hotel, Transport, UserProfile


class Command(BaseCommand):
    help = 'Populate missing values introduced by the expanded data model.'

    def handle(self, *args, **options):
        with transaction.atomic():
            self.populate_countries()
            self.populate_destinations()
            self.populate_hotels()
            transports = self.populate_transports()
            self.populate_arrangements(transports)
            self.populate_profiles()
            self.populate_bookings()

        self.stdout.write(self.style.SUCCESS(
            f'Database populated: {Country.objects.count()} countries, '
            f'{Destination.objects.count()} destinations, '
            f'{Hotel.objects.count()} hotels, '
            f'{Transport.objects.count()} transports, '
            f'{Arrangement.objects.count()} arrangements, '
            f'{UserProfile.objects.count()} profiles, '
            f'{Booking.objects.count()} bookings.'
        ))

    def populate_countries(self):
        iso_codes = {
            'Serbia': 'RS', 'Greece': 'GR', 'Italy': 'IT', 'France': 'FR',
            'Spain': 'ES', 'Czech Republic': 'CZ', 'Germany': 'DE',
            'North Macedonia': 'MK',
        }
        descriptions = {
            'Serbia': 'A Balkan destination known for historic cities, rivers and vibrant culture.',
            'Greece': 'Mediterranean country with ancient heritage, islands and clear seas.',
            'Italy': 'A country of art, history, regional cuisine and remarkable landscapes.',
            'France': 'A European destination celebrated for culture, gastronomy and architecture.',
            'Spain': 'A lively destination with beaches, historic cities and diverse regional traditions.',
            'Czech Republic': 'A Central European destination with historic towns and rich architectural heritage.',
            'Germany': 'A country combining modern cities, historic landmarks and varied natural scenery.',
            'North Macedonia': 'A Balkan destination with mountain landscapes, lakes and historic towns.',
        }
        for country in Country.objects.all():
            country.iso_code = country.iso_code or iso_codes.get(country.name)
            country.description = country.description or descriptions.get(country.name, '')
            country.save(update_fields=['iso_code', 'description'])

    def populate_destinations(self):
        destination_data = {
            'Belgrade': ('Belgrade', 'A lively capital where rivers, history and modern culture meet.', Decimal('44.7866'), Decimal('20.4489')),
            'Berlin': ('Berlin', 'A creative capital filled with museums, memorials, galleries and nightlife.', Decimal('52.5200'), Decimal('13.4050')),
            'Athens': ('Athens', 'A historic Mediterranean city combining ancient landmarks with coastal life.', Decimal('37.9838'), Decimal('23.7275')),
            'Paris': ('Paris', 'The city of art, elegant boulevards, museums and memorable cuisine.', Decimal('48.8566'), Decimal('2.3522')),
            'Barcelona': ('Barcelona', 'A coastal city known for Gaudi architecture, beaches and lively neighborhoods.', Decimal('41.3874'), Decimal('2.1686')),
            'Prague': ('Prague', 'A historic Central European city of bridges, squares and preserved architecture.', Decimal('50.0755'), Decimal('14.4378')),
            'Rome': ('Rome', 'An open-air history book with ancient monuments, piazzas and Roman cuisine.', Decimal('41.9028'), Decimal('12.4964')),
            'Ohrid': ('Ohrid', 'A lakeside town with clear water, historic churches and mountain views.', Decimal('41.1231'), Decimal('20.8016')),
            'Lefkada': ('Lefkada', 'An Ionian island with turquoise bays, beaches and relaxed coastal villages.', Decimal('38.8334'), Decimal('20.7069')),
        }
        for destination in Destination.objects.all():
            city, description, latitude, longitude = destination_data.get(
                destination.name, (destination.name, '', None, None)
            )
            destination.city = destination.city or city
            destination.description = destination.description or description
            destination.latitude = destination.latitude or latitude
            destination.longitude = destination.longitude or longitude
            destination.save(update_fields=['city', 'description', 'latitude', 'longitude'])

    def populate_hotels(self):
        amenities = 'Wi-Fi, breakfast, reception, air conditioning'
        for hotel in Hotel.objects.select_related('destination'):
            hotel.address = hotel.address or f'Central {hotel.destination.name}'
            hotel.description = hotel.description or f'{hotel.name} offers comfortable accommodation in {hotel.destination.name}.'
            hotel.stars = hotel.stars or min(5, max(3, round(float(hotel.rating))))
            hotel.amenities = hotel.amenities or amenities
            hotel.phone_number = hotel.phone_number or '+381 11 555 010'
            hotel.email = hotel.email or f'info@{hotel.name.lower().replace(" ", "")}.example.com'
            hotel.save(update_fields=['address', 'description', 'stars', 'amenities', 'phone_number', 'email'])

    def populate_transports(self):
        transport_specs = [
            ('Balkan Bus Lines', 'BUS', 'Touring coach', 'Belgrade Bus Station', 'European destinations'),
            ('Air Serbia', 'PLANE', 'Passenger aircraft', 'Belgrade Airport', 'International airports'),
            ('EuroRail', 'TRAIN', 'InterCity train', 'Central railway station', 'European city centres'),
        ]
        transports = {}
        for company, transport_type, vehicle, departure, arrival in transport_specs:
            transport, _ = Transport.objects.get_or_create(
                company_name=company,
                transport_type=transport_type,
                defaults={
                    'vehicle_name': vehicle,
                    'departure_location': departure,
                    'arrival_location': arrival,
                    'description': f'{company} service for organised tourist arrangements.',
                },
            )
            transports[transport_type] = transport
        return transports

    def populate_arrangements(self, transports):
        plane_destinations = {'Paris', 'Barcelona', 'Rome', 'Berlin'}
        for arrangement in Arrangement.objects.select_related('destination', 'hotel'):
            if arrangement.hotel and arrangement.hotel.destination_id != arrangement.destination_id:
                matching_hotel = arrangement.destination.hotels.filter(is_active=True).first()
                if matching_hotel:
                    arrangement.hotel = matching_hotel
            arrangement.price_per_child = arrangement.price_per_child or (arrangement.price * Decimal('0.75')).quantize(Decimal('0.01'))
            arrangement.included_services = arrangement.included_services or 'Accommodation, transfer, travel assistance'
            arrangement.excluded_services = arrangement.excluded_services or 'Personal expenses and optional excursions'
            arrangement.meeting_point = arrangement.meeting_point or 'Main departure station'
            arrangement.transport = arrangement.transport or transports['PLANE' if arrangement.destination.name in plane_destinations else 'BUS']
            arrangement.save(update_fields=[
                'hotel', 'price_per_child', 'included_services', 'excluded_services',
                'meeting_point', 'transport',
            ])

    def populate_profiles(self):
        User = get_user_model()
        for user in User.objects.all():
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'gender': 'PREFER_NOT_TO_SAY',
                    'date_of_birth': date(1990, 1, 1),
                },
            )

    def populate_bookings(self):
        for booking in Booking.objects.select_related('arrangement'):
            if booking.adults + booking.children != booking.guests:
                booking.adults = booking.guests
                booking.children = 0
            booking.unit_price = booking.unit_price or booking.arrangement.price
            booking.save(update_fields=['adults', 'children', 'unit_price'])