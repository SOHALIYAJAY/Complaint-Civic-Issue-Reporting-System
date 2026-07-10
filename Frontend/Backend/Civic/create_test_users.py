import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Civic.settings')
django.setup()

from accounts.models import CustomUser

# Test users
test_users = [
    {
        'email': 'user@test.com',
        'username': 'testuser',
        'password': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User',
        'User_Role': 'Civic-User'
    },
    {
        'email': 'officer@test.com',
        'username': 'officertest',
        'password': 'officerpass123',
        'first_name': 'Officer',
        'last_name': 'Test',
        'User_Role': 'Officer'
    },
    {
        'email': 'admin@test.com',
        'username': 'admintest',
        'password': 'adminpass123',
        'first_name': 'Admin',
        'last_name': 'Test',
        'User_Role': 'Admin-User'
    },
]

for user_data in test_users:
    email = user_data['email']
    
    # Check if user already exists
    if CustomUser.objects.filter(email=email).exists():
        print(f"User {email} already exists. Skipping...")
        user = CustomUser.objects.get(email=email)
        print(f"  Email: {user.email}")
        print(f"  Role: {user.User_Role}")
    else:
        user = CustomUser.objects.create_user(**user_data)
        print(f"Created user: {email}")
        print(f"  Username: {user.username}")
        print(f"  Role: {user.User_Role}")
        print(f"  Active: {user.is_active}")
        print()

print("\nTo test login, use these credentials:")
for user_data in test_users:
    print(f"\nEmail: {user_data['email']}")
    print(f"Password: {user_data['password']}")
    print(f"Role: {user_data['User_Role']}")
