from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


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
