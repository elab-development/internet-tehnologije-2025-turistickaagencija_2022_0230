from django.db import models

from .destination import Destination


class Hotel(models.Model):
    name = models.CharField(max_length=200, db_column='naziv')
    image = models.ImageField(upload_to='hoteli/', null=True, blank=True, db_column='slika')
    rating = models.DecimalField(max_digits=2, decimal_places=1, db_column='ocena')
    price_per_night = models.DecimalField(max_digits=8, decimal_places=2, db_column='cena_nocenja')

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
