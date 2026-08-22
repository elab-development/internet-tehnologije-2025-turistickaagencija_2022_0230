from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from .destination import Destination


class Hotel(models.Model):
    name = models.CharField(max_length=200, db_column='naziv')
    image = models.ImageField(upload_to='hoteli/', null=True, blank=True, db_column='slika')
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        db_column='ocena',
    )
    price_per_night = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        db_column='cena_nocenja',
    )
    address = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    stars = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MaxValueValidator(5)])
    amenities = models.TextField(blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)

    destination = models.ForeignKey(
        Destination,
        on_delete=models.CASCADE,
        related_name='hotels',
        db_column='destinacija_id',
    )

    class Meta:
        db_table = 'agency_hotel'
        verbose_name = 'hotel'
        verbose_name_plural = 'hotels'

    def __str__(self):
        return self.name
