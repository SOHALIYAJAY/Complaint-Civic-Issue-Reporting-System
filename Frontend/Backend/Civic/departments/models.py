from django.db import models
from accounts.models import CustomUser

class Department(models.Model):
    CATEGORY_CHOICES = [
        ('ROADS', 'Roads & Infrastructure'),
        ('TRAFFIC', 'Traffic & Road Safety'),
        ('WATER', 'Water Supply'),
        ('SEWERAGE', 'Sewerage & Drainage'),
        ('SANITATION', 'Sanitation & Garbage'),
        ('LIGHTING', 'Street Lighting'),
        ('HEALTH', 'Public Health Hazard'),
        ('PARKS', 'Parks & Public Spaces'),
        ('ANIMALS', 'Stray Animals'),
        ('ILLEGAL_CONSTRUCTION', 'Illegal Construction'),
        ('ENCROACHMENT', 'Encroachment'),
        ('PROPERTY_DAMAGE', 'Public Property Damage'),
        ('NOISE', 'Noise Pollution'),
        ('ELECTRICITY', 'Electricity & Power Issues'),
        ('VENDORS', 'Street Vendor / Hawker Issues'),
        ('OTHER', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=15)
    head_officer = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_department')
    officers = models.ManyToManyField(CustomUser, related_name='departments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Auto-populate name from the category label if not set
        if not self.name and self.category:
            self.name = dict(self.CATEGORY_CHOICES).get(self.category, self.category)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class Officer(models.Model):
    officer_id = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=15)
    is_available = models.BooleanField(default=True)
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='dept_officers'
    )
