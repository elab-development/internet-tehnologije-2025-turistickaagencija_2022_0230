from django.conf import settings
from django.db import models

from .arrangement import Arrangement


class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PAID', 'Paid'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    arrangement = models.ForeignKey(
        Arrangement,
        on_delete=models.CASCADE,
        related_name='bookings',
        db_column='aranzman_id',
    )
    guests = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='UNPAID')
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'agency_booking'

    def __str__(self):
        return f"Booking {self.id} for {self.user.username} - {self.arrangement.name}"
