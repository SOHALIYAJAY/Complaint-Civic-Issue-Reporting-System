from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser, EmailOTP
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from google.oauth2 import id_token
from google.auth.transport import requests
from accounts.serializers import UserRegister, UserDetailSerializer, UserUpdateSerializer, UserAdminSerializer
from complaints.models import Complaint
from rest_framework.pagination import PageNumberPagination
from django.core.mail import send_mail
from django.conf import settings as django_settings


class TestAPIView(APIView):
    def get(self, request):
        return Response({
            'message': 'API is working',
            'status': 'success'
        })


def _send_otp_email(email, otp):
    """Send OTP verification email."""
    try:
        send_mail(
            subject='CivicTrack — Email Verification OTP',
            message=(
                f'Your OTP for CivicTrack email verification is: {otp}\n\n'
                f'This OTP is valid for 10 minutes.\n'
                f'Do not share this OTP with anyone.'
            ),
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f'Email send error: {e}')
        return False


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'success': False, 'message': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(email=email)
            if user.check_password(password):
                if not user.is_active:
                    return Response(
                        {'success': False, 'message': 'User account is inactive'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                # Block login if email not verified
                if not user.email_verified:
                    # Resend OTP so they can verify
                    otp = EmailOTP.generate(user)
                    _send_otp_email(user.email, otp)
                    return Response(
                        {
                            'success': False,
                            'message': 'Email not verified. A new OTP has been sent to your email.',
                            'requires_verification': True,
                            'email': user.email,
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
                refresh = RefreshToken.for_user(user)
                return Response({
                    'success': True,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'user': {
                        'email': user.email,
                        'username': user.username,
                        'name': user.get_full_name() or user.email,
                        'role': user.User_Role
                    }
                }, status=status.HTTP_200_OK)
            return Response({'success': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except CustomUser.DoesNotExist:
            return Response({'success': False, 'message': 'No account found with this email'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {'success': False, 'message': f'Login error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'Civic-User')

        if CustomUser.objects.filter(email=email).exists():
            return Response({'success': False, 'message': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if username and CustomUser.objects.filter(username=username).exists():
            return Response({'success': False, 'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            username=username or email.split('@')[0],
            User_Role=role,
            email_verified=False,
        )

        # Create Officer record if role is Officer
        try:
            if role == 'Officer':
                from departments.models import Officer as DeptOfficer
                officer_id = f"OFF{user.id}"
                DeptOfficer.objects.create(
                    officer_id=officer_id,
                    name=user.get_full_name() or user.username,
                    email=user.email,
                    phone=getattr(user, 'mobile_number', '') or ''
                )
        except Exception:
            pass

        # Generate and send OTP
        otp = EmailOTP.generate(user)
        sent = _send_otp_email(email, otp)

        return Response({
            'success': True,
            'message': 'Registration successful. Please check your email for the OTP to verify your account.',
            'email': email,
            'otp_sent': sent,
            'requires_verification': True,
        }, status=status.HTTP_201_CREATED)

class VerifyEmailOTP(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp   = request.data.get('otp', '').strip()

        if not email or not otp:
            return Response({'success': False, 'message': 'Email and OTP are required'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'success': False, 'message': 'User not found'}, status=404)

        if user.email_verified:
            # Already verified — just log them in
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'Email already verified.',
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {'email': user.email, 'username': user.username, 'name': user.get_full_name() or user.email, 'role': user.User_Role}
            })

        try:
            record = EmailOTP.objects.get(user=user)
        except EmailOTP.DoesNotExist:
            return Response({'success': False, 'message': 'OTP not found. Please request a new one.'}, status=400)

        if not record.is_valid():
            return Response({'success': False, 'message': 'OTP has expired. Please request a new one.'}, status=400)

        if record.otp != otp:
            return Response({'success': False, 'message': 'Invalid OTP. Please try again.'}, status=400)

        # Mark verified
        user.email_verified = True
        user.save(update_fields=['email_verified'])
        record.delete()

        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'Email verified successfully! Welcome to CivicTrack.',
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {'email': user.email, 'username': user.username, 'name': user.get_full_name() or user.email, 'role': user.User_Role}
        })


class ResendOTP(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'success': False, 'message': 'Email is required'}, status=400)
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'success': False, 'message': 'No account found with this email'}, status=404)

        if user.email_verified:
            return Response({'success': False, 'message': 'Email is already verified'}, status=400)

        otp  = EmailOTP.generate(user)
        sent = _send_otp_email(email, otp)
        return Response({
            'success': True,
            'message': 'A new OTP has been sent to your email.' if sent else 'OTP generated but email could not be sent. Check server email config.',
            'otp_sent': sent,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'success': True, 'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'success': True, 'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('token')
        
        try:
            GOOGLE_CLIENT_ID = '368010718950-mpbp3m0379j51abunusi6n1o2jtnq715.apps.googleusercontent.com'
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
            
            email = idinfo.get('email')
            name = idinfo.get('name')
            
            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': name.split()[0] if name else '',
                    'last_name': ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else '',
                    'User_Role': 'Civic-User'
                }
            )
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'email': user.email,
                    'username': user.username,
                    'name': user.get_full_name() or user.email,
                    'role': user.User_Role
                }
            }, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response({
                'success': False,
                'message': 'Invalid Google token'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDetail(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            serializer = UserDetailSerializer(user)
            return Response({
                "success": True,
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateUserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            user = request.user
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "success": True,
                    "message": "User details updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "success": False,
                    "message": "Validation failed",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        return self.patch(request)


class UserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated]  # Temporarily remove IsAdminUser for debugging

    def get(self, request):
        try:
            print("=== UserListCreateView GET called ===")
            print(f"Request user: {request.user}")
            print(f"User is authenticated: {request.user.is_authenticated}")
            print(f"User role: {getattr(request.user, 'User_Role', 'No role')}")
            
            users = CustomUser.objects.all()
            print(f"Total users found: {users.count()}")
            
            # Add complaint count for each user
            users_data = []
            for user in users:
                complaint_count = Complaint.objects.filter(user=user).count()
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'role': user.User_Role,
                    'is_active': user.is_active,
                    'date_joined': user.created_join,
                    'last_login': user.last_login,
                    'complaint_count': complaint_count
                }
                print(f"User data: {user_data}")
                users_data.append(user_data)
            
            print(f"Final users_data length: {len(users_data)}")
            
            # For now, return simple response without pagination
            return Response({
                'success': True,
                'count': len(users_data),
                'results': users_data
            })
            
        except Exception as e:
            print(f"Error in UserListCreateView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            print("=== UserListCreateView POST called ===")
            print(f"Request data: {request.data}")
            
            # Check if user has admin privileges
            if getattr(request.user, 'User_Role', None) != 'Admin-User':
                return Response({
                    'success': False,
                    'error': 'Only admin users can create new users'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get user data from request
            username = request.data.get('username')
            email = request.data.get('email')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            role = request.data.get('role', 'Civic-User')
            password = request.data.get('password')
            
            # Validate required fields
            if not username or not email or not password:
                return Response({
                    'success': False,
                    'error': 'Username, email, and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if username or email already exists
            if CustomUser.objects.filter(username=username).exists():
                return Response({
                    'success': False,
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if CustomUser.objects.filter(email=email).exists():
                return Response({
                    'success': False,
                    'error': 'Email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new user
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                User_Role=role,
                is_active=True
            )
            
            # Return created user data
            return Response({
                'success': True,
                'data': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.User_Role,
                    'is_active': user.is_active,
                    'date_joined': user.created_join
                },
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error in UserListCreateView POST: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserRetrieveUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user_id):
        try:
            return CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return None

    def get(self, request, user_id):
        try:
            user = self.get_object(user_id)
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)

            complaint_count = Complaint.objects.filter(user=user).count()

            return Response({
                'success': True,
                'data': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'role': user.User_Role,
                    'is_active': user.is_active,
                    'date_joined': user.created_join,
                    'last_login': user.last_login,
                    'complaint_count': complaint_count
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, user_id):
        try:
            user = self.get_object(user_id)
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Update fields
            user.username = request.data.get('username', user.username)
            user.email = request.data.get('email', user.email)
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.User_Role = request.data.get('role', user.User_Role)
            user.is_active = request.data.get('is_active', user.is_active)

            # Update password if provided
            password = request.data.get('password')
            if password:
                user.set_password(password)

            user.save()

            return Response({
                'success': True,
                'message': 'User updated successfully',
                'data': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'role': user.User_Role,
                    'is_active': user.is_active,
                    'date_joined': user.created_join,
                    'last_login': user.last_login
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, user_id):
        try:
            user = self.get_object(user_id)
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Prevent admin from deleting themselves
            if user.id == request.user.id:
                return Response({
                    'success': False,
                    'message': 'Cannot delete your own account'
                }, status=status.HTTP_400_BAD_REQUEST)

            user.delete()

            return Response({
                'success': True,
                'message': 'User deleted successfully'
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')
            
            if not old_password or not new_password:
                return Response({
                    'success': False,
                    'error': 'Both old and new passwords are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify old password
            if not user.check_password(old_password):
                return Response({
                    'success': False,
                    'error': 'Current password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password updated successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            from complaints.models import Complaint
            
            # Get user's complaints
            complaints = Complaint.objects.filter(user=user).order_by('-current_time')[:10]
            
            activities = []
            
            # Add complaint activities
            for complaint in complaints:
                activities.append({
                    'id': f'comp_{complaint.id}',
                    'type': 'submitted',
                    'title': 'Complaint Submitted',
                    'description': f'Reported {complaint.Category or "issue"}',
                    'timestamp': complaint.current_time.isoformat()
                })
                
                if complaint.status == 'Resolved':
                    activities.append({
                        'id': f'resolved_{complaint.id}',
                        'type': 'resolved',
                        'title': 'Complaint Resolved',
                        'description': f'{complaint.Category} issue resolved',
                        'timestamp': complaint.current_time.isoformat()
                    })
            
            # Add profile update activity (mock for now)
            activities.append({
                'id': 'profile_1',
                'type': 'updated',
                'title': 'Profile Updated',
                'description': 'Profile information updated',
                'timestamp': user.date_joined.isoformat()  # Using join date as fallback
            })
            
            # Add login activity
            if user.last_login:
                activities.append({
                    'id': 'login_1',
                    'type': 'login',
                    'title': 'Login',
                    'description': 'Successfully logged in',
                    'timestamp': user.last_login.isoformat()
                })
            
            # Sort by timestamp
            activities.sort(key=lambda x: x['timestamp'], reverse=True)
            
            return Response({
                'success': True,
                'data': activities[:20]  # Return last 20 activities
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ToggleTwoFactorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            enabled = request.data.get('enabled', False)
            
            # For demo purposes, we'll just return success
            # In real implementation, you would store this in user profile or separate model
            return Response({
                'success': True,
                'message': f'Two-factor authentication {"enabled" if enabled else "disabled"} successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            
            # Check if user is admin (consistent with Admin-User role used in login)
            if user.User_Role != 'Admin-User':
                return Response({
                    'success': False,
                    'error': 'Access denied. Admin access required.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get user statistics
            from complaints.models import Complaint
            total_complaints = Complaint.objects.count()
            resolved_complaints = Complaint.objects.filter(status='resolved').count()
            pending_complaints = Complaint.objects.filter(status__in=['Pending', 'in-progress']).count()
            
            # Get user statistics
            total_users = CustomUser.objects.count()
            active_users = CustomUser.objects.filter(is_active=True).count()
            
            profile_data = {
                'name': user.get_full_name() or user.username,
                'email': user.email,
                'phone': getattr(user, 'phone', ''),
                'role': user.User_Role,
                'department': 'System Administration',
                'avatar': '',
                'date_joined': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else '',
                'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else '',
                'is_active': user.is_active,
                'statistics': {
                    'total_complaints': total_complaints,
                    'resolved_complaints': resolved_complaints,
                    'pending_complaints': pending_complaints,
                    'total_users': total_users,
                    'active_users': active_users
                }
            }
            
            return Response({
                'success': True,
                'data': profile_data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminUpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        try:
            user = request.user
            
            # Check if user is admin
            if user.User_Role != 'Admin-User':
                return Response({
                    'success': False,
                    'error': 'Access denied. Admin access required.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update allowed fields
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.email = request.data.get('email', user.email)
            
            # Update phone if field exists
            if hasattr(user, 'phone'):
                user.phone = request.data.get('phone', user.phone)
            
            user.save()
            
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': {
                    'name': user.get_full_name() or user.username,
                    'email': user.email,
                    'phone': getattr(user, 'phone', ''),
                    'role': user.User_Role,
                    'department': 'System Administration'
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminSystemSettingsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            
            # Check if user is admin
            if user.User_Role != 'Admin-User':
                return Response({
                    'success': False,
                    'error': 'Access denied. Admin access required.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # System settings (you can store these in database or settings file)
            settings_data = {
                'siteName': 'CivicTrack System',
                'siteDescription': 'Civic Issue Reporting and Management System',
                'maintenanceMode': False,
                'allowRegistration': True,
                'emailNotifications': True,
                'smsNotifications': False,
                'defaultLanguage': 'en',
                'timezone': 'Asia/Kolkata',
                'maxFileSize': 10,  # MB
                'allowedFileTypes': ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
                'sessionTimeout': 30,  # minutes
                'passwordMinLength': 8,
                'requireEmailVerification': True
            }
            
            return Response({
                'success': True,
                'data': settings_data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        try:
            user = request.user
            
            # Check if user is admin
            if user.User_Role != 'Admin-User':
                return Response({
                    'success': False,
                    'error': 'Access denied. Admin access required.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update system settings (for demo, just return success)
            # In real implementation, you would save these to database or settings file
            
            return Response({
                'success': True,
                'message': 'System settings updated successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserComplaintsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            from complaints.models import Complaint
            
            # Get user's complaints
            complaints = Complaint.objects.filter(user=user).order_by('-created_at')
            
            # Serialize complaints
            complaints_data = []
            for complaint in complaints:
                complaints_data.append({
                    'id': complaint.id,
                    'title': complaint.title or 'Untitled Complaint',
                    'description': complaint.description or '',
                    'status': complaint.status or 'Pending',
                    'created_at': complaint.created_at.isoformat() if complaint.created_at else '',
                    'category': complaint.Category or 'General',
                    'priority': getattr(complaint, 'priority', 'Medium')
                })
            
            return Response({
                'success': True,
                'data': complaints_data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)