from rest_framework import serializers
from .models import Complaint, ComplaintAssignment
from departments.models import Officer
class ComplaintSerializer(serializers.ModelSerializer):
    image_video = serializers.FileField(required=False, allow_null=True)
    category_name = serializers.CharField(source='Category.name', read_only=True)
    category_code = serializers.CharField(source='Category.code', read_only=True)
    officer_name = serializers.CharField(source='officer_id.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['current_time']
    
    def create(self, validated_data):
        if 'image_video' in validated_data and not validated_data['image_video']:
            validated_data.pop('image_video')
        
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


