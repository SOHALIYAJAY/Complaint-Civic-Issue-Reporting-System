from django.shortcuts import render
from django.http import JsonResponse
import traceback
import math
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    # Default items per page
    page_size = 6
    # Allow clients to override using `limit` query param
    page_size_query_param = 'limit'
    max_page_size = 100

    def get_paginated_response(self, data):
        # Determine current page and page size to include helpful range info
        try:
            page_number = self.page.number
        except Exception:
            page_number = 1

        # Try to get page size from request or fallback to paginator value
        page_size = self.get_page_size(self.request) or getattr(self.page.paginator, 'per_page', self.page_size)
        total = self.page.paginator.count
        start = (page_number - 1) * page_size + 1 if total > 0 else 0
        end = min(page_number * page_size, total)

        return Response({
            'count': total,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'page': page_number,
            'page_size': page_size,
            'start': start,
            'end': end,
            'results': data
        })
from django.db.models import Count, Q
from django.db.models.functions import ExtractMonth, ExtractYear
from complaints.models import Complaint
from Categories.models import Category
from accounts.models import CustomUser
from departments.models import Department, Officer
from departments.serializers import deptSerializer, OfficerSerializer
from Categories.serializers import ComplaintCategorySerializer
from complaints.serializers import ComplaintSerializer,ComplaintAssignmentSerializer
from complaints.models import ComplaintAssignment
import calendar
from datetime import datetime, timedelta
from django.utils import timezone


class getcomplaint(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        qs = Complaint.objects.filter(user=self.request.user).order_by('-current_time')
        status = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        search = self.request.query_params.get('search')
        if status and status != 'all':
            qs = qs.filter(status__iexact=status)
        if category and category != 'all':
            qs = qs.filter(Category__name__iexact=category)
        if priority and priority != 'all':
            qs = qs.filter(priority_level__iexact=priority)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(Description__icontains=search))
        return qs


class getcomplaintlimit(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintSerializer
    def get_queryset(self):
        return Complaint.objects.filter(user=self.request.user).order_by('-id')[:3]


class getpubliccomplaints(ListAPIView):
    serializer_class = ComplaintSerializer
    
    def get_queryset(self):
        return Complaint.objects.all().order_by('-id')[:10]



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def complaintsinfo(request):
    total_comp = Complaint.objects.filter(user=request.user).count()
    resolved_comp = Complaint.objects.filter(status='Completed', user=request.user).count()
    pending_comp = Complaint.objects.filter(status='Pending', user=request.user).count()
    inprogress_comp = Complaint.objects.filter(status='In Process', user=request.user).count()
    
    return Response({
        'total_comp': total_comp,
        'resolved_comp': resolved_comp,
        'pending_comp': pending_comp,
        'inprogress_comp': inprogress_comp
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_complaints_admin(request):
    """
    Get recent complaints for admin dashboard (maximum 6)
    """
    try:
        # Get 6 most recent complaints ordered by current_time (most recent first)
        recent_complaints = Complaint.objects.all().order_by('-current_time')[:6]
        
        # Serialize the complaints
        serializer = ComplaintSerializer(recent_complaints, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': len(serializer.data)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to fetch recent complaints'
        }, status=500)


class compinfo(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        total_comp = Complaint.objects.filter(user=self.request.user).count()
        resolved_comp = Complaint.objects.filter(status='Completed', user=self.request.user).count()
        pending_comp = Complaint.objects.filter(status='Pending', user=self.request.user).count()
        In_progress_comp = Complaint.objects.filter(status='In Process', user=self.request.user).count()
        total_categories = Category.objects.all().count()
        return Response({
            'total_complaints': total_comp,
            'Resolved_complaints': resolved_comp,
            'Pending_complaints': pending_comp,
            'SLA_complaince': (resolved_comp / total_comp * 100) if total_comp > 0 else 0,
            'in_progress_complaints': In_progress_comp,
            'total_categories': total_categories
        })


class complaintinfo(APIView):
    def get(self, request):
        try:
            # Get overall statistics for public display
            total_comp = Complaint.objects.all().count()
            resolved_comp = Complaint.objects.filter(status='Completed').count()
            pending_comp = Complaint.objects.filter(status='Pending').count()
            in_progress_comp = Complaint.objects.filter(status='In Process').count()
            total_categories = Category.objects.all().count()
            total_users = CustomUser.objects.all().count()
            total_departments = Department.objects.all().count()
            
            # Calculate SLA compliance
            sla_compliance = (resolved_comp / total_comp * 100) if total_comp > 0 else 0
            
            return Response({
                'total_complaints': total_comp,
                'resolved_complaints': resolved_comp,
                'pending_complaints': pending_comp,
                'in_progress_complaints': in_progress_comp,
                'sla_compliance': round(sla_compliance, 1),
                'total_categories': total_categories,
                'total_users': total_users,
                'total_departments': total_departments
            })
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch statistics'
            }, status=500)


@api_view(['GET'])
def complaintDetails(request, pk):
    try:
        compdetail = Complaint.objects.get(pk=pk)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ComplaintSerializer(compdetail)
    return Response({'compdetail': serializer.data})


class UserDetail(APIView):
    def get(self, request):
        try:
         
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_detail = request.user
            else:
                user_detail = CustomUser.objects.first()
            
            if not user_detail:
                return Response({
                    'error': 'No users found',
                    'message': 'Please create a user account first'
                }, status=404)
            
            return Response({
                'id': user_detail.id,
                'email': user_detail.email,
                'username': getattr(user_detail, 'username', ''),
                'first_name': getattr(user_detail, 'first_name', ''),
                'last_name': getattr(user_detail, 'last_name', ''),
                'created_join': getattr(user_detail, 'created_join', None),
                'is_staff': getattr(user_detail, 'is_staff', False),
                'is_superuser': getattr(user_detail, 'is_superuser', False)
            })
            
        except Exception as e:
            print(f"UserDetail error: {e}")  # Debug print
            return Response({
                'error': str(e),
                'message': 'Failed to fetch user details'
            }, status=500)


class ComplaintStatusStats(APIView):
    def get(self, request):
        try:
            complaints = Complaint.objects.filter(user=request.user)

            # Count complaints by status
            status_counts = {
                'open': complaints.filter(status='Pending').count(),
                'in_progress': complaints.filter(status='in-progress').count(),
                'resolved': complaints.filter(status='resolved').count(),
                'pending': complaints.filter(status='Pending').count()
            }
            
            return Response(status_counts)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch complaint status statistics'
            }, status=500)


