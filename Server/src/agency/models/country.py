from django.db import models


class Country(models.Model):
    name = models.CharField(max_length=100, unique=True, db_column='naziv')
    iso_code = models.CharField(max_length=2, unique=True, null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'agency_drzava'
        verbose_name = 'country'
        verbose_name_plural = 'countries'

    def __str__(self):
        return self.name
