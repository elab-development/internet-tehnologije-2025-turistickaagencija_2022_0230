from django.db import models

# Create your models here.
class Drzava(models.Model):
    naziv = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.naziv

class Destinacija(models.Model):
    naziv = models.CharField(max_length=100)
    drzava = models.ForeignKey(
        Drzava,
        on_delete=models.PROTECT,
        related_name='aranzmani'
    )
    
    def __str__(self):
        return f"{self.naziv} ({self.drzava})"
    

class Aranzman(models.Model):
    naziv = models.CharField(max_length=100)
    destinacija = models.ForeignKey(
        Destinacija,
        on_delete=models.RESTRICT,
        related_name='aranzmani'
    )
    cena = models.DecimalField(max_digits=10,decimal_places=2)
    datum_pocetka = models.DateField()
    datum_zavrsetka = models.DateField()
    broj_mesta = models.IntegerField()
    
    def __str__(self):
        return f"{self.naziv} - {self.destinacija.naziv}"