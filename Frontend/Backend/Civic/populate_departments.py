import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Civic.settings')
django.setup()

from accounts.models import CustomUser
from departments.models import Department, Officer


def get_or_create_officer_user(email, username, first_name, last_name, password='Officer12345'):
    user = CustomUser.objects.filter(email=email).first()
    if user:
        return user, False

    user = CustomUser.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        User_Role='Officer'
    )
    return user, True


def ensure_officer_record(officer_id, name, email, phone, department):
    officer, created = Officer.objects.get_or_create(
        officer_id=officer_id,
        defaults={
            'name': name,
            'email': email,
            'phone': phone,
            'is_available': True,
            'department': department,
        }
    )
    if not created and officer.department != department:
        officer.department = department
        officer.save()
    return officer, created


departments_data = [
    {
        'name': 'Roads & Infrastructure Department',
        'category': 'ROADS',
        'description': 'Responsible for road maintenance, repairs, and infrastructure development',
        'contact_email': 'roads@civic.gov.in',
        'contact_phone': '1800-111-001'
    },
    {
        'name': 'Traffic & Road Safety Department',
        'category': 'TRAFFIC',
        'description': 'Managing traffic flow, road safety, and traffic signal maintenance',
        'contact_email': 'traffic@civic.gov.in',
        'contact_phone': '1800-111-002'
    },
    {
        'name': 'Water Supply Department',
        'category': 'WATER',
        'description': 'Ensuring clean water supply and managing water distribution systems',
        'contact_email': 'water@civic.gov.in',
        'contact_phone': '1800-111-003'
    },
    {
        'name': 'Sewerage & Drainage Department',
        'category': 'SEWERAGE',
        'description': 'Maintaining sewerage systems and drainage infrastructure',
        'contact_email': 'sewerage@civic.gov.in',
        'contact_phone': '1800-111-004'
    },
    {
        'name': 'Sanitation & Garbage Department',
        'category': 'SANITATION',
        'description': 'Waste management, garbage collection, and sanitation services',
        'contact_email': 'sanitation@civic.gov.in',
        'contact_phone': '1800-111-005'
    },
    {
        'name': 'Street Lighting Department',
        'category': 'LIGHTING',
        'description': 'Installation and maintenance of street lights and public lighting',
        'contact_email': 'lighting@civic.gov.in',
        'contact_phone': '1800-111-006'
    },
    {
        'name': 'Public Health Hazard Department',
        'category': 'HEALTH',
        'description': 'Managing public health hazards, outbreaks, and sanitation risks',
        'contact_email': 'health@civic.gov.in',
        'contact_phone': '1800-111-007'
    },
    {
        'name': 'Parks & Public Spaces Department',
        'category': 'PARKS',
        'description': 'Maintenance of parks, gardens, and public recreational spaces',
        'contact_email': 'parks@civic.gov.in',
        'contact_phone': '1800-111-008'
    },
    {
        'name': 'Animal Control Department',
        'category': 'ANIMALS',
        'description': 'Managing stray animals and animal welfare programs',
        'contact_email': 'animals@civic.gov.in',
        'contact_phone': '1800-111-009'
    },
    {
        'name': 'Building Control Department',
        'category': 'ILLEGAL_CONSTRUCTION',
        'description': 'Monitoring construction activities and preventing illegal constructions',
        'contact_email': 'building@civic.gov.in',
        'contact_phone': '1800-111-010'
    },
    {
        'name': 'Encroachment Department',
        'category': 'ENCROACHMENT',
        'description': 'Removing encroachments and protecting public spaces',
        'contact_email': 'encroachment@civic.gov.in',
        'contact_phone': '1800-111-011'
    },
    {
        'name': 'Public Property Department',
        'category': 'PROPERTY_DAMAGE',
        'description': 'Maintaining and protecting public property and assets',
        'contact_email': 'property@civic.gov.in',
        'contact_phone': '1800-111-012'
    },
    {
        'name': 'Noise Pollution Department',
        'category': 'NOISE',
        'description': 'Reducing noise pollution and enforcing noise control regulations',
        'contact_email': 'noise@civic.gov.in',
        'contact_phone': '1800-111-013'
    },
    {
        'name': 'Electricity & Power Issues Department',
        'category': 'ELECTRICITY',
        'description': 'Managing power supply and electrical infrastructure',
        'contact_email': 'electricity@civic.gov.in',
        'contact_phone': '1800-111-014'
    },
    {
        'name': 'Street Vendor / Hawker Issues Department',
        'category': 'VENDORS',
        'description': 'Regulating street vending, hawker permits and vendor rights',
        'contact_email': 'vendors@civic.gov.in',
        'contact_phone': '1800-111-015'
    },
    {
        'name': 'Other Issues Department',
        'category': 'OTHER',
        'description': 'Handling miscellaneous civic issues not covered by other departments',
        'contact_email': 'other@civic.gov.in',
        'contact_phone': '1800-111-016'
    },
]

for dept_data in departments_data:
    dept, created = Department.objects.get_or_create(
        category=dept_data['category'],
        defaults=dept_data
    )

    if not created:
        # Update stale info when department already exists
        for key, value in dept_data.items():
            setattr(dept, key, value)

    print(f"{'Created' if created else 'Updated'} department: {dept.name}")

    # Create/assign head officer
    head_email = f"{dept.category.lower()}_head@civic.gov.in"
    head_username = f"{dept.category.lower()}_head"
    head_name = dept.name + ' Head'
    head_user, head_created = get_or_create_officer_user(
        email=head_email,
        username=head_username,
        first_name=head_name,
        last_name='(HOD)',
    )

    dept.head_officer = head_user
    dept.officers.add(head_user)

    # two additional officers per department
    for i in [1, 2]:
        officer_email = f"{dept.category.lower()}_officer{i}@civic.gov.in"
        officer_username = f"{dept.category.lower()}_officer{i}"
        officer_name = f"{dept.name} Officer {i}"

        officer_user, officer_created = get_or_create_officer_user(
            email=officer_email,
            username=officer_username,
            first_name=officer_name,
            last_name='(Officer)',
        )
        dept.officers.add(officer_user)

        # also create an Officer model record for complaints assignment
        officer_id = f"{dept.category[:5].upper()}{i:02d}"
        ensure_officer_record(
            officer_id=officer_id,
            name=officer_name,
            email=officer_email,
            phone=dept.contact_phone,
            department=dept
        )

    dept.save()

print(f"\nTotal departments: {Department.objects.count()}")
print(f"Total users with Officer role: {CustomUser.objects.filter(User_Role='Officer').count()}")
print(f"Total officer records (departments.Officer): {Officer.objects.count()}")

