from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager
from datetime import datetime as dt

class CustomUser(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name=_('groups'),
        blank=True,
        help_text=_('The groups this user belongs to. A user will get all permissions granted to each of their groups.'),
        related_name='customuser_set',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name='customuser_set',
        related_query_name='customuser',
    )

    CHOICE_FIELDS = (
        ('Civic-User', 'Civic-User'),
        ('Department-User', 'Department-User'),
        ('Officer', 'Officer'),
        ('Admin-User', 'Admin-User')
    )
    name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    created_join = models.DateField(default=dt.now)
    password = models.CharField(max_length=200)
    User_Role = models.CharField(choices=CHOICE_FIELDS, max_length=200)
    mobile_number = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    taluka = models.CharField(max_length=100, blank=True, null=True)
    ward_number = models.CharField(max_length=10, blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    # Manual signup OTP flow (kept in sync with email_verified after OTP verify)
    is_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


import random
from django.utils import timezone
from datetime import timedelta


class PendingUser(models.Model):
    """Temporary signup storage until OTP verification succeeds."""

    username = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=200)
    user_role = models.CharField(choices=CustomUser.CHOICE_FIELDS, max_length=200, default='Civic-User')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]

    def is_valid(self):
        """OTP expires after 10 minutes."""
        return timezone.now() < self.updated_at + timedelta(minutes=10)

    def __str__(self):
        return f"Pending: {self.email}"


class EmailOTP(models.Model):
    user  = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='email_otp')
    otp   = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now=True)

    def is_valid(self):
        """OTP expires after 10 minutes."""
        return timezone.now() < self.created_at + timedelta(minutes=10)

    @classmethod
    def generate(cls, user):
        code = str(random.randint(100000, 999999))
        obj, _ = cls.objects.update_or_create(user=user, defaults={'otp': code})
        return code

    def __str__(self):
        return f"{self.user.email} — {self.otp}"
    