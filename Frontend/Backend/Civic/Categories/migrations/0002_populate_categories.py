from django.db import migrations


def create_categories(apps, schema_editor):
    Category = apps.get_model('Categories', 'Category')
    categories = [
        ('ROADS', 'Roads & Infrastructure'),
        ('TRAFFIC', 'Traffic & Road Safety'),
        ('WATER', 'Water Supply'),
        ('SEWERAGE', 'Sewerage & Drainage'),
        ('SANITATION', 'Sanitation & Garbage'),
        ('LIGHTING', 'Street Lighting'),
        ('PARKS', 'Parks & Public Spaces'),
        ('ANIMALS', 'Stray Animals'),
        ('ILLEGAL_CONSTRUCTION', 'Illegal Construction'),
        ('ENCROACHMENT', 'Encroachment'),
        ('PROPERTY_DAMAGE', 'Public Property Damage'),
        ('ELECTRICITY', 'Electricity & Power Issues'),
        ('OTHER', 'Other'),
    ]

    for code, label in categories:
        Category.objects.get_or_create(
            code=code,
            defaults={'name': label, 'department': ''}
        )


class Migration(migrations.Migration):

    dependencies = [
        ('Categories', '0003_alter_code_maxlen'),
    ]

    operations = [
        migrations.RunPython(create_categories, reverse_code=migrations.RunPython.noop),
    ]
