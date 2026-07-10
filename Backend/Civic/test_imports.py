#!/usr/bin/env python
"""
Test script to verify all imports work correctly
"""

import os
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing imports...")
    
    # Test Django imports
    from django.conf import settings
    print("✅ Django settings imported")
    
    # Test Google OAuth imports
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    print("✅ Google OAuth libraries imported")
    
    # Test DRF imports
    from rest_framework.views import APIView
    from rest_framework.response import Response
    from rest_framework import status
    print("✅ DRF libraries imported")
    
    # Test JWT imports
    from rest_framework_simplejwt.tokens import RefreshToken
    print("✅ JWT libraries imported")
    
    # Test model imports
    from accounts.models import CustomUser
    print("✅ CustomUser model imported")
    
    # Test environment variables
    google_client_id = os.getenv('GOOGLE_CLIENT_ID')
    google_client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    print(f"✅ GOOGLE_CLIENT_ID: {bool(google_client_id)}")
    print(f"✅ GOOGLE_CLIENT_SECRET: {bool(google_client_secret)}")
    
    print("\n🎉 All imports successful!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
