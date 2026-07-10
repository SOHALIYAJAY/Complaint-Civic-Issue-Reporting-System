#!/usr/bin/env python
"""
Test script for Google login endpoint
This will help identify the exact issue
"""

import os
import requests
import json

# Test the Google login endpoint
def test_google_login():
    url = "http://localhost:8000/api/google-login/"
    
    # Test 1: Missing token
    print("Test 1: Missing token")
    response = requests.post(url, json={})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Test 2: Invalid token
    print("Test 2: Invalid token")
    response = requests.post(url, json={"token": "invalid_token"})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Test 3: Check environment variables
    print("Test 3: Environment variables")
    google_client_id = os.getenv('GOOGLE_CLIENT_ID')
    google_client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    print(f"GOOGLE_CLIENT_ID: {bool(google_client_id)}")
    print(f"GOOGLE_CLIENT_SECRET: {bool(google_client_secret)}")
    print()

if __name__ == "__main__":
    test_google_login()
