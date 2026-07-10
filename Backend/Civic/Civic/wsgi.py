"""
WSGI config for Civic project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Civic.settings')

# Startup diagnostics for Render logs (safe, no behavior change).
print("[BOOT] Starting Civic WSGI application")
print(f"[BOOT] PORT={os.getenv('PORT', 'not-set')}")
print(f"[BOOT] DATABASE_URL set={bool(os.getenv('DATABASE_URL'))}")
print(f"[BOOT] SECRET_KEY set={bool(os.getenv('SECRET_KEY'))}")

application = get_wsgi_application()