class ComplaintMonthlyStats(APIView):
    def get(self, request):
        try:
            from django.db.models import Count
            from django.db.models.functions import ExtractMonth
            import calendar
            
            # Get monthly complaint counts
            monthly_data = {}
            
            # Initialize all months with 0
            for month_num in range(1, 13):
                month_name = calendar.month_name[month_num]
                monthly_data[month_name] = 0
            
            # Count complaints by month (using current_time field instead of created_at)
            complaints_by_month = (
                Complaint.objects
                .annotate(month=ExtractMonth('current_time'))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            )
            
            # Fill in actual counts
            for item in complaints_by_month:
                month_name = calendar.month_name[item['month']]
                monthly_data[month_name] = item['count']
            
            return Response(monthly_data)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch monthly complaint statistics'
            }, status=500)


class DepartmentDashboardStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            complaints = Complaint.objects.all()

            total = complaints.count()
            pending = complaints.filter(status='Pending').count()
            in_progress = complaints.filter(status='In Process').count()
            resolved = complaints.filter(status='Completed').count()

            # Officer workload
            officers = Officer.objects.all()
            officer_workload = 0
            if officers.exists():
                total_assigned = complaints.exclude(officer_id=None).count()
                officer_workload = round(total_assigned / officers.count(), 1)

            sla_compliance = round((resolved / total * 100), 1) if total > 0 else 0

            # Monthly counts for current year (all complaints)
            current_year = timezone.now().year
            monthly_counts = {}
            for m in range(1, 13):
                monthly_counts[m] = complaints.filter(
                    current_time__year=current_year,
                    current_time__month=m
                ).count()

            # Recent complaints
            recent_data = []
            for comp in complaints.order_by('-current_time')[:5]:
                recent_data.append({
                    'id': comp.id,
                    'title': comp.title or 'Untitled',
                    'description': comp.Description,
                    'status': comp.status,
                    'priority': comp.priority_level,
                    'current_time': comp.current_time.strftime('%Y-%m-%d %H:%M') if comp.current_time else '',
                    'location_address': f"{comp.location_District}, {comp.location_taluk}" if comp.location_taluk else comp.location_District or '',
                    'Category': comp.Category.name if comp.Category else ''
                })

            # Recent activity
            recent_activity = []
            for comp in complaints.order_by('-current_time')[:3]:
                recent_activity.append({
                    'id': f'comp_{comp.id}',
                    'type': 'complaint',
                    'description': f'Complaint #{comp.id}: {comp.title or "Untitled"}',
                    'time': comp.current_time.strftime('%Y-%m-%d %H:%M') if comp.current_time else '',
                    'officer': comp.officer_id.name if comp.officer_id else 'Unassigned'
                })
            for comp in complaints.filter(status='Completed').order_by('-current_time')[:2]:
                recent_activity.append({
                    'id': f'resolution_{comp.id}',
                    'type': 'resolution',
                    'description': f'Complaint #{comp.id} resolved',
                    'time': comp.current_time.strftime('%Y-%m-%d %H:%M') if comp.current_time else '',
                    'officer': comp.officer_id.name if comp.officer_id else 'Unknown'
                })

            return Response({
                'stats': {
                    'total': total,
                    'pending': pending,
                    'inProgress': in_progress,
                    'resolved': resolved
                },
                'performance': {
                    'avgResolutionTime': 3.5,
                    'slaCompliance': sla_compliance,
                    'officerWorkload': officer_workload,
                    'citizenSatisfaction': 4.3
                },
                'monthlyCounts': monthly_counts,
                'recentComplaints': recent_data,
                'recentActivity': recent_activity[:5]
            })

        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch department dashboard data'
            }, status=500)


class deptinfo(ListAPIView):
    queryset = Department.objects.all()[:3]
    serializer_class = deptSerializer


class complaintinfo(APIView):
    def get(self, request):
        total_comp = Complaint.objects.all().count()
        return Response({"total_comp": total_comp})


class DepartmentList(ListAPIView):
    queryset = Department.objects.all()
    serializer_class = deptSerializer


class complaintofficer(CreateAPIView):
    queryset = ComplaintAssignment.objects.all()
    serializer_class = ComplaintAssignmentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        comp_val = data.get('complaint')
        if comp_val is not None and not str(comp_val).isdigit():
            m = re.search(r"(\d+)", str(comp_val))
            if m:
                data['complaint'] = int(m.group(1))

        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class officerprofile(APIView):
    permission_classes = []
    def get(self, request, officer_id):
        try:
            officer = Officer.objects.get(officer_id=officer_id)
            officer_serializer = OfficerSerializer(officer)

            resolved_comp = Complaint.objects.filter(officer_id=officer_id, status='Completed').count()
            total_comp = Complaint.objects.filter(officer_id=officer_id).count()
            pending_comp = Complaint.objects.filter(officer_id=officer_id, status='Pending').count()
            in_progress_comp = Complaint.objects.filter(officer_id=officer_id, status='In Process').count()

            assigned_complaints = Complaint.objects.filter(officer_id=officer_id)
            complaints_serializer = ComplaintSerializer(assigned_complaints, many=True)

            return Response({
                'officer': officer_serializer.data,
                'resolved_comp': resolved_comp,
                'total_comp': total_comp,
                'pending_comp': pending_comp,
                'in_progress_comp': in_progress_comp,
                'assigned_complaints': complaints_serializer.data
            })
        except Officer.DoesNotExist:
            return Response({'error': 'Officer not found'}, status=status.HTTP_404_NOT_FOUND)


class officerkpi(APIView):
    def get(self, request):
        total_officers = Officer.objects.all().count()
        active_officers = Officer.objects.filter(is_available=True).count()
        total_assigned = Complaint.objects.exclude(officer_id=None).count()
        resolved_comp = Complaint.objects.filter(status='Completed').count()
        total_comp = Complaint.objects.all().count()
        sla_compliance = (resolved_comp / total_comp * 100) if total_comp > 0 else 0

        overloaded = 0
        for officer in Officer.objects.all():
            active_count = Complaint.objects.filter(officer_id=officer.officer_id).exclude(status='Completed').count()
            if active_count > 20:
                overloaded += 1

        return Response({
            'total_officers': total_officers,
            'active_officers': active_officers,
            'total_assigned': total_assigned,
            'sla_compliance': round(sla_compliance, 1),
            'overloaded': overloaded
        })


class adminallcomplaintcart(APIView):
    def get(self, request):
        total_comp = Complaint.objects.all().count()
        Pending_comp = Complaint.objects.filter(status='Pending').count()
        resolved_comp = Complaint.objects.filter(status='Completed').count()
        inprogress_comp = Complaint.objects.filter(status='In Process').count()
        rejected_comp = 0
        sla_compliance = (resolved_comp / total_comp * 100) if total_comp > 0 else 0

        return Response({
            'total_comp': total_comp,
            'Pending_comp': Pending_comp,
            'resolved_comp': resolved_comp,
            'inprogress_comp': inprogress_comp,
            'rejected_comp': rejected_comp,
            'sla_compliance': round(sla_compliance, 1)
        })


