from datetime import date

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from agency.models import Arrangement, Booking, Country, Destination, Hotel


class ArrangementIntegrationTests(TestCase):
    def setUp(self):
        self.agent = User.objects.create_user(
            username='agent1',
            email='agent1@example.com',
            password='AgentPass123!',
            is_staff=True,
        )
        self.country = Country.objects.create(name='Testland')
        self.destination = Destination.objects.create(name='Test City', country=self.country)
        self.hotel = Hotel.objects.create(
            name='Test Hotel',
            destination=self.destination,
            rating='4.5',
            price_per_night='100.00',
        )
        self.arrangement = Arrangement.objects.create(
            name='Existing Trip',
            created_by=self.agent,
            destination=self.destination,
            hotel=self.hotel,
            start_date=date(2027, 1, 1),
            end_date=date(2027, 1, 8),
            number_of_nights=7,
            price='500.00',
            capacity=2,
        )

    def auth_headers(self):
        token = RefreshToken.for_user(self.agent).access_token
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def test_agent_can_create_arrangement(self):
        response = self.client.post(
            '/api/arrangements/',
            {
                'name': 'New Trip',
                'destination_id': self.destination.id,
                'hotel_id': self.hotel.id,
                'start_date': '2027-02-01',
                'end_date': '2027-02-08',
                'number_of_nights': 7,
                'price': '400.00',
                'capacity': 3,
                'description': 'A new trip',
            },
            content_type='application/json',
            **self.auth_headers(),
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Arrangement.objects.filter(name='New Trip').exists())
        self.assertEqual(Arrangement.objects.get(name='New Trip').created_by, self.agent)

    def test_agent_only_sees_and_manages_own_arrangements(self):
        other_agent = User.objects.create_user(
            username='agent2',
            password='AgentPass123!',
            is_staff=True,
        )
        other_arrangement = Arrangement.objects.create(
            name='Other Agent Trip',
            created_by=other_agent,
            destination=self.destination,
            hotel=self.hotel,
            start_date=date(2027, 2, 1),
            end_date=date(2027, 2, 8),
            number_of_nights=7,
            price='500.00',
            capacity=2,
        )

        response = self.client.get('/api/arrangements/', **self.auth_headers())
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.json()], [self.arrangement.id])

        response = self.client.delete(
            f'/api/arrangements/{other_arrangement.id}/',
            **self.auth_headers(),
        )
        self.assertEqual(response.status_code, 404)

    def test_agent_only_sees_bookings_for_own_arrangements(self):
        other_agent = User.objects.create_user(
            username='agent2',
            password='AgentPass123!',
            is_staff=True,
        )
        other_arrangement = Arrangement.objects.create(
            name='Other Agent Trip',
            created_by=other_agent,
            destination=self.destination,
            hotel=self.hotel,
            start_date=date(2027, 2, 1),
            end_date=date(2027, 2, 8),
            number_of_nights=7,
            price='500.00',
            capacity=2,
        )
        client_user = User.objects.create_user(username='client', password='ClientPass123!')
        own_booking = Booking.objects.create(
            user=client_user, arrangement=self.arrangement, total_price='500.00'
        )
        other_booking = Booking.objects.create(
            user=client_user, arrangement=other_arrangement, total_price='500.00'
        )

        response = self.client.get('/api/agent/bookings/', **self.auth_headers())
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.json()['data']], [own_booking.id])

        response = self.client.put(
            f'/api/agent/bookings/{other_booking.id}/',
            {'status': 'CONFIRMED'},
            content_type='application/json',
            **self.auth_headers(),
        )
        self.assertEqual(response.status_code, 404)

    def test_agent_can_update_and_delete_arrangement(self):
        response = self.client.put(
            f'/api/arrangements/{self.arrangement.id}/',
            {
                'name': 'Updated Trip',
                'destination_id': self.destination.id,
                'hotel_id': self.hotel.id,
                'start_date': '2027-01-01',
                'end_date': '2027-01-08',
                'number_of_nights': 7,
                'price': '550.00',
                'capacity': 2,
                'description': '',
            },
            content_type='application/json',
            **self.auth_headers(),
        )
        self.assertEqual(response.status_code, 200)
        self.arrangement.refresh_from_db()
        self.assertEqual(self.arrangement.name, 'Updated Trip')

        response = self.client.delete(
            f'/api/arrangements/{self.arrangement.id}/',
            **self.auth_headers(),
        )
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Arrangement.objects.filter(id=self.arrangement.id).exists())

    def test_agent_cannot_create_hotel_or_destination(self):
        hotel_response = self.client.post(
            '/api/hotels/',
            {
                'name': 'Unauthorized Hotel',
                'destination_id': self.destination.id,
                'rating': '4.0',
                'price_per_night': '90.00',
            },
            content_type='application/json',
            **self.auth_headers(),
        )
        self.assertEqual(hotel_response.status_code, 403)

        destination_response = self.client.post(
            '/api/destinations/',
            {'name': 'Unauthorized Destination', 'country_id': self.country.id},
            content_type='application/json',
            **self.auth_headers(),
        )
        self.assertEqual(destination_response.status_code, 403)

    def test_anonymous_cannot_create_arrangement(self):
        response = self.client.post(
            '/api/arrangements/',
            {
                'name': 'Sneaky Trip',
                'destination_id': self.destination.id,
                'hotel_id': self.hotel.id,
                'start_date': '2027-03-01',
                'end_date': '2027-03-08',
                'number_of_nights': 7,
                'price': '300.00',
                'capacity': 1,
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 401)
