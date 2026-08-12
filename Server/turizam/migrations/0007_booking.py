from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('turizam', '0006_aranzman_broj_nocenja_aranzman_hotel_aranzman_opis_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('guests', models.PositiveIntegerField(default=1)),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('CONFIRMED', 'Confirmed'), ('CANCELLED', 'Cancelled')], default='PENDING', max_length=20)),
                ('payment_status', models.CharField(choices=[('UNPAID', 'Unpaid'), ('PAID', 'Paid')], default='UNPAID', max_length=20)),
                ('booked_at', models.DateTimeField(auto_now_add=True)),
                ('aranzman', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='turizam.aranzman')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='auth.user')),
            ],
        ),
    ]
