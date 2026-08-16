from django.contrib import admin

from .models import Arrangement, Destination

# Register your models here.
admin.site.register(Destination)
admin.site.register(Arrangement)