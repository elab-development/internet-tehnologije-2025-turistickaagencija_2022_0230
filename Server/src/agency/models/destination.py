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

    class Meta:
        db_table = 'agency_destinacija'
        verbose_name = 'destination'
        verbose_name_plural = 'destinations'

    def __str__(self):
        return f"{self.name} ({self.country})"
