from rest_framework import serializers
from .models import contact_us

class contactusSerializer(serializers.ModelSerializer):
    class Meta:
        model = contact_us
        fields = '__all__'
    
    def validate_full_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters long.")
        return value.strip()
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value.lower()
    
    def validate_message(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value.strip()
    
    def validate(self, data):
        # Additional cross-field validation if needed
        return data