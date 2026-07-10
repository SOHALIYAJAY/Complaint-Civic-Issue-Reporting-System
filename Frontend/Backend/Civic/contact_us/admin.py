from django.contrib import admin
from .models import contact_us
# Register your models here.
class Admin_contact_us(admin.ModelAdmin):
    list_display=['full_name','email','subject','message']

admin.site.register(contact_us,Admin_contact_us)