"""Google ID token verification (must match Web client ID in Google Cloud)."""
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings


def verify_google_token(token: str) -> dict:
    """
    Verify a Google Sign-In JWT and return claims.
    Audience must match settings.GOOGLE_CLIENT_ID.
    """
    client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None) or ''
    if not client_id:
        raise ValueError('GOOGLE_CLIENT_ID is not configured')
    return id_token.verify_oauth2_token(
        token,
        requests.Request(),
        client_id,
    )


def audience_matches_config(idinfo: dict) -> bool:
    """True if idinfo['aud'] matches settings.GOOGLE_CLIENT_ID (handles str or list aud)."""
    expected = getattr(settings, 'GOOGLE_CLIENT_ID', None) or ''
    if not expected:
        return False
    aud = idinfo.get('aud')
    if isinstance(aud, list):
        return expected in aud
    return aud == expected
