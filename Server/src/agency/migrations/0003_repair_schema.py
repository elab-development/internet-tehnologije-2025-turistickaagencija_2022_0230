from django.db import migrations


REPAIRED_FIELDS = {
    'Country': ('iso_code', 'description'),
    'Destination': (
        'city', 'description', 'is_active', 'latitude', 'longitude',
    ),
    'Hotel': (
        'address', 'description', 'stars', 'amenities', 'phone_number',
        'email', 'is_active',
    ),
    'Arrangement': (
        'created_at', 'excluded_services', 'included_services', 'is_active',
        'meeting_point', 'price_per_child', 'status', 'updated_at',
        'transport',
    ),
    'Booking': ('adults', 'cancelled_at', 'children', 'notes', 'unit_price'),
}


def repair_schema(apps, schema_editor):
    connection = schema_editor.connection
    existing_tables = set(connection.introspection.table_names())
    models = {
        model_name: apps.get_model('agency', model_name)
        for model_name in REPAIRED_FIELDS
    }

    transport_model = apps.get_model('agency', 'Transport')
    if transport_model._meta.db_table not in existing_tables:
        schema_editor.create_model(transport_model)
        existing_tables.add(transport_model._meta.db_table)

    for model_name, field_names in REPAIRED_FIELDS.items():
        model = models[model_name]
        if model._meta.db_table not in existing_tables:
            continue

        existing_columns = {
            column.name
            for column in connection.introspection.get_table_description(
                connection.cursor(), model._meta.db_table
            )
        }

        for field_name in field_names:
            field = model._meta.get_field(field_name)
            column_name = field.column
            if column_name not in existing_columns:
                schema_editor.add_field(model, field)
                existing_columns.add(column_name)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('agency', '0002_transport_arrangement_created_at_and_more'),
    ]

    operations = [
        migrations.RunPython(repair_schema, noop),
    ]
