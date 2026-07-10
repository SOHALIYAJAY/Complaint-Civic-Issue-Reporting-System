from rest_framework import serializers
from .models import Complaint, ComplaintAssignment
from departments.models import Officer

class ComplaintSerializer(serializers.ModelSerializer):
    image_video = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['id', 'complaint_id', 'user']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return data
    
    def create(self, validated_data):
        
        # Automatically associate the complaint with the authenticated user
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        complaint = Complaint.objects.create(**validated_data)
        return complaint


class ComplaintAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintAssignment
        fields = '__all__'
    

    def create(self, validated_data):
        
        assignment = ComplaintAssignment.objects.create(**validated_data)
        try:
            complaint = assignment.complaint
            complaint.officer_id = assignment.officer
            complaint.is_assignd = True
            complaint.save()
        except Exception:
            pass
        return assignment


