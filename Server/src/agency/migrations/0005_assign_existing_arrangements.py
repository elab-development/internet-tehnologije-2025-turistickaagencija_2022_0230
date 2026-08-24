from django.db import migrations


def assign_existing_arrangements(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Arrangement = apps.get_model('agency', 'Arrangement')
    agents = list(
        User.objects.filter(is_staff=True, is_superuser=False).order_by('id')
    )
    if not agents:
        return

    arrangements = Arrangement.objects.filter(created_by__isnull=True).order_by('id')
    for index, arrangement in enumerate(arrangements):
        arrangement.created_by_id = agents[index % len(agents)].id
        arrangement.save(update_fields=['created_by'])


def reverse_assignment(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Arrangement = apps.get_model('agency', 'Arrangement')
    agent_ids = User.objects.filter(
        is_staff=True,
        is_superuser=False,
    ).values_list('id', flat=True)
    Arrangement.objects.filter(created_by_id__in=agent_ids).update(created_by=None)


class Migration(migrations.Migration):
    dependencies = [
        ('agency', '0004_arrangement_created_by'),
    ]

    operations = [
        migrations.RunPython(assign_existing_arrangements, reverse_assignment),
    ]
