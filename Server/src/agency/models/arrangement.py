from django.db import models

from .destination import Destination
from .hotel import Hotel


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

    start_date = models.DateField(db_column='datum_pocetka')
    end_date = models.DateField(db_column='datum_zavrsetka')
    number_of_nights = models.PositiveIntegerField(default=3, db_column='broj_nocenja')

    price = models.DecimalField(max_digits=10, decimal_places=2, db_column='cena')
    capacity = models.PositiveIntegerField(db_column='broj_mesta')
    description = models.TextField(blank=True, db_column='opis')

    class Meta:
        db_table = 'agency_aranzman'
        verbose_name = 'arrangement'
        verbose_name_plural = 'arrangements'

    def __str__(self):
        return self.name
