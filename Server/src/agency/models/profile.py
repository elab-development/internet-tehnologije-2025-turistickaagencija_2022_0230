from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('FEMALE', 'Female'),
        ('MALE', 'Male'),
        ('OTHER', 'Other'),
        ('PREFER_NOT_TO_SAY', 'Prefer not to say'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    gender = models.CharField(max_length=30, choices=GENDER_CHOICES, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Profile for {self.user.username}'