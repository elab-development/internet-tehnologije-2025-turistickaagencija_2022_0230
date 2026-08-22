from datetime import date

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework_simplejwt.tokens import RefreshToken

from agency.models import Arrangement, Country, Destination, Hotel


class PasswordResetTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='oldpass123',
        )

    def test_request_reset_password_returns_success_and_sends_email(self):
        with self.settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', FRONTEND_URL='http://localhost:4200'):
            response = self.client.post(
                '/api/auth/users/reset_password/',
                {'email': 'test@example.com'},
                content_type='application/json',
            )

            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json()['success'])
            self.assertEqual(len(mail.outbox), 1)
            self.assertIn('password-reset', mail.outbox[0].body)

    def test_confirm_reset_password_updates_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            '/api/auth/users/reset_password_confirm/',
            {
                'uid': uid,
                'token': token,
                'new_password': 'newpass456',
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass456'))

    def test_login_with_valid_credentials_but_inactive_user_returns_specific_message(self):
        self.user.is_active = False
        self.user.save()

        response = self.client.post(
            '/api/auth/login/',
            {'username': 'testuser', 'password': 'oldpass123'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn('not activated', response.json()['message'].lower())


class AgentArrangementPermissionTests(TestCase):
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
            destination=self.destination,
            hotel=self.hotel,
            start_date=date(2027, 1, 1),
            end_date=date(2027, 1, 8),
            number_of_nights=7,
            price='500.00',
            capacity=2,
        )

    def auth_headers(self, user):
        token = RefreshToken.for_user(user).access_token
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def test_agent_can_create_arrangement(self):
        payload = {
            'name': 'New Trip',
            'destination_id': self.destination.id,
            'hotel_id': self.hotel.id,
            'start_date': '2027-02-01',
            'end_date': '2027-02-08',
            'number_of_nights': 7,
            'price': '400.00',
            'capacity': 3,
            'description': 'A new trip',
        }

        response = self.client.post(
            '/api/arrangements/',
            payload,
            content_type='application/json',
            **self.auth_headers(self.agent),
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Arrangement.objects.filter(name='New Trip').exists())

    def test_agent_can_update_and_delete_arrangement(self):
        payload = {
            'name': 'Updated Trip',
            'destination_id': self.destination.id,
            'hotel_id': self.hotel.id,
            'start_date': '2027-01-01',
            'end_date': '2027-01-08',
            'number_of_nights': 7,
            'price': '550.00',
            'capacity': 2,
            'description': '',
        }

        response = self.client.put(
            f'/api/arrangements/{self.arrangement.id}/',
            payload,
            content_type='application/json',
            **self.auth_headers(self.agent),
        )
        self.assertEqual(response.status_code, 200)
        self.arrangement.refresh_from_db()
        self.assertEqual(self.arrangement.name, 'Updated Trip')

        response = self.client.delete(
            f'/api/arrangements/{self.arrangement.id}/',
            **self.auth_headers(self.agent),
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
            **self.auth_headers(self.agent),
        )
        self.assertEqual(hotel_response.status_code, 403)

        destination_response = self.client.post(
            '/api/destinations/',
            {'name': 'Unauthorized Destination', 'country_id': self.country.id},
            content_type='application/json',
            **self.auth_headers(self.agent),
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
