import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Civic.settings')
django.setup()

from departments.models import Officer

officers_data = [
    {'officer_id': 'OFC1', 'name': 'Rajesh Kumar', 'email': 'rajesh.kumar@civic.gov.in', 'phone': '9876543210', 'is_available': True},
    {'officer_id': 'OFC2', 'name': 'Priya Sharma', 'email': 'priya.sharma@civic.gov.in', 'phone': '9876543211', 'is_available': True},
    {'officer_id': 'OFC3', 'name': 'Amit Patel', 'email': 'amit.patel@civic.gov.in', 'phone': '9876543212', 'is_available': True},
    {'officer_id': 'OFC4', 'name': 'Sneha Reddy', 'email': 'sneha.reddy@civic.gov.in', 'phone': '9876543213', 'is_available': True},
    {'officer_id': 'OFC5', 'name': 'Vikram Singh', 'email': 'vikram.singh@civic.gov.in', 'phone': '9876543214', 'is_available': True},
    {'officer_id': 'OFC6', 'name': 'Anjali Verma', 'email': 'anjali.verma@civic.gov.in', 'phone': '9876543215', 'is_available': True},
    {'officer_id': 'OFC7', 'name': 'Karthik Nair', 'email': 'karthik.nair@civic.gov.in', 'phone': '9876543216', 'is_available': True},
    {'officer_id': 'OFC8', 'name': 'Deepa Iyer', 'email': 'deepa.iyer@civic.gov.in', 'phone': '9876543217', 'is_available': True},
    {'officer_id': 'OFC9', 'name': 'Suresh Gupta', 'email': 'suresh.gupta@civic.gov.in', 'phone': '9876543218', 'is_available': True},
    {'officer_id': 'OFC10', 'name': 'Meera Joshi', 'email': 'meera.joshi@civic.gov.in', 'phone': '9876543219', 'is_available': True},
]

for officer_data in officers_data:
    Officer.objects.get_or_create(**officer_data)

print("10 officers added successfully!")
