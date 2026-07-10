from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import CustomUser
# class LoginSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     password = serializers.CharField(write_only=True)

#     def validate(self, data):
#         email = data.get("email")
#         password = data.get("password")

#         user = authenticate(email=email, password=password)

#         if user is None:
#             raise serializers.ValidationError("Invalid email or password")

#         data["user"] = user
#         return data

class UserRegister(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2', 'User_Role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError('Password Not Match')
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            User_Role=validated_data.get('User_Role', 'Civic-User')
        )
        return user

class UserDetailSerializer(serializers.ModelSerializer):
    total_complaints = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'User_Role', 
                  'mobile_number', 'address', 'district', 'taluka', 'ward_number', 
                  'date_joined', 'total_complaints']
        read_only_fields = ['id', 'email', 'date_joined']
    
    def get_total_complaints(self, obj):
        from complaints.models import Complaint
        return Complaint.objects.filter(user=obj).count()

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'mobile_number', 'address', 'district', 
                  'taluka', 'ward_number']
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class UserAdminSerializer(serializers.ModelSerializer):
    complaint_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'User_Role', 
                  'is_active', 'created_join', 'last_login', 'complaint_count']
        read_only_fields = ['id', 'created_join', 'last_login']
    
    def get_complaint_count(self, obj):
        from complaints.models import Complaint
        return Complaint.objects.filter(user=obj).count()
