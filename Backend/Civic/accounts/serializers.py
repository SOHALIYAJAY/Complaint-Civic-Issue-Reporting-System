from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
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
    """Manual signup: matches frontend `confirm_password` (and legacy `password2`)."""

    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True, trim_whitespace=False)
    confirmPassword = serializers.CharField(write_only=True, required=False, allow_blank=True, trim_whitespace=False)
    password2 = serializers.CharField(write_only=True, required=False, allow_blank=True, trim_whitespace=False)
    role = serializers.ChoiceField(
        source='User_Role',
        choices=[c[0] for c in CustomUser.CHOICE_FIELDS],
        default='Civic-User',
    )

    class Meta:
        model = CustomUser
        fields = [
            'username',
            'email',
            'password',
            'confirm_password',
            'confirmPassword',
            'password2',
            'role',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': True, 'allow_blank': False},
            'email': {'required': True},
        }

    def validate_username(self, value):
        v = (value or '').strip()
        if not v:
            raise serializers.ValidationError('Username is required.')
        return v

    def validate_email(self, value):
        return (value or '').strip().lower()

    def validate(self, data):
        pwd = data.get('password') or ''
        confirm = (
            data.get('confirm_password')
            or data.get('confirmPassword')
            or data.get('password2')
        )
        if confirm is None or confirm == '':
            raise serializers.ValidationError(
                {'confirm_password': 'Confirm password is required.'}
            )
        if pwd != confirm:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        email = (data.get('email') or '').strip().lower()
        username = (data.get('username') or '').strip() or (email.split('@')[0] if email else '')
        tmp = CustomUser(email=email, username=username)
        try:
            validate_password(pwd, user=tmp)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        validated_data.pop('confirmPassword', None)
        validated_data.pop('password2', None)
        password = validated_data.pop('password')
        # Must pop email — passing email=... and **validated_data duplicates the kwarg (TypeError).
        email = validated_data.pop('email')
        user = CustomUser(
            email=email,
            email_verified=False,
            is_verified=False,
            **validated_data,
        )
        user.set_password(password)
        user.save()
        return user

class UserDetailSerializer(serializers.ModelSerializer):
    total_complaints = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'User_Role',
                  'department',
                  'mobile_number', 'address', 'district', 'taluka', 'ward_number', 
                  'date_joined', 'total_complaints']
        read_only_fields = ['id', 'email', 'date_joined']
    
    def get_total_complaints(self, obj):
        from complaints.models import Complaint
        return Complaint.objects.filter(user=obj).count()

    def get_department(self, obj):
        # Officer model has explicit department FK; fallback to user<->department relations.
        from departments.models import Officer
        officer = Officer.objects.filter(email=obj.email).select_related('department').first()
        if officer and officer.department:
            return officer.department.get_category_display()
        if hasattr(obj, 'departments') and obj.departments.exists():
            return obj.departments.first().get_category_display()
        if hasattr(obj, 'headed_department') and obj.headed_department.exists():
            return obj.headed_department.first().get_category_display()
        return None

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
