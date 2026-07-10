from rest_framework import serializers
from .models import Department, Officer

class deptSerializer(serializers.ModelSerializer):
    head_officer_name = serializers.SerializerMethodField()
    officer_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'category', 'description', 'contact_email', 'contact_phone', 'head_officer_name', 'officer_count', 'created_at']
        read_only_fields = ['id', 'created_at', 'head_officer_name', 'officer_count']
    
    def get_head_officer_name(self, obj):
        if obj.head_officer:
            return obj.head_officer.get_full_name() or obj.head_officer.email
        return None
    
    def get_officer_count(self, obj):
        # Count distinct Officer records that have complaints in this department's category
        from complaints.models import Complaint
        return Complaint.objects.filter(
            Category__department=obj.category,
            officer_id__isnull=False
        ).values('officer_id').distinct().count()

class OfficerSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = Officer
        fields = ['officer_id', 'name', 'email', 'phone', 'is_available', 'department', 'department_name']

    def get_department_name(self, obj):
        return obj.department.get_category_display() if obj.department else None