class adimncomplaints(ListAPIView):
    queryset = Complaint.objects.all().order_by('-current_time')
    serializer_class = ComplaintSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Apply filters if provided
        department = self.request.query_params.get('department')
        status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        date_range = self.request.query_params.get('date_range')
        search = self.request.query_params.get('search')
        district = self.request.query_params.get('district')
        assigned = self.request.query_params.get('assigned')
        
        if department and department != 'all':
            # frontend may send category id or name; handle both
            try:
                dept_id = int(department)
                queryset = queryset.filter(Category_id=dept_id)
            except Exception:
                queryset = queryset.filter(Category__name=department)
        if status and status != 'all':
            status_map = {
                'in-progress': 'In Process',
                'in_progress': 'In Process',
                'inprogress': 'In Process',
                'In Process': 'In Process',
                'resolved': 'Completed',
                'Completed': 'Completed',
                'Pending': 'Pending',
                'pending': 'Pending',
            }
            normalized = status_map.get(status, status)
            queryset = queryset.filter(status=normalized)
        if priority and priority != 'all':
            queryset = queryset.filter(priority_level=priority)
        if date_range and date_range != 'all':
            # Apply date range filtering logic using current_time field
            from datetime import datetime, timedelta
            from django.utils import timezone
            now = timezone.now()
            start = None
            if date_range == 'today':
                start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            elif date_range == 'week':
                start = now - timedelta(days=7)
            elif date_range == 'month':
                start = now - timedelta(days=30)
            elif date_range == 'quarter':
                start = now - timedelta(days=90)
            elif date_range == 'year':
                start = now - timedelta(days=365)

            if start:
                queryset = queryset.filter(current_time__gte=start, current_time__lte=now)
        if district:
            queryset = queryset.filter(location_District__iexact=district)
        if assigned:
            if assigned == 'assigned':
                queryset = queryset.exclude(officer_id=None)
            elif assigned == 'unassigned':
                queryset = queryset.filter(officer_id=None)
        if search:
            # If search is numeric, try matching id; otherwise search multiple text fields
            if str(search).isdigit():
                queryset = queryset.filter(id=int(search))
            else:
                queryset = queryset.filter(
                    Q(title__icontains=search) |
                    Q(Description__icontains=search) |
                    Q(location_address__icontains=search) |
                    Q(location_District__icontains=search)
                )
            
        return queryset


