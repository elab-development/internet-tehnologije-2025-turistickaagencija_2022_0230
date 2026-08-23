from datetime import date
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from agency.models import Arrangement, Booking, Country, Destination, Hotel


class BookingIntegrationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='traveler',
            email='traveler@example.com',
            password='Traveler123!',
        )
        self.other_user = User.objects.create_user(
            username='other',
            email='other@example.com',
            password='Other123!',
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
            name='Limited Trip',
            destination=destination,
            hotel=hotel,
            start_date=date(2027, 1, 1),
            end_date=date(2027, 1, 8),
            number_of_nights=7,
            price=Decimal('500.00'),
            capacity=2,
        )

    def auth_headers(self, user=None):
        token = RefreshToken.for_user(user or self.user).access_token
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def create_booking(self, user=None, adults=1, children=0):
        return self.client.post(
            '/api/bookings/',
            {
                'arrangement_id': self.arrangement.id,
                'adults': adults,
                'children': children,
            },
            content_type='application/json',
            **self.auth_headers(user),
        )

    def test_authenticated_user_can_create_booking_with_calculated_total(self):
        response = self.create_booking(adults=1, children=1)

        self.assertEqual(response.status_code, 201)
        booking = Booking.objects.get(user=self.user)
        self.assertEqual(booking.guests, 2)
        self.assertEqual(booking.total_price, Decimal('1000.00'))

    def test_booking_is_rejected_when_capacity_is_exceeded(self):
        self.create_booking(adults=2)

        response = self.create_booking(user=self.other_user, adults=1)

        self.assertEqual(response.status_code, 400)
        self.assertIn('capacity', response.json()['message'].lower())

    def test_user_can_pay_and_cancel_own_booking(self):
        self.create_booking()
        booking = Booking.objects.get(user=self.user)

        pay_response = self.client.put(
            f'/api/bookings/{booking.id}/',
            {'action': 'pay'},
            content_type='application/json',
            **self.auth_headers(),
        )
        self.assertEqual(pay_response.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.payment_status, 'PAID')
        self.assertEqual(booking.status, 'CONFIRMED')

        cancel_response = self.client.put(
            f'/api/bookings/{booking.id}/',
            {'action': 'cancel'},
            content_type='application/json',
            **self.auth_headers(),
        )
        self.assertEqual(cancel_response.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'CANCELLED')

    def test_user_cannot_access_another_users_booking(self):
        self.create_booking(user=self.user)
        booking = Booking.objects.get(user=self.user)

        response = self.client.put(
            f'/api/bookings/{booking.id}/',
            {'action': 'pay'},
            content_type='application/json',
            **self.auth_headers(self.other_user),
        )

        self.assertEqual(response.status_code, 404)
