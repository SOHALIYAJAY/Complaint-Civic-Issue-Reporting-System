from django.core.management.base import BaseCommand
from departments.models import Department
from Categories.models import Category


DEPARTMENTS = [
    ('ROADS',               'Roads & Infrastructure',        'roads@civictrack.gov.in',       '1800-001-0001'),
    ('TRAFFIC',             'Traffic & Road Safety',         'traffic@civictrack.gov.in',      '1800-001-0002'),
    ('WATER',               'Water Supply',                  'water@civictrack.gov.in',        '1800-001-0003'),
    ('SEWERAGE',            'Sewerage & Drainage',           'sewerage@civictrack.gov.in',     '1800-001-0004'),
    ('SANITATION',          'Sanitation & Garbage',          'sanitation@civictrack.gov.in',   '1800-001-0005'),
    ('LIGHTING',            'Street Lighting',               'lighting@civictrack.gov.in',     '1800-001-0006'),
    ('HEALTH',              'Public Health Hazard',          'health@civictrack.gov.in',       '1800-001-0007'),
    ('PARKS',               'Parks & Public Spaces',         'parks@civictrack.gov.in',        '1800-001-0008'),
    ('ANIMALS',             'Stray Animals',                 'animals@civictrack.gov.in',      '1800-001-0009'),
    ('ILLEGAL_CONSTRUCTION','Illegal Construction',          'construction@civictrack.gov.in', '1800-001-0010'),
    ('ENCROACHMENT',        'Encroachment',                  'encroach@civictrack.gov.in',     '1800-001-0011'),
    ('PROPERTY_DAMAGE',     'Public Property Damage',        'property@civictrack.gov.in',     '1800-001-0012'),
    ('NOISE',               'Noise Pollution',               'noise@civictrack.gov.in',        '1800-001-0013'),
    ('ELECTRICITY',         'Electricity & Power Issues',    'electricity@civictrack.gov.in',  '1800-001-0014'),
    ('VENDORS',             'Street Vendor / Hawker Issues', 'vendors@civictrack.gov.in',      '1800-001-0015'),
    ('OTHER',               'Other',                         'other@civictrack.gov.in',        '1800-001-0016'),
]


class Command(BaseCommand):
    help = 'Seed all 16 departments and link existing Categories to their Department'

    def handle(self, *args, **kwargs):
        created_count = 0
        updated_count = 0

        for code, label, email, phone in DEPARTMENTS:
            dept, created = Department.objects.get_or_create(
                category=code,
                defaults={
                    'name': label,
                    'contact_email': email,
                    'contact_phone': phone,
                    'description': f'Government department responsible for {label.lower()} issues.',
                }
            )
            if not created:
                # Update contact info if already exists
                dept.name = label
                dept.contact_email = email
                dept.contact_phone = phone
                dept.save()
                updated_count += 1
                self.stdout.write(f'  Updated: {label}')
            else:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  Created: {label}'))

            # Link matching Categories to this department code
            # Category.department stores the code string (e.g. 'ROADS')
            linked = Category.objects.filter(
                department=code
            ).update(department=code)

            # Also try matching by name for categories that store the display name
            name_linked = Category.objects.filter(
                name=label,
                department=''
            ).update(department=code)

            if linked or name_linked:
                self.stdout.write(f'    Linked {linked + name_linked} categories to {code}')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone. Created: {created_count}, Updated: {updated_count} departments.'
        ))
        self.stdout.write(f'Total departments in DB: {Department.objects.count()}')