class ComplaintDelete(APIView):
    def delete(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
            complaint.delete()
            return Response({'success': True, 'message': f'Complaint {pk} deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Updatecomp(APIView):
    def patch(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)

        allowed = ['title', 'Description', 'priority_level', 'status', 'location_address', 'location_District', 'location_taluk']
        data = {k: v for k, v in request.data.items() if k in allowed}

        serializer = ComplaintSerializer(complaint, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class assigncomp(APIView):
    def post(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
            officer_id = request.data.get('officer_id')
            officer = Officer.objects.get(officer_id=officer_id)
            complaint.officer_id = officer
            complaint.save()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
        except Officer.DoesNotExist:
            return Response({'error': 'Officer not found'}, status=status.HTTP_404_NOT_FOUND)


class crateofficer(CreateAPIView):
    queryset = Officer.objects.all()
    serializer_class = OfficerSerializer

    def create(self, request, *args, **kwargs):
        """
        Create both:
        - departments.Officer (assignment/work profile)
        - accounts.CustomUser with role='Officer' (login account)
        """
        from django.db import IntegrityError, transaction

        officer_id = request.data.get('officer_id')
        name = request.data.get('name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        is_available = request.data.get('is_available', True)
        password = request.data.get('password')

        if not officer_id or not name or not email or phone is None or password is None:
            return Response(
                {'success': False, 'error': 'officer_id, name, email, phone, and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        officer_id = str(officer_id).strip()
        if len(officer_id) > 10:
            return Response(
                {'success': False, 'error': 'officer_id must be <= 10 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = str(email).strip().lower()
        phone = str(phone).strip()

        # Split full name into first/last for the auth user fields.
        name_parts = str(name).strip().split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        with transaction.atomic():
            try:
                user = CustomUser.objects.filter(email=email).first()

                if user:
                    # Update existing officer login user
                    username = email.split('@')[0]
                    if not CustomUser.objects.filter(username=username).exclude(id=user.id).exists():
                        user.username = username
                    user.first_name = first_name
                    user.last_name = last_name
                    user.mobile_number = phone
                    user.User_Role = 'Officer'
                    user.is_active = True
                    user.set_password(password)
                    user.save()
                else:
                    username = email.split('@')[0]
                    user = CustomUser.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        first_name=first_name,
                        last_name=last_name,
                        User_Role='Officer',
                        mobile_number=phone,
                        is_active=True,
                    )

                officer, created = Officer.objects.get_or_create(
                    officer_id=officer_id,
                    defaults={
                        'name': str(name).strip(),
                        'email': email,
                        'phone': phone,
                        'is_available': bool(is_available),
                    }
                )
                if not created:
                    officer.name = str(name).strip()
                    officer.email = email
                    officer.phone = phone
                    officer.is_available = bool(is_available)

                # Link officer to department if department_code provided
                dept_code = request.data.get('department_code')
                if dept_code:
                    dept = Department.objects.filter(category=dept_code).first()
                    if dept:
                        officer.department = dept
                officer.save()

                return Response(
                    {
                        'success': True,
                        'data': {
                            'officer': self.get_serializer(officer).data,
                            'user': {
                                'id': user.id,
                                'email': user.email,
                                'role': user.User_Role,
                            }
                        },
                        'message': 'Officer created successfully'
                    },
                    status=status.HTTP_201_CREATED
                )
            except IntegrityError as e:
                return Response(
                    {'success': False, 'error': f'Integrity error: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {'success': False, 'error': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )


class CategoriesList(APIView):
    def get(self, request):
        categories = Category.objects.all()
        categoinfo = [
            {'id': c.id, 'name': c.name, 'code': c.code, 'department': c.department, 'total_comp': c.total_comp}
            for c in categories
        ]
        return Response(categoinfo)

    def post(self, request):
        serializer = ComplaintCategorySerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            return Response(
                {'id': category.id, 'name': category.name, 'code': category.code, 'department': category.department, 'total_comp': category.total_comp},
                status=status.HTTP_201_CREATED
            )
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

 
 
class CategoryDelete(APIView):
    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
            category.delete()
            return Response({'success': True, 'message': f'Category {pk} deleted'}, status=status.HTTP_200_OK)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CategoryUpdate(APIView):

    def patch(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ComplaintCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class adminstats(APIView):
    def get(self, request):
        return Response({
            'total_users': CustomUser.objects.all().count(),
            'total_categories': Category.objects.all().count(),
            'total_officers': Officer.objects.all().count(),
        })


class admindashboardcard(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get all complaints statistics
            total_complaints = Complaint.objects.all().count()
            resolved_complaints = Complaint.objects.filter(status='Completed').count()
            pending_complaints = Complaint.objects.filter(status='Pending').count()
            inprogress_complaints = Complaint.objects.filter(status='In Process').count()
            rejected_complaints = 0
            
            return Response({
                'total_complaints': total_complaints,
                'resolved_complaints': resolved_complaints,
                'pending_complaints': pending_complaints,
                'inprogress_complaints': inprogress_complaints,
                'rejected_complaints': rejected_complaints,
                'total_comp': total_complaints,
                'resolved_comp': resolved_complaints,
                'Pending_comp': pending_complaints,
                'inprogress_comp': inprogress_complaints,
                'rejected_comp': rejected_complaints
            })
        except Exception as e:
            print(f"Error in admindashboardcard: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response({
                'error': str(e),
                'message': 'Failed to fetch dashboard statistics'
            }, status=500)


class UserRoleDistribution(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            regular_users = CustomUser.objects.filter(User_Role='Civic-User').count()
            officers = CustomUser.objects.filter(User_Role='Officer').count()
            admins = CustomUser.objects.filter(User_Role='Admin-User').count()
            department_users = CustomUser.objects.filter(User_Role='Department-User').count()
            return Response({
                'regular_users': regular_users,
                'officers': officers,
                'admins': admins,
                'department_users': department_users,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class ComplaintStatusTrends(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from datetime import datetime
            now = datetime.now()
            is_admin = request.user.is_staff or request.user.User_Role == 'Admin-User'
            view = request.query_params.get('view', 'monthly')
            year_param = request.query_params.get('year')  # specific year e.g. '2023'
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            # --- Yearly overview (last 5 years) ---
            if view == 'yearly':
                yearly_data = []
                for years_ago in range(4, -1, -1):
                    y = now.year - years_ago
                    count = Complaint.objects.filter(current_time__year=y).count() if is_admin \
                        else Complaint.objects.filter(user=request.user, current_time__year=y).count()
                    yearly_data.append({'year': str(y), 'complaints': count})
                return Response({
                    'yearly_data': yearly_data,
                    'total_complaints': sum(d['complaints'] for d in yearly_data)
                })

            # --- Month-wise for a specific year ---
            if year_param and year_param.isdigit():
                y = int(year_param)
                monthly_data = []
                for m in range(1, 13):
                    count = Complaint.objects.filter(current_time__year=y, current_time__month=m).count() if is_admin \
                        else Complaint.objects.filter(user=request.user, current_time__year=y, current_time__month=m).count()
                    monthly_data.append({'month': month_names[m - 1], 'month_number': m, 'year': y, 'complaints': count})
                return Response({
                    'monthly_data': monthly_data,
                    'total_complaints': sum(d['complaints'] for d in monthly_data)
                })

            # --- Default: rolling last 12 months ---
            monthly_data = []
            for months_ago in range(11, -1, -1):
                total_months = now.year * 12 + now.month - 1 - months_ago
                y = total_months // 12
                m = (total_months % 12) + 1
                month_label = f"{month_names[m - 1]} {y}"
                count = Complaint.objects.filter(current_time__year=y, current_time__month=m).count() if is_admin \
                    else Complaint.objects.filter(user=request.user, current_time__year=y, current_time__month=m).count()
                monthly_data.append({'month': month_label, 'month_number': m, 'year': y, 'complaints': count})
            return Response({
                'monthly_data': monthly_data,
                'total_complaints': sum(d['complaints'] for d in monthly_data)
            })
        except Exception as e:
            return Response({'error': str(e), 'message': 'Failed to fetch complaint trends'}, status=500)


class CivicUserActivityView(APIView):
    def get(self, request):
        try:
            # Get user from request
            user = request.user
            if not user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=401)
            
            # Get user's complaints
            user_complaints = Complaint.objects.filter(user=user).order_by('-created_at')[:10]
            
            # Create activity data from user's complaints
            activities = []
            for complaint in user_complaints:
                activity = {
                    'id': f'complaint_{complaint.id}',
                    'type': 'submitted' if complaint.status == 'Pending' else 'updated' if complaint.status == 'in-progress' else 'resolved',
                    'title': f'Complaint {complaint.status}',
                    'description': complaint.title or 'No description available',
                    'timestamp': complaint.current_time.isoformat(),
                }
                activities.append(activity)
            
            # Add login activity
            activities.append({
                'id': 'login_recent',
                'type': 'login',
                'title': 'Login',
                'description': f'Successfully logged in as {user.username}',
                'timestamp': timezone.now().isoformat(),
            })
            
            # Sort by timestamp (most recent first)
            activities.sort(key=lambda x: x['timestamp'], reverse=True)
            
            return Response({
                'data': activities[:10]  # Return only 10 most recent activities
            })
            
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch user activity'
            }, status=500)

class CategoryList(ListAPIView):
    queryset=Category.objects.all()
    serializer_class=ComplaintCategorySerializer
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            # Add complaint counts to each category
            categories_with_counts = []
            for category in serializer.data:
                complaint_count = Complaint.objects.filter(Category_id=category['id']).count()
                categories_with_counts.append({
                    'id': category['id'],
                    'name': category['name'],
                    'code': category['code'],
                    'department': category['department'],
                    'total_comp': complaint_count
                })
            
            return Response(categories_with_counts)
        except Exception as e:
            print(f"Error in CategoryList: {str(e)}")
            return Response([])

class TotalCategories(APIView):
    def get(self, request):
        try:
            # Count complaints per category, ordered by count descending
            # Include ALL categories that have at least 1 complaint
            from django.db.models import Count
            results = (
                Complaint.objects
                .values('Category__name', 'Category__id')
                .annotate(total=Count('id'))
                .filter(total__gt=0)
                .order_by('-total')
            )
            data = [
                {
                    'name': r['Category__name'] or 'Uncategorized',
                    'total_comp': r['total']
                }
                for r in results
            ]
            return Response(data)
        except Exception as e:
            return Response([])

class TestCategories(APIView):
    def get(self, request):
        """Simple test endpoint to verify frontend-backend connection"""
        try:
            print("DEBUG: TestCategories endpoint called")
            
            # Return some hardcoded test data first
            test_data = [
                {'name': 'Roads & Infrastructure', 'total_comp': 25},
                {'name': 'Water Supply', 'total_comp': 18},
                {'name': 'Sanitation', 'total_comp': 12},
                {'name': 'Street Lighting', 'total_comp': 8},
                {'name': 'Drainage', 'total_comp': 6}
            ]
            
            print(f"DEBUG: Returning test data: {test_data}")
            return Response(test_data)
            
        except Exception as e:
            print(f"ERROR in TestCategories: {str(e)}")
            return Response([], status=500)

class TrackComplaint(APIView):
    def get(self, request, pk=None):
        try:
            complaint = Complaint.objects.get(id=pk)
            serializer = ComplaintSerializer(complaint)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Complaint.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Complaint not found'
            }, status=404)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)

class ComplaintMonthWise(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return Response({
                'error': 'Authentication required'
            }, status=401)
            
        from datetime import datetime
        current_year = datetime.now().year
        
        # Initialize all months with 0
        month_data = {
            1: {'month': 'Jan', 'count': 0},
            2: {'month': 'Feb', 'count': 0},
            3: {'month': 'Mar', 'count': 0},
            4: {'month': 'Apr', 'count': 0},
            5: {'month': 'May', 'count': 0},
            6: {'month': 'Jun', 'count': 0},
            7: {'month': 'Jul', 'count': 0},
            8: {'month': 'Aug', 'count': 0},
            9: {'month': 'Sep', 'count': 0},
            10: {'month': 'Oct', 'count': 0},
            11: {'month': 'Nov', 'count': 0},
            12: {'month': 'Dec', 'count': 0}
        }
        
        try:
            # Get actual complaint counts for each month
            for i in range(1, 13):
                count = Complaint.objects.filter(
                    current_time__month=i,
                    current_time__year=current_year,
                    user=request.user
                ).count()
                month_data[i]['count'] = count
            
            # Return both formats for compatibility
            response_data = {
                'monthly_data': month_data,
                'simplified': {i: month_data[i]['count'] for i in month_data},
                'year': current_year
            }
            
            return Response(response_data)
        except Exception as e:
            print(f"Error in ComplaintMonthWise: {e}")
            # Return default values if there's an error
            return Response({
                'monthly_data': month_data,
                'simplified': {i: 0 for i in month_data},
                'year': current_year
            })

class ComplaintStatus(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Check if user is authenticated
            if not request.user or not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=401)
                
            status_counts = {
                'Pending': Complaint.objects.filter(status='Pending', user=request.user).count(),
                'In Progress': Complaint.objects.filter(status='In Process', user=request.user).count(),
                'Resolved': Complaint.objects.filter(status='Completed', user=request.user).count(),
                'Rejected': 0,
            }
            return Response(status_counts)
        except Exception as e:
            print(f"Error in ComplaintStatus: {e}")
            # Return default values if there's an error
            return Response({
                'Pending': 0,
                'In Progress': 0,
                'Resolved': 0,
                'Rejected': 0
            })

class OfficerDelete(APIView):
    def delete(self, request, pk=None):
        try:
            from departments.models import Officer
            officer = Officer.objects.get(officer_id=pk)
            # Best-effort: delete linked officer login account too.
            # Linking is done by email (officer portal resolver also falls back to email).
            try:
                officer_email = officer.email
                CustomUser.objects.filter(email=officer_email, User_Role='Officer').delete()
            except Exception:
                pass

            officer.delete()
            return Response({
                'success': True,
                'message': 'Officer deleted successfully'
            })
        except Officer.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Officer not found'
            }, status=404)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)

class OfficerUpdate(APIView):
    def put(self, request, pk=None):
        try:
            from departments.models import Officer
            officer = Officer.objects.get(officer_id=pk)

            old_email = officer.email
            
            # Update fields
            officer.name = request.data.get('name', officer.name)
            officer.email = request.data.get('email', officer.email)
            officer.phone = request.data.get('phone', officer.phone)
            officer.is_available = request.data.get('is_available', officer.is_available)
            
            officer.save()

            # Keep the login user in sync (if one exists for this officer).
            try:
                user = CustomUser.objects.filter(email=old_email, User_Role='Officer').first()
                if user:
                    # Update email/phone/name on the auth user
                    user.email = officer.email
                    user.mobile_number = officer.phone

                    name_parts = str(officer.name).strip().split(' ', 1)
                    user.first_name = name_parts[0] if name_parts else ''
                    user.last_name = name_parts[1] if len(name_parts) > 1 else ''

                    # Update username to match email prefix, but avoid unique collisions.
                    next_username = officer.email.split('@')[0]
                    if not CustomUser.objects.filter(username=next_username).exclude(id=user.id).exists():
                        user.username = next_username

                    user.User_Role = 'Officer'
                    user.is_active = True
                    user.save()
            except Exception:
                # Don't fail officer update if user sync fails.
                pass
            
            return Response({
                'success': True,
                'message': 'Officer updated successfully',
                'data': {
                    'officer_id': officer.officer_id,
                    'name': officer.name,
                    'email': officer.email,
                    'phone': officer.phone,
                    'is_available': officer.is_available
                }
            })
        except Officer.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Officer not found'
            }, status=404)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)

class AdminUserStats(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get user statistics
            total_users = CustomUser.objects.all().count()
            active_users = CustomUser.objects.filter(is_active=True).count()
            inactive_users = total_users - active_users
            
            # Get role distribution using correct role names
            civic_users = CustomUser.objects.filter(User_Role='Civic-User').count()
            department_users = CustomUser.objects.filter(User_Role='Department-User').count()
            admin_users = CustomUser.objects.filter(User_Role='Admin-User').count()
            
            # Get total complaints count
            total_complaints = Complaint.objects.all().count()
            
            return Response({
                'totalUsers': total_users,
                'activeUsers': active_users,
                'inactiveUsers': inactive_users,
                'totalComplaints': total_complaints,
                'roleDistribution': [
                    { 'name': 'Civic User', 'value': civic_users, 'color': '#8b5cf6' },
                    { 'name': 'Department User', 'value': department_users, 'color': '#10b981' },
                    { 'name': 'Admin User', 'value': admin_users, 'color': '#ef4444' }
                ]
            })
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch user statistics'
            }, status=500)


class ComplaintPriorityDistribution(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get complaint distribution by priority
            high_priority = Complaint.objects.filter(priority_level='High').count()
            medium_priority = Complaint.objects.filter(priority_level='Medium').count()
            low_priority = Complaint.objects.filter(priority_level='Low').count()
            
            # Get complaint distribution by status
            pending_status = Complaint.objects.filter(status='Pending').count()
            inprogress_status = Complaint.objects.filter(status='In Process').count()
            resolved_status = Complaint.objects.filter(status='Completed').count()
            
            # Get monthly complaint trends (last 6 months)
            from django.db.models import Count
            from django.utils import timezone
            from datetime import timedelta
            
            end_date = timezone.now()
            monthly_trends = []
            
            for i in range(6):
                start_date = end_date - timedelta(days=30)
                month_name = start_date.strftime('%B %Y')
                
                month_complaints = Complaint.objects.filter(
                    current_time__gte=start_date,
                    current_time__lt=end_date
                ).count()
                
                monthly_trends.append({
                    'month': month_name,
                    'complaints': month_complaints
                })
                
                end_date = start_date
            
            return Response({
                'priority_distribution': [
                    { 'name': 'High Priority', 'value': high_priority, 'color': '#ef4444' },
                    { 'name': 'Medium Priority', 'value': medium_priority, 'color': '#f59e0b' },
                    { 'name': 'Low Priority', 'value': low_priority, 'color': '#10b981' }
                ],
                'status_distribution': [
                    { 'name': 'Pending', 'value': pending_status, 'color': '#f59e0b' },
                    { 'name': 'In Progress', 'value': inprogress_status, 'color': '#3b82f6' },
                    { 'name': 'Resolved', 'value': resolved_status, 'color': '#10b981' }
                ],
                'monthly_trends': monthly_trends
            })
            
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch complaint distribution data'
            }, status=500)


class OfficerAnalytics(APIView):
    def get(self, request):
        try:
            from departments.models import Officer, Department
            from django.db.models import Count, Q
            
            # Total officers
            total_officers = Officer.objects.count()
            
            # Available vs Unavailable
            available_officers = Officer.objects.filter(is_available=True).count()
            unavailable_officers = total_officers - available_officers
            
            # Officers with active complaints
            officers_with_complaints = Complaint.objects.filter(
                officer_id__isnull=False,
                status__in=['Pending', 'In Process']
            ).values('officer_id').distinct().count()
            
            # Category-wise officer distribution - include ALL categories
            department_stats = {}
            
            # Get all categories and count officers assigned to each
            categories = Category.objects.all()
            for category in categories:
                # Count officers who have complaints in this category
                officer_ids_in_category = Complaint.objects.filter(
                    Category=category,
                    officer_id__isnull=False
                ).values_list('officer_id', flat=True).distinct()
                
                officer_count = len(officer_ids_in_category)
                
                # Count active complaints in this category
                active_complaints = Complaint.objects.filter(
                    Category=category,
                    status__in=['Pending', 'In Process']
                ).count()
                
                # Include ALL categories, even with 0 officers
                department_stats[category.name] = {
                    'officers': officer_count,
                    'active_complaints': active_complaints
                }
            
            # Workload distribution
            workload_data = []
            for officer in Officer.objects.all():
                # Count all assigned complaints (both active and resolved)
                total_assigned = Complaint.objects.filter(officer_id=officer.officer_id).count()
                # Count only active complaints
                active_complaints = Complaint.objects.filter(
                    officer_id=officer.officer_id,
                    status__in=['Pending', 'In Process']
                ).count()
                
                workload_data.append({
                    'officer_id': officer.officer_id,
                    'name': officer.name,
                    'total_assigned': total_assigned,
                    'active_complaints': active_complaints,
                    'resolved_complaints': total_assigned - active_complaints,
                    'is_available': officer.is_available
                })
            
            return Response({
                'total_officers': total_officers,
                'available_officers': available_officers,
                'unavailable_officers': unavailable_officers,
                'officers_with_complaints': officers_with_complaints,
                'department_stats': department_stats,
                'workload_data': workload_data,
                'availability_percentage': round((available_officers / total_officers) * 100, 1) if total_officers > 0 else 0
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)

class Logout(APIView):
    def post(self, request):
        try:
            # Clear session data
            if hasattr(request, 'session'):
                request.session.flush()
            
            # Clear any authentication tokens
            response = Response({
                'success': True,
                'message': 'Logged out successfully'
            })
            
            # Clear cookies if any
            response.delete_cookie('sessionid')
            response.delete_cookie('csrftoken')
            
            return response
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)
            

class ComplaintInDetail(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk=None):
        try:
            if pk:
                # Return specific complaint details
                comp = Complaint.objects.get(pk=pk)
                
                # Handle image_video field properly
                image_url = None
                if comp.image_video:
                    try:
                        raw_url = comp.image_video.url if hasattr(comp.image_video, 'url') else str(comp.image_video)
                        # Ensure absolute URL for frontend consumption
                        if raw_url and not raw_url.startswith('http'):
                            image_url = request.build_absolute_uri(raw_url)
                        else:
                            image_url = raw_url
                    except (ValueError, AttributeError):
                        image_url = None
                
                # Handle officer information: officer_id is a ForeignKey to Officer model
                officer_id = None
                assigned_officer = None
                if comp.officer_id:
                    try:
                        # comp.officer_id is already an Officer object due to ForeignKey
                        officer_obj = comp.officer_id
                        print(f"Officer object found: {officer_obj}")
                        print(f"Officer name: {officer_obj.name}")
                        print(f"Officer email: {officer_obj.email}")
                        print(f"Officer phone: {officer_obj.phone}")
                        
                        assigned_officer = {
                            'id': officer_obj.officer_id,
                            'name': officer_obj.name,
                            'email': officer_obj.email,
                            'phone': officer_obj.phone,
                            'is_available': officer_obj.is_available
                        }
                        officer_id = officer_obj.officer_id
                        print(f"Officer data compiled: {assigned_officer}")
                    except Exception as e:
                        print(f"Error processing officer data: {e}")
                        officer_id = str(comp.officer_id)
                        print(f"Fallback officer_id: {officer_id}")
                
                return Response({
                    'id': comp.id,
                    'comp_name': comp.title,
                    'filed_on': comp.current_time.strftime('%Y-%m-%d %H:%M:%S') if comp.current_time else None,
                    'description': comp.Description,
                    'upload_image': image_url,
                    'status': comp.status,
                    'priority': comp.priority_level,
                    'location_address': comp.location_address,
                    'location_district': comp.location_District,
                    'location_taluk': comp.location_taluk,
                    'officer_id': officer_id,
                    'assigned_officer': assigned_officer
                })
            else:
                # Return all complaints with basic details
                complaints = Complaint.objects.all()
                complaint_list = []
                for comp in complaints:
                    # Handle image_video field properly
                    image_url = None
                    if comp.image_video:
                        try:
                            raw_url = comp.image_video.url if hasattr(comp.image_video, 'url') else str(comp.image_video)
                            if raw_url and not raw_url.startswith('http'):
                                image_url = request.build_absolute_uri(raw_url)
                            else:
                                image_url = raw_url
                        except (ValueError, AttributeError):
                            image_url = None
                    
                    # Handle officer information for list view
                    officer_id = None
                    assigned_officer = None
                    if comp.officer_id:
                        try:
                            if hasattr(comp.officer_id, 'id') and hasattr(comp.officer_id, 'get_full_name'):
                                officer_obj = comp.officer_id
                            else:
                                officer_obj = Officer.objects.filter(Q(id=comp.officer_id) | Q(officer_id=comp.officer_id)).first()

                            if officer_obj:
                                officer_id = officer_obj.officer_id if hasattr(officer_obj, 'officer_id') else officer_obj.id
                                assigned_officer = {
                                    'id': officer_obj.id,
                                    'name': officer_obj.get_full_name() if hasattr(officer_obj, 'get_full_name') else str(officer_obj),
                                    'email': getattr(officer_obj, 'email', None),
                                    'phone': getattr(officer_obj, 'phone', None)
                                }
                            else:
                                officer_id = str(comp.officer_id)
                        except Exception:
                            officer_id = str(comp.officer_id)
                    
                    complaint_list.append({
                        'id': comp.id,
                        'comp_name': comp.title,
                        'filed_on': comp.current_time.strftime('%Y-%m-%d %H:%M:%S') if comp.current_time else None,
                        'description': comp.Description,
                        'upload_image': image_url,
                        'status': comp.status,
                        'priority': comp.priority_level,
                        'location_address': comp.location_address,
                        'location_district': comp.location_District,
                        'location_taluk': comp.location_taluk,
                        'officer_id': officer_id,
                        'assigned_officer': assigned_officer
                    })
                return Response(complaint_list)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
    
class DepartmentUserProfile(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            
            # Get user's department information
            department_info = None
            try:
                departments = Department.objects.filter(officers=user)
                if not departments.exists():
                    departments = Department.objects.filter(head_officer=user)
                if departments.exists():
                    dept = departments.first()
                    department_info = {
                        'name': dept.get_category_display(),  # full display name e.g. 'Water Supply'
                        'category': dept.category,
                        'description': dept.description,
                        'contact_email': dept.contact_email,
                        'contact_phone': dept.contact_phone
                    }
            except Exception as e:
                print(f"Error fetching department: {e}")
                department_info = None
            
            # Get complaint statistics for this user
            try:
                user_complaints = Complaint.objects.filter(officer_id=user)
                total_complaints = user_complaints.count()
                resolved_complaints = user_complaints.filter(status='Completed').count()
                pending_complaints = user_complaints.filter(status='Pending').count()
                in_progress_complaints = user_complaints.filter(status='In Process').count()
                
                # Calculate performance score
                performance_score = 0
                if total_complaints > 0:
                    resolution_rate = (resolved_complaints / total_complaints) * 100
                    performance_score = round(resolution_rate, 1)
            except Exception as e:
                print(f"Error fetching complaint stats: {e}")
                total_complaints = 0
                resolved_complaints = 0
                pending_complaints = 0
                in_progress_complaints = 0
                performance_score = 0
            
            # Get last login info
            last_login = None
            try:
                if user.last_login:
                    last_login = user.last_login.strftime('%Y-%m-%d %H:%M')
            except Exception as e:
                print(f"Error formatting last login: {e}")
            
            # Get joined date
            joined_date = None
            try:
                if hasattr(user, 'created_join') and user.created_join:
                    joined_date = user.created_join.strftime('%Y-%m-%d')
            except Exception as e:
                print(f"Error formatting joined date: {e}")
            
            return Response({
                'id': user.id,
                'username': user.username,
                'name': user.name or user.username,
                'email': user.email,
                'phone': getattr(user, 'mobile_number', '') or '',
                'role': getattr(user, 'User_Role', ''),
                'department': department_info,
                'address': getattr(user, 'address', '') or '',
                'district': getattr(user, 'district', '') or '',
                'taluka': getattr(user, 'taluka', '') or '',
                'ward_number': getattr(user, 'ward_number', '') or '',
                'joined_date': joined_date,
                'last_login': last_login,
                'is_active': user.is_active,
                'complaint_stats': {
                    'total': total_complaints,
                    'resolved': resolved_complaints,
                    'pending': pending_complaints,
                    'in_progress': in_progress_complaints,
                    'performance_score': performance_score
                }
            })
            
        except Exception as e:
            print(f"Error in DepartmentUserProfile: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': str(e),
                'message': 'Failed to fetch user profile'
            }, status=500)
    
    def put(self, request):
        try:
            user = request.user
            data = request.data
            
            # Update user profile fields
            if 'name' in data:
                user.name = data['name']
            if 'phone' in data:
                user.mobile_number = data['phone']
            if 'address' in data:
                user.address = data['address']
            if 'district' in data:
                user.district = data['district']
            if 'taluka' in data:
                user.taluka = data['taluka']
            if 'ward_number' in data:
                user.ward_number = data['ward_number']
            
            user.save()
            
            return Response({
                'success': True,
                'message': 'Profile updated successfully'
            })
            
        except Exception as e:
            print(f"Error updating profile: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': str(e),
                'message': 'Failed to update profile'
            }, status=500)


class UserEmailList(APIView):
    """Lightweight endpoint returning all user emails for officer creation dropdown."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.all().order_by('email').values(
            'id', 'email', 'first_name', 'last_name', 'User_Role'
        )
        data = [
            {
                'id': u['id'],
                'email': u['email'],
                'name': f"{u['first_name']} {u['last_name']}".strip() or u['email'],
                'role': u['User_Role'] or 'Civic-User',
            }
            for u in users
        ]
        return Response(data)


class UserDistrictWise(APIView):
    def get(self,request):
        districthwise={
            'Ahmedabad':0,'Amreli':0,'Anand':0,'Aravalli':0,'Banaskantha':0,'Bharuch':0,'Bhavnagar':0,'Botad':0,
            'Chhota Udaipur':0,'Dahod':0,'Dang':0,'Devbhoomi Dwarka':0,'Gandhinagar':0,'Gir Somnath':0,
            'Jamnagar':0,'Junagadh':0,'Kachchh':0,'Kheda':0,'Mahisagar':0,'Mehsana':0,'Morbi':0,'Narmada':0,
            'Navsari':0,'Palanpur':0,'Patan':0,'Porbandar':0,'Rajkot':0,'Sabarkantha':0,'Surat':0,'Surendranagar':0,
            'Tapi':0,'Vadodara':0,'Valsad':0,'Vav-Tharad':0
        }

        for dist in districthwise:
            districthwise[dist]=CustomUser.objects.filter(District=dist).count()
        return Response(districthwise)


class UserMonthlyRegistrations(APIView):
    def get(self, request):
        try:
            
            # Get current year
            current_year = datetime.now().year
            
            # Initialize monthly data for current year
            monthly_data = {}
            for month_num in range(1, 13):
                month_name = calendar.month_name[month_num]
                monthly_data[month_name] = 0
            
            # Count user registrations by month for current year
            users_by_month = (
                CustomUser.objects
                .filter(created_join__year=current_year)
                .annotate(month=ExtractMonth('created_join'))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            )
            
            # Fill in actual counts
            for item in users_by_month:
                month_name = calendar.month_name[item['month']]
                monthly_data[month_name] = item['count']
            
            return Response({
                'year': current_year,
                'monthly_data': monthly_data,
                'total_registrations': CustomUser.objects.filter(created_join__year=current_year).count()
            })
            
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch monthly user registration statistics'
            }, status=500)

class DepartmentUploadImage(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get the uploaded file
            image_file = request.FILES.get('image')
            image_type = request.data.get('image_type', 'profile')
            
            if not image_file:
                return Response({
                    'success': False,
                    'error': 'No image file provided'
                }, status=400)
            
            # Validate file type
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if image_file.content_type not in allowed_types:
                return Response({
                    'success': False,
                    'error': 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
                }, status=400)
            
            # Validate file size (5MB limit)
            if image_file.size > 5 * 1024 * 1024:
                return Response({
                    'success': False,
                    'error': 'File too large. Maximum size is 5MB.'
                }, status=400)
            
            # Generate unique filename
            import uuid
            import os
            from django.conf import settings
            
            file_extension = os.path.splitext(image_file.name)[1]
            unique_filename = f"{image_type}_{uuid.uuid4()}{file_extension}"
            
            # For now, return a mock URL (in production, you'd save to cloud storage or media folder)
            image_url = f"/uploads/{unique_filename}"
            
            return Response({
                'success': True,
                'message': 'Image uploaded successfully',
                'image_url': image_url,
                'image_type': image_type
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'Failed to upload image'
            }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_complaints(request):
    """Get complaints for current department user"""
    try:
        # Get current user
        user = request.user
        
        # Get the actual department the user belongs to (same logic as dashboard)
        department_name = None
        try:
            from departments.models import Department
            
            print(f"DEBUG COMPLAINTS: Checking department for user {user.username}")
            print(f"DEBUG COMPLAINTS: User_Role = {getattr(user, 'User_Role', 'NOT_FOUND')}")
            
            # Check if user is a department head
            if hasattr(user, 'headed_department') and user.headed_department.exists():
                department = user.headed_department.first()
                department_name = department.name
                print(f"DEBUG COMPLAINTS: User is department head, department = {department_name}")
            # Check if user is a department officer
            elif hasattr(user, 'departments') and user.departments.exists():
                department = user.departments.first()
                department_name = department.name
                print(f"DEBUG COMPLAINTS: User is department officer, department = {department_name}")
            # Fallback: try to get department from User_Role for backward compatibility
            elif hasattr(user, 'User_Role') and user.User_Role:
                user_role_str = str(user.User_Role)
                print(f"DEBUG COMPLAINTS: Using User_Role fallback: {user_role_str}")
                if '-User' in user_role_str:
                    # Try to find department by category code
                    dept_code = user_role_str.replace('-User', '')
                    print(f"DEBUG COMPLAINTS: Looking for department with code: {dept_code}")
                    department = Department.objects.filter(category=dept_code).first()
                    if department:
                        department_name = department.name
                        print(f"DEBUG COMPLAINTS: Found department by code: {department_name}")
                    else:
                        department_name = dept_code
                        print(f"DEBUG COMPLAINTS: Using dept_code as department_name: {department_name}")
                else:
                    department_name = user_role_str
                    print(f"DEBUG COMPLAINTS: Using user_role_str as department_name: {department_name}")
            
        except Exception as e:
            print(f"DEBUG COMPLAINTS: Error determining department for user {user.username}: {e}")
            department_name = None
        
        print(f"DEBUG COMPLAINTS: Final department_name = {department_name}")
        
        if not department_name:
            return Response({
                'error': 'Unable to determine department for this user',
                'message': 'Department information not found'
            }, status=400)
        
        # Get complaints based on user role
        if user.User_Role == 'Department-User':
            # For department users, get complaints assigned to their department
            print(f"DEBUG COMPLAINTS: Filtering complaints for department: {department_name}")
            complaints = Complaint.objects.filter(
                Category__department=department_name
            ).values(
                'id', 'title', 'Category__name', 'Description', 
                'Category', 'location_District', 'location_address',
                'priority_level', 'status', 'current_time',
                'assigned_to', 'assigned_to__username'
            ).order_by('-current_time')
            print(f"DEBUG COMPLAINTS: Found {complaints.count()} complaints for department {department_name}")
        elif user.User_Role == 'Admin-User':
            # For admin users, get all complaints
            print(f"DEBUG COMPLAINTS: Admin user - getting all complaints")
            complaints = Complaint.objects.all().values(
                'id', 'title', 'Category__name', 'Description', 
                'Category', 'location_District', 'location_address',
                'priority_level', 'status', 'current_time',
                'assigned_to', 'assigned_to__username'
            ).order_by('-current_time')
            print(f"DEBUG COMPLAINTS: Found {complaints.count()} total complaints for admin")
        else:
            # For other users, return empty or unauthorized
            print(f"DEBUG COMPLAINTS: Unauthorized access for user role: {user.User_Role}")
            return Response({
                'error': 'Unauthorized access',
                'message': 'You do not have permission to view complaints'
            }, status=403)
        
        # Transform data to match frontend expectations
        transformed_complaints = []
        for complaint in complaints:
            transformed_complaints.append({
                'id': complaint['id'],
                'title': complaint['title'],
                'category': complaint['Category__name'] or complaint['Category'],
                'description': complaint['Description'],
                'location': complaint['location_address'] or complaint['location_District'],
                'priority': complaint['priority_level'],
                'status': complaint['status'],
                'submittedDate': complaint['current_time'],
                'assignedOfficer': complaint['assigned_to__username'] if complaint['assigned_to'] else 'Unassigned'
            })
        
        return Response(transformed_complaints)
        
    except Exception as e:
        return Response({
            'error': str(e),
            'message': 'Failed to fetch complaints'
        }, status=500)