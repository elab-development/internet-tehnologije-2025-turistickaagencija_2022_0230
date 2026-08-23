from datetime import date
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from agency.models import Arrangement, Booking, Country, Destination, Hotel


class AdminIntegrationTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='Admin123!',
        )
        self.agent = User.objects.create_user(
            username='agent',
            email='agent@example.com',
            password='Agent123!',
            is_staff=True,
        )
        self.client_user = User.objects.create_user(
            username='client',
            email='client@example.com',
            password='Client123!',
        )
        country = Country.objects.create(name='Testland')
        destination = Destination.objects.create(name='Test City', country=country)
        hotel = Hotel.objects.create(
            name='Test Hotel',
            destination=destination,
            rating=Decimal('4.5'),
            price_per_night=Decimal('100.00'),
        )
        self.arrangement = Arrangement.objects.create(
            name='Admin Trip',
            destination=destination,
            hotel=hotel,
            start_date=date(2027, 1, 1),
            end_date=date(2027, 1, 8),
            number_of_nights=7,
            price=Decimal('500.00'),
            capacity=4,
        )
        self.booking = Booking.objects.create(
            user=self.client_user,
            arrangement=self.arrangement,
            guests=1,
            adults=1,
            children=0,
            unit_price=Decimal('500.00'),
            total_price=Decimal('500.00'),
        )

    def auth_headers(self, user):
        token = RefreshToken.for_user(user).access_token
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def test_admin_dashboard_returns_statistics(self):
        response = self.client.get(
            '/api/admin/dashboard/',
            **self.auth_headers(self.admin),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['stats']['bookings'], 1)
        self.assertEqual(response.json()['data']['stats']['users'], 3)

    def test_non_admin_cannot_access_admin_dashboard(self):
        response = self.client.get(
            '/api/admin/dashboard/',
            **self.auth_headers(self.agent),
        )

        self.assertEqual(response.status_code, 403)

    def test_admin_can_update_booking_status(self):
        response = self.client.put(
            f'/api/admin/bookings/{self.booking.id}/',
            {'status': 'CONFIRMED'},
            content_type='application/json',
            **self.auth_headers(self.admin),
        )

        self.assertEqual(response.status_code, 200)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, 'CONFIRMED')

    def test_non_admin_cannot_manage_bookings(self):
        response = self.client.get(
            '/api/admin/bookings/',
            **self.auth_headers(self.agent),
        )

        self.assertEqual(response.status_code, 403)
