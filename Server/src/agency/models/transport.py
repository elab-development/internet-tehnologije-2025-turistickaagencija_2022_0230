from django.db import models


class Transport(models.Model):
    TYPE_CHOICES = [
        ('BUS', 'Bus'),
        ('PLANE', 'Plane'),
        ('TRAIN', 'Train'),
        ('BOAT', 'Boat'),
        ('OTHER', 'Other'),
    ]

    company_name = models.CharField(max_length=150)
    transport_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    vehicle_name = models.CharField(max_length=100, blank=True)
    departure_location = models.CharField(max_length=150, blank=True)
    arrival_location = models.CharField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['company_name', 'transport_type']

    def __str__(self):
        return f'{self.company_name} - {self.get_transport_type_display()}'