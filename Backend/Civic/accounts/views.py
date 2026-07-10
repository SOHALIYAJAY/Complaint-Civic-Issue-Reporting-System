from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser, PendingUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from accounts.serializers import UserRegister, UserDetailSerializer, UserUpdateSerializer, UserAdminSerializer
import os
import random
import logging
from datetime import timedelta
from complaints.models import Complaint
from rest_framework.pagination import PageNumberPagination
from django.db import IntegrityError
from django.db import transaction
from django.conf import settings as django_settings
from django.contrib.auth.hashers import make_password
from django.utils import timezone
import base64
import json

from accounts.sendgrid_email import send_otp_email

from accounts.google_token import verify_google_token, audience_matches_config


def _jwt_payload_unverified(token):
    """Decode JWT payload only for logging (does not verify signature)."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        pad = '=' * ((4 - len(parts[1]) % 4) % 4)
        raw = base64.urlsafe_b64decode(parts[1] + pad)
        return json.loads(raw.decode('utf-8'))
    except Exception:
        return {}


class TestAPIView(APIView):
    def get(self, request):
        return Response({
            'message': 'API is working',
            'status': 'success'
        })


def _redact_register_data(data):
    """For safe logging (works with QueryDict / dict)."""
    out = {}
    try:
        for key in data:
            out[key] = data.get(key)
    except Exception:
        return {}
    for k in list(out.keys()):
        lk = str(k).lower()
        if 'password' in lk or 'otp' in lk:
            out[k] = '***'
    return out


def _serializer_errors_message(errors):
    """Single human-readable line from DRF errors."""
    if isinstance(errors, dict):
        parts = []
        for key, val in errors.items():
            if isinstance(val, list):
                parts.append(f'{key}: {val[0]}' if val else key)
            elif isinstance(val, dict):
                parts.append(_serializer_errors_message(val))
            else:
                parts.append(f'{key}: {val}')
        return '; '.join(parts) if parts else 'Validation failed.'
    if isinstance(errors, list):
        return errors[0] if errors else 'Validation failed.'
    return str(errors)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'success': False, 'message': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(email__iexact=email)
            if user.check_password(password):
                if not user.is_active:
                    return Response(
                        {'success': False, 'message': 'User account is inactive'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                # Block login if email not verified
                if not user.email_verified:
                    new_otp = str(random.randint(100000, 999999))
                    user.otp = new_otp
                    user.save(update_fields=['otp'])
                    send_otp_email(user.email, new_otp)
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
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        logger = logging.getLogger(__name__)
        logger.info('Register request (redacted): %s', _redact_register_data(request.data))

        serializer = UserRegister(data=request.data)
        if not serializer.is_valid():
            msg = _serializer_errors_message(serializer.errors)
            logger.warning('Register validation failed: %s', serializer.errors)
            return Response(
                {
                    'success': False,
                    'message': msg,
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated = dict(serializer.validated_data)
        email = (validated.get('email') or '').strip().lower()
        username = (validated.get('username') or '').strip()
        role = validated.get('User_Role') or 'Civic-User'
        raw_password = validated.get('password') or ''

        # Cleanup expired pending rows opportunistically.
        PendingUser.objects.filter(updated_at__lt=timezone.now() - timedelta(minutes=10)).delete()

        if CustomUser.objects.filter(email=email).exists() or CustomUser.objects.filter(username=username).exists():
            return Response(
                {
                    'success': False,
                    'message': 'Email or username is already registered.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp = str(random.randint(100000, 999999))
        try:
            PendingUser.objects.update_or_create(
                email=email,
                defaults={
                    'username': username,
                    'password_hash': make_password(raw_password),
                    'user_role': role,
                    'otp': otp,
                },
            )
        except IntegrityError as e:
            logger.warning('Pending signup integrity error: %s', e)
            return Response(
                {
                    'success': False,
                    'message': 'Email or username is already registered.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.exception('Pending signup failed: %s', e)
            return Response(
                {
                    'success': False,
                    'message': 'Could not start signup. Please try again.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        print('OTP:', otp)
        print('Sending to:', email)
        send_otp_email(email, otp)

        return Response(
            {
                'success': True,
                'message': 'Signup started. OTP sent to email',
                'email': email,
                'otp_sent': True,
                'requires_verification': True,
            },
            status=status.HTTP_201_CREATED,
        )

class VerifyEmailOTP(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp = (request.data.get('otp') or '').strip().replace(' ', '')

        if not email or not otp:
            return Response({'success': False, 'message': 'Email and OTP are required'}, status=400)

        # Cleanup expired pending rows first.
        PendingUser.objects.filter(updated_at__lt=timezone.now() - timedelta(minutes=10)).delete()

        # Already-created user path (legacy compatibility).
        existing_user = CustomUser.objects.filter(email=email).first()
        if existing_user and existing_user.email_verified:
            refresh = RefreshToken.for_user(existing_user)
            return Response({
                'success': True,
                'message': 'Email verified successfully',
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {'email': existing_user.email, 'username': existing_user.username, 'name': existing_user.get_full_name() or existing_user.email, 'role': existing_user.User_Role}
            })

        # New pending signup path (user is created only after OTP success).
        pending = PendingUser.objects.filter(email=email).first()
        if pending:
            if not pending.is_valid():
                pending.delete()
                return Response(
                    {'success': False, 'error': 'Invalid OTP', 'message': 'OTP expired. Please signup again.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if (pending.otp or '').strip() != otp:
                return Response(
                    {'success': False, 'error': 'Invalid OTP', 'message': 'Invalid OTP'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if CustomUser.objects.filter(email=email).exists():
                pending.delete()
                return Response({'success': False, 'message': 'Email is already registered'}, status=400)

            if CustomUser.objects.filter(username=pending.username).exists():
                pending.username = f"{pending.username}_{random.randint(1000, 9999)}"
                pending.save(update_fields=['username'])

            with transaction.atomic():
                user = CustomUser.objects.create(
                    username=pending.username,
                    email=pending.email,
                    password=pending.password_hash,  # already hashed at signup
                    User_Role=pending.user_role,
                    is_verified=True,
                    email_verified=True,
                    otp=None,
                )
                pending.delete()

                if user.User_Role == 'Officer':
                    try:
                        from departments.models import Officer as DeptOfficer
                        officer_id = f"OFF{user.id}"
                        DeptOfficer.objects.get_or_create(
                            officer_id=officer_id,
                            defaults={
                                'name': user.get_full_name() or user.username,
                                'email': user.email,
                                'phone': getattr(user, 'mobile_number', '') or '',
                            },
                        )
                    except Exception:
                        pass

            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'Email verified successfully',
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {'email': user.email, 'username': user.username, 'name': user.get_full_name() or user.email, 'role': user.User_Role}
            })

        # Legacy unverified user path (existing DB users from earlier flow).
        if existing_user:
            stored = (existing_user.otp or '').strip()
            if not stored:
                return Response(
                    {
                        'success': False,
                        'error': 'Invalid OTP',
                        'message': 'No OTP on file. Use resend to get a new code.',
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if stored != otp:
                return Response(
                    {'success': False, 'error': 'Invalid OTP', 'message': 'Invalid OTP'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            existing_user.is_verified = True
            existing_user.email_verified = True
            existing_user.otp = None
            existing_user.save(update_fields=['is_verified', 'email_verified', 'otp'])

            refresh = RefreshToken.for_user(existing_user)
            return Response({
                'success': True,
                'message': 'Email verified successfully',
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {'email': existing_user.email, 'username': existing_user.username, 'name': existing_user.get_full_name() or existing_user.email, 'role': existing_user.User_Role}
            })

        return Response({'success': False, 'message': 'User not found'}, status=404)


class ResendOTP(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'success': False, 'message': 'Email is required'}, status=400)

        PendingUser.objects.filter(updated_at__lt=timezone.now() - timedelta(minutes=10)).delete()

        pending = PendingUser.objects.filter(email=email).first()
        if pending:
            new_otp = str(random.randint(100000, 999999))
            pending.otp = new_otp
            pending.save(update_fields=['otp', 'updated_at'])
            send_otp_email(email, new_otp)
            return Response({
                'success': True,
                'message': 'A new OTP has been sent to your email.',
                'otp_sent': True,
            })

        user = CustomUser.objects.filter(email=email).first()
        if not user:
            return Response({'success': False, 'message': 'No account found with this email'}, status=404)

        if user.email_verified:
            return Response({'success': False, 'message': 'Email is already verified'}, status=400)

        new_otp = str(random.randint(100000, 999999))
        user.otp = new_otp
        user.save(update_fields=['otp'])
        send_otp_email(email, new_otp)
        return Response({
            'success': True,
            'message': 'A new OTP has been sent to your email.',
            'otp_sent': True,
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
    """Exchange Google ID token for app JWT. No Authorization header required."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        logger = logging.getLogger(__name__)
        origin = request.META.get('HTTP_ORIGIN', '')
        logger.info('Google login request origin=%s', origin)

        token = request.data.get('token') or request.data.get('id_token') or request.data.get('credential')

        if not token:
            logger.warning('No token provided in request')
            return Response({
                'success': False,
                'message': 'Google token is required',
                'error_code': 'MISSING_TOKEN',
                'details': 'Please ensure you are logged in with Google and try again.'
            }, status=status.HTTP_400_BAD_REQUEST)

        expected_client_id = getattr(django_settings, 'GOOGLE_CLIENT_ID', '') or ''
        if not expected_client_id:
            logger.error('GOOGLE_CLIENT_ID is empty in Django settings')
            return Response({
                'success': False,
                'message': 'Google login not configured. Please contact administrator.',
                'error_code': 'CONFIGURATION_ERROR',
                'details': 'Set GOOGLE_CLIENT_ID in the environment to your Web client ID.',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        unverified = _jwt_payload_unverified(token)
        token_aud = unverified.get('aud')
        logger.info(
            'Google token aud (JWT payload, unverified)=%s iss=%s expected_client_id=%s',
            token_aud,
            unverified.get('iss'),
            expected_client_id,
        )

        try:
            idinfo = verify_google_token(token)

            if not audience_matches_config(idinfo):
                logger.warning(
                    'Audience mismatch after verify: idinfo[aud]=%r settings.GOOGLE_CLIENT_ID=%r',
                    idinfo.get('aud'),
                    expected_client_id,
                )
                return Response({
                    'success': False,
                    'message': 'Invalid Google token: Audience mismatch',
                    'error_code': 'AUDIENCE_MISMATCH',
                    'details': (
                        f'Token aud={idinfo.get("aud")!r} must equal '
                        f'settings.GOOGLE_CLIENT_ID={expected_client_id!r}.'
                    ),
                }, status=status.HTTP_400_BAD_REQUEST)

            # Extract user information safely
            email = idinfo.get('email')
            name = idinfo.get('name')
            picture = idinfo.get('picture')
            
            logger.info(f'Token verified for email: {email}')
            
            # Email validation
            if not email:
                logger.error('No email found in Google token')
                return Response({
                    'success': False,
                    'message': 'Invalid Google token: Email not found',
                    'error_code': 'INVALID_EMAIL',
                    'details': 'The Google token does not contain a valid email address.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user exists and is active
            try:
                existing_user = CustomUser.objects.get(email=email)
                if existing_user and not existing_user.is_active:
                    logger.warning(f'User {email} exists but is not active')
                    return Response({
                        'success': False,
                        'message': 'Account is deactivated. Please contact administrator.',
                        'error_code': 'ACCOUNT_DEACTIVATED',
                        'details': 'Your account has been deactivated. Please contact support.'
                    }, status=status.HTTP_403_FORBIDDEN)
            except CustomUser.DoesNotExist:
                pass  # User doesn't exist, will create new one
            
            # Get or create user with proper defaults (CustomUser has no profile_picture field)
            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0][:150],  # Limit username length
                    'first_name': name.split()[0][:50] if name else '',
                    'last_name': ' '.join(name.split()[1:3])[:50] if name and len(name.split()) > 1 else '',  # Limit last name length
                    'User_Role': 'Civic-User',
                    'is_active': True,
                    'email_verified': True,
                    'is_verified': True,
                }
            )
            if created:
                user.set_unusable_password()
                user.save(update_fields=['password'])

            logger.info(f'User {"created" if created else "retrieved"}: {user.email}')
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_str = str(refresh.access_token)
            refresh_str = str(refresh)
            
            logger.info(f'JWT tokens generated for user: {user.email}')
            
            # Success response with complete user data
            return Response({
                'success': True,
                # SimpleJWT-style keys (for clients expecting access / refresh)
                'access': access_str,
                'refresh': refresh_str,
                # Legacy keys (existing frontend)
                'access_token': access_str,
                'refresh_token': refresh_str,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'name': user.get_full_name(),
                    'role': user.User_Role,
                    'profile_picture': picture or '',
                    'is_new_user': created
                },
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            logger.error('Google token validation error: %s', str(e))
            error_message = str(e)
            if 'audience' in error_message.lower():
                return Response({
                    'success': False,
                    'message': 'Invalid Google token: Audience mismatch',
                    'error_code': 'AUDIENCE_MISMATCH',
                    'details': (
                        f'Token aud (from JWT)={token_aud!r} must match '
                        f'settings.GOOGLE_CLIENT_ID={expected_client_id!r} (same as NEXT_PUBLIC_GOOGLE_CLIENT_ID).'
                    ),
                }, status=status.HTTP_400_BAD_REQUEST)
            elif 'expired' in error_message.lower():
                return Response({
                    'success': False,
                    'message': 'Google token has expired',
                    'error_code': 'TOKEN_EXPIRED',
                    'details': 'Please try logging in with Google again.'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'success': False,
                    'message': f'Invalid Google token: {str(e)}',
                    'error_code': 'INVALID_TOKEN',
                    'details': 'The Google token is invalid or malformed.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f'Google login error: {str(e)}', exc_info=True)
            return Response({
                'success': False,
                'message': 'Google login failed. Please try again.',
                'error_code': 'INTERNAL_ERROR',
                'details': 'An internal server error occurred. Please try again later.'
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