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
    
    slika = models.ImageField(
        upload_to='destinacije/',
        null=True,
        blank=True,
    )
    
    def __str__(self):
        return f"{self.naziv} ({self.drzava})"
    

class Hotel(models.Model):
    naziv = models.CharField(max_length=200)
    slika = models.ImageField(upload_to='hoteli/',null=True,blank=True)
    ocena = models.DecimalField(max_digits=2,decimal_places=1)
    cena_nocenja = models.DecimalField(max_digits=8,decimal_places=2)
    
    destinacija = models.ForeignKey(
        Destinacija,
        on_delete=models.CASCADE,
        related_name='hoteli'
    )
    
    def __str__(self):
        return self.naziv
    
    
class Aranzman(models.Model):
    naziv = models.CharField(max_length=100)
    
    destinacija = models.ForeignKey(
        Destinacija,
        on_delete=models.RESTRICT,
        related_name='aranzmani'
    )
    
    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.PROTECT,
        related_name='aranzmani',
        null=True,
    )
    
    datum_pocetka = models.DateField()
    datum_zavrsetka = models.DateField()
    broj_nocenja = models.PositiveIntegerField(default=3)
    
    cena = models.DecimalField(max_digits=10,decimal_places=2)
    
    broj_mesta = models.PositiveIntegerField()
    
    opis = models.TextField(blank=True)
    
    def __str__(self):
        return self.naziv