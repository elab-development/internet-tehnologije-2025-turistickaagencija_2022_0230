from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from .destination import Destination
from .hotel import Hotel
from .transport import Transport


class Arrangement(models.Model):
    name = models.CharField(max_length=100, db_column='naziv')

    destination = models.ForeignKey(
        Destination,
        on_delete=models.RESTRICT,
        related_name='arrangements',
        db_column='destinacija_id',
    )

    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.PROTECT,
        related_name='arrangements',
        null=True,
        db_column='hotel_id',
    )
    transport = models.ForeignKey(
        Transport,
        on_delete=models.PROTECT,
        related_name='arrangements',
        null=True,
        blank=True,
    )

    start_date = models.DateField(db_column='datum_pocetka')
    end_date = models.DateField(db_column='datum_zavrsetka')
    number_of_nights = models.PositiveIntegerField(default=3, db_column='broj_nocenja')

    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], db_column='cena')
    price_per_child = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], null=True, blank=True)
    capacity = models.PositiveIntegerField(db_column='broj_mesta')
    description = models.TextField(blank=True, db_column='opis')
    included_services = models.TextField(blank=True)
    excluded_services = models.TextField(blank=True)
    meeting_point = models.CharField(max_length=255, blank=True)
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PUBLISHED')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'agency_aranzman'
        verbose_name = 'arrangement'
        verbose_name_plural = 'arrangements'

    def __str__(self):
        return self.name
