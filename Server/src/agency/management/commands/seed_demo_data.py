from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from agency.models import Arrangement, Booking, Country, Destination, Hotel


class Command(BaseCommand):
    help = 'Reset and populate the database with realistic travel data backed by files from media/. '

    def handle(self, *args, **options):
        Booking.objects.all().delete()
        Arrangement.objects.all().delete()
        Hotel.objects.all().delete()
        Destination.objects.all().delete()
        Country.objects.all().delete()

        country_specs = [
            'Serbia',
            'Greece',
            'Italy',
            'France',
            'Spain',
            'Czech Republic',
            'Germany',
            'North Macedonia',
        ]
        country_map = {
            name: Country.objects.create(name=name)
            for name in country_specs
        }

        destination_specs = [
            ('Belgrade', 'Serbia', 'destinations/berlin.jpeg'),
            ('Berlin', 'Germany', 'destinations/berlin.jpeg'),
            ('Athens', 'Greece', 'destinations/lefkada.jpg'),
            ('Paris', 'France', 'destinations/pariz.jpg'),
            ('Barcelona', 'Spain', 'destinations/barselona.jpg'),
            ('Prague', 'Czech Republic', 'destinations/prag.jpg'),
            ('Rome', 'Italy', 'destinations/rim.jpg'),
            ('Ohrid', 'North Macedonia', 'destinations/ohrid.jpg'),
            ('Lefkada', 'Greece', 'destinations/lefkada.jpg'),
        ]

        destination_map = {}
        for name, country_name, image in destination_specs:
            destination = Destination.objects.create(
                name=name,
                country=country_map.get(country_name, country_map['Serbia']),
                image=image,
            )
            destination_map[name] = destination

        hotel_specs = [
            ('Grand Hotel', 'Belgrade', 'hotels/grand.jpg', Decimal('4.8'), Decimal('180.00')),
            ('Berliner Palace', 'Berlin', 'hotels/grandium.jpg', Decimal('4.8'), Decimal('210.00')),
            ('Aegean View', 'Athens', 'hotels/cavaro.jpg', Decimal('4.9'), Decimal('220.00')),
            ('Parisian Charm', 'Paris', 'hotels/savoy.jpg', Decimal('4.9'), Decimal('260.00')),
            ('Barcelona Bay', 'Barcelona', 'hotels/plinn.jpg', Decimal('4.7'), Decimal('230.00')),
            ('Old Town Lodge', 'Prague', 'hotels/industriepalast.jpg', Decimal('4.6'), Decimal('190.00')),
            ('Roma Centro', 'Rome', 'hotels/grandium.jpg', Decimal('4.8'), Decimal('240.00')),
            ('Lake Pearl', 'Ohrid', 'hotels/sileks.jpg', Decimal('4.7'), Decimal('170.00')),
            ('Ionian Breeze', 'Lefkada', 'hotels/apostolis.jpg', Decimal('4.9'), Decimal('240.00')),
        ]

        hotel_map = {}
        for name, destination_name, image, rating, price in hotel_specs:
            hotel = Hotel.objects.create(
                name=name,
                destination=destination_map[destination_name],
                image=image,
                rating=rating,
                price_per_night=price,
            )
            hotel_map[name] = hotel

        arrangement_specs = [
            {
                'name': 'Belgrade City Break',
                'destination': 'Belgrade',
                'hotel': 'Grand Hotel',
                'start_date': date(2026, 9, 4),
                'end_date': date(2026, 9, 9),
                'price': Decimal('620.00'),
                'capacity': 4,
                'description': 'A 5-night city escape with lively nightlife, riverfront walks, and cozy cafe stops in the heart of the capital.',
            },
            {
                'name': 'Athens Coast & Culture',
                'destination': 'Athens',
                'hotel': 'Aegean View',
                'start_date': date(2026, 9, 12),
                'end_date': date(2026, 9, 18),
                'price': Decimal('880.00'),
                'capacity': 3,
                'description': 'Discover ancient landmarks, sunset dinners by the sea, and a relaxed island vibe across Athens and the coast.',
            },
            {
                'name': 'Paris in Bloom',
                'destination': 'Paris',
                'hotel': 'Parisian Charm',
                'start_date': date(2026, 10, 1),
                'end_date': date(2026, 10, 6),
                'price': Decimal('1240.00'),
                'capacity': 2,
                'description': 'Romantic strolls through Paris, museum visits, and refined boutique accommodations for a classic European getaway.',
            },
            {
                'name': 'Barcelona Beach Escape',
                'destination': 'Barcelona',
                'hotel': 'Barcelona Bay',
                'start_date': date(2026, 10, 8),
                'end_date': date(2026, 10, 15),
                'price': Decimal('1090.00'),
                'capacity': 4,
                'description': 'Sun, beaches, and architecture in one of Europe’s most vibrant coastal cities.',
            },
            {
                'name': 'Prague Old Town Story',
                'destination': 'Prague',
                'hotel': 'Old Town Lodge',
                'start_date': date(2026, 10, 18),
                'end_date': date(2026, 10, 24),
                'price': Decimal('930.00'),
                'capacity': 3,
                'description': 'Walk the icon streets of Prague, enjoy classic cuisine, and discover medieval charm and hidden courtyards.',
            },
            {
                'name': 'Rome Eternal Journey',
                'destination': 'Rome',
                'hotel': 'Roma Centro',
                'start_date': date(2026, 11, 2),
                'end_date': date(2026, 11, 8),
                'price': Decimal('1180.00'),
                'capacity': 2,
                'description': 'A history-rich escape with ancient monuments, trattorias, and unforgettable sunsets around the Colosseum.',
            },
            {
                'name': 'Ohrid Lake Retreat',
                'destination': 'Ohrid',
                'hotel': 'Lake Pearl',
                'start_date': date(2026, 11, 10),
                'end_date': date(2026, 11, 15),
                'price': Decimal('760.00'),
                'capacity': 2,
                'description': 'Relax by the lake, wander the old town, and enjoy calm days filled with scenic views and local flavor.',
            },
            {
                'name': 'Lefkada Island Bliss',
                'destination': 'Lefkada',
                'hotel': 'Ionian Breeze',
                'start_date': date(2026, 11, 20),
                'end_date': date(2026, 11, 27),
                'price': Decimal('990.00'),
                'capacity': 4,
                'description': 'Crystal waters, hidden coves, and a laid-back island rhythm that makes every day feel like a holiday.',
            },
            {
                'name': 'Paris Art & Wine Week',
                'destination': 'Paris',
                'hotel': 'Parisian Charm',
                'start_date': date(2026, 12, 3),
                'end_date': date(2026, 12, 10),
                'price': Decimal('1320.00'),
                'capacity': 2,
                'description': 'An indulgent cultural break centered on galleries, wine bars, and elegant strolls through the city’s most iconic neighborhoods.',
            },
            {
                'name': 'Barcelona Family Weekend',
                'destination': 'Barcelona',
                'hotel': 'Barcelona Bay',
                'start_date': date(2026, 12, 12),
                'end_date': date(2026, 12, 18),
                'price': Decimal('1170.00'),
                'capacity': 5,
                'description': 'Perfect for families seeking modern beaches, local food, and plenty of open-air entertainment without the rush.',
            },
            {
                'name': 'Rome Gourmet Escape',
                'destination': 'Rome',
                'hotel': 'Roma Centro',
                'start_date': date(2027, 1, 9),
                'end_date': date(2027, 1, 14),
                'price': Decimal('1010.00'),
                'capacity': 2,
                'description': 'Sample Roman classics, discover hidden courtyards, and enjoy a slow trip through the timeless history of the city.',
            },
            {
                'name': 'Berlin Design Nights',
                'destination': 'Berlin',
                'hotel': 'Grand Hotel',
                'start_date': date(2027, 1, 20),
                'end_date': date(2027, 1, 26),
                'price': Decimal('980.00'),
                'capacity': 3,
                'description': 'A modern urban escape filled with design, nightlife, galleries, and a cosmopolitan atmosphere that never slows down.',
            },
        ]

        for spec in arrangement_specs:
            destination_name = spec['destination']
            hotel_name = spec['hotel']
            delta_days = (spec['end_date'] - spec['start_date']).days
            Arrangement.objects.create(
                name=spec['name'],
                destination=destination_map[destination_name],
                hotel=hotel_map.get(hotel_name, list(hotel_map.values())[0]),
                start_date=spec['start_date'],
                end_date=spec['end_date'],
                number_of_nights=delta_days,
                price=spec['price'],
                capacity=spec['capacity'],
                description=spec['description'],
            )

        User = get_user_model()
        user_specs = [
            ('marko', 'marko@example.com', 'Marko123!'),
            ('ana', 'ana@example.com', 'Ana123!'),
            ('petar', 'petar@example.com', 'Petar123!'),
        ]

        created_users = []
        for username, email, password in user_specs:
            user, _ = User.objects.get_or_create(username=username, defaults={'email': email})
            user.email = email
            if not user.has_usable_password():
                user.set_password(password)
            user.save()
            created_users.append(user)

        if created_users:
            bookings = [
                (created_users[0], 'Belgrade City Break', 2, Decimal('1240.00')),
                (created_users[1], 'Paris in Bloom', 2, Decimal('2480.00')),
                (created_users[2], 'Barcelona Beach Escape', 3, Decimal('3270.00')),
            ]
            for user, arrangement_name, guests, total_price in bookings:
                arrangement = Arrangement.objects.get(name=arrangement_name)
                Booking.objects.create(
                    user=user,
                    arrangement=arrangement,
                    guests=guests,
                    total_price=total_price,
                    status='PENDING',
                    payment_status='UNPAID',
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Seed complete: {Country.objects.count()} countries, '
                f'{Destination.objects.count()} destinations, '
                f'{Hotel.objects.count()} hotels, '
                f'{Arrangement.objects.count()} arrangements, '
                f'{Booking.objects.count()} bookings.'
            )
        )
