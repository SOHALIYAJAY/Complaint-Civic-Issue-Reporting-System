
from django.contrib import admin
from complaints.models import Complaint,ComplaintAssignment

class AdminComplaint(admin.ModelAdmin):
    list_display=['title','officer_id','Category','Description','location_address','location_District','location_taluk','priority_level','current_time','status','image_video','is_assignd']

admin.site.register(Complaint,AdminComplaint)




class Adimncompofficer(admin.ModelAdmin):
    list_display=['complaint','officer','priority','remarks'] 
# ComplaintAssignment registration removed to hide "assign complaints" option from admin panel
# If you want to re-enable it later, uncomment the line below.
admin.site.register(ComplaintAssignment,Adimncompofficer)