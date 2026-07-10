#!/usr/bin/env python
"""
Simple test for Google login endpoint
"""

import os
import django
from django.conf import settings

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Civic.settings')
django.setup()

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

def test_google_oauth():
    print("Testing Google OAuth setup...")
    
    # Check environment variables
    google_client_id = os.getenv('GOOGLE_CLIENT_ID')
    google_client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    
    print(f"GOOGLE_CLIENT_ID: {bool(google_client_id)}")
    print(f"GOOGLE_CLIENT_SECRET: {bool(google_client_secret)}")
    
    if not google_client_id:
        print("❌ GOOGLE_CLIENT_ID not set")
        return False
    
    if not google_client_secret:
        print("❌ GOOGLE_CLIENT_SECRET not set")
        return False
    
    print("✅ Google OAuth environment variables are set")
    return True

if __name__ == "__main__":
    test_google_oauth()
