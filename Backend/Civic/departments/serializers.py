from rest_framework import serializers
from .models import Department, Officer


class DepartmentDropdownSerializer(serializers.ModelSerializer):
    """Minimal `{id, name}` for public dropdowns; name matches complaint routing (display label)."""

    name = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name']

    def get_name(self, obj):
        return obj.get_category_display()


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
        # Match department_statistics: officers linked via M2M users and/or Officer FK rows.
        m2m_user_count = obj.officers.count()
        officer_fk_count = Officer.objects.filter(department=obj).count()
        return max(m2m_user_count, officer_fk_count)

class OfficerSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = Officer
        fields = ['officer_id', 'name', 'email', 'phone', 'is_available', 'department', 'department_name']

    def get_department_name(self, obj):
        return obj.department.get_category_display() if obj.department else None