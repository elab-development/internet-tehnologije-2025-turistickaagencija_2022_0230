from django.db import models

from .country import Country


class Destination(models.Model):
    name = models.CharField(max_length=100, db_column='naziv')
    country = models.ForeignKey(
        Country,
        on_delete=models.PROTECT,
        related_name='destinations',
        db_column='drzava_id',
    )
    image = models.ImageField(
        upload_to='destinacije/',
        null=True,
        blank=True,
        db_column='slika',
    )
    city = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'agency_destinacija'
        verbose_name = 'destination'
        verbose_name_plural = 'destinations'

    def __str__(self):
        return f"{self.name} ({self.country})"
