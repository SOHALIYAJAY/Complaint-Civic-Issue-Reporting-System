"""Send OTP and transactional mail via SendGrid Web API (no Django SMTP)."""

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings


def send_otp_email(user_email, otp):
    """Send verification OTP. Uses DEFAULT_FROM_EMAIL and SENDGRID_API_KEY."""
    api_key = getattr(settings, 'SENDGRID_API_KEY', None) or ''
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or ''
    if not api_key or not from_email:
        print('SendGrid error: SENDGRID_API_KEY or DEFAULT_FROM_EMAIL is not set')
        return False
    try:
        message = Mail(
            from_email=from_email,
            to_emails=user_email,
            subject='Verify your account',
            html_content=f'<strong>Your OTP is {otp}</strong>',
        )
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        print('Email sent:', response.status_code)
        return True
    except Exception as e:
        print('SendGrid error:', str(e))
        return False
