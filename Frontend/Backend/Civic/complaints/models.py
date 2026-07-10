from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from departments.models import Officer
from Categories.models import Category
from accounts.admin import CustomUser

User = get_user_model()
class Complaint(models.Model):

    CHOICE_PRIORITY=(
        ('Low','Low'),
        ('Medium','Medium'),
        ('High','High')
        )
    CHOICE_STATUS=(
        ('Pending','Pending'),
        ('In Process','In Process'),
        ('Completed','Completed')
        )
    
    title=models.CharField(max_length=100)
    user=models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.CASCADE, related_name='complaints')
    officer_id=models.ForeignKey(Officer, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_complaints')
    Category=models.ForeignKey(Category, null=True, blank=True, on_delete=models.CASCADE, related_name='complaints')
    Description=models.CharField(max_length=300)
    image_video=models.FileField(upload_to='media/', null=True, blank=True)
    location_address=models.CharField(max_length=200)
    location_District=models.CharField(max_length=100)
    location_taluk=models.CharField(max_length=100)
    priority_level=models.CharField(max_length=20, choices=CHOICE_PRIORITY, default='Medium')
    status=models.CharField(max_length=20, choices=CHOICE_STATUS, default='Pending')
    current_time=models.DateTimeField(default=timezone.now)
    resolved_time=models.DateTimeField(null=True, blank=True)
    updated_at=models.DateTimeField(null=True, blank=True)
    remarks=models.TextField(blank=True, default='')
    is_assignd=models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.title} - {self.Category}"

class ComplaintAssignment(models.Model):
    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='assignments')
    officer = models.ForeignKey(Officer, on_delete=models.CASCADE, related_name='complaint_assignments')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    remarks = models.TextField(blank=True)
    class Meta:
        unique_together = ['complaint', 'officer']
    
    def __str__(self):
        return f"{self.complaint.title} -> {self.officer.name}"


class ComplaintStatusHistory(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('In Process', 'In Process'),
        ('Completed', 'Completed'),
    )
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    changed_by = models.ForeignKey(Officer, null=True, blank=True, on_delete=models.SET_NULL)
    remarks = models.TextField(blank=True, default='')
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.complaint.title} → {self.status} at {self.timestamp}"


class ComplaintCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name