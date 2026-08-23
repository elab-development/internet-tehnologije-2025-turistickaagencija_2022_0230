from django.test import TestCase

from agency.serializers import LoginSerializer, RegisterSerializer


class AuthSerializerTests(TestCase):
    def test_login_serializer_accepts_username_and_password(self):
        serializer = LoginSerializer(data={
            'username': 'traveler',
            'password': 'secret123',
        })

        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['username'], 'traveler')

    def test_login_serializer_requires_password(self):
        serializer = LoginSerializer(data={'username': 'traveler'})

        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_register_serializer_requires_minimum_password_length(self):
        serializer = RegisterSerializer(data={
            'username': 'traveler',
            'email': 'traveler@example.com',
            'password': 'short',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
