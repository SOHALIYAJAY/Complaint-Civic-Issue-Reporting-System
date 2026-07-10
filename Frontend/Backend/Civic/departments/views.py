from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
import calendar as cal

from complaints.models import Complaint
from complaints.serializers import ComplaintSerializer
from accounts.models import CustomUser
from departments.models import Department, Officer
from departments.serializers import deptSerializer, OfficerSerializer
from rest_framework import status


# ─── Shared helper ────────────────────────────────────────────────────────────

def _get_user_department(user):
    """
    Return the Department the logged-in user belongs to, or None.
    Priority: headed_department → departments (M2M member).
    """
    if hasattr(user, 'headed_department') and user.headed_department.exists():
        return user.headed_department.first()
    if hasattr(user, 'departments') and user.departments.exists():
        return user.departments.first()
    return None


def _dept_complaint_qs(dept):
    """
    Return complaints scoped to a department.
    Matches on Category.name (full display name e.g. 'Water Supply')
    OR Category.code (dept category code e.g. 'WATER') OR Category.department.
    """
    dept_label = dept.get_category_display()   # e.g. 'Water Supply'
    dept_code  = dept.category                 # e.g. 'WATER'
    return Complaint.objects.filter(
        Q(Category__name=dept_label) |
        Q(Category__code=dept_code) |
        Q(Category__department=dept_code)
    )


# ─── Public department list (no auth — used by raise-complaint form) ─────────

@api_view(['GET'])
def department_list_public(request):
    """
    Returns all departments as a simple list for the raise-complaint dropdown.
    No authentication required.
    """
    try:
        depts = Department.objects.all().order_by('name')
        data = [
            {
                'id': d.id,
                'name': d.get_category_display(),
                'code': d.category,
                'email': d.contact_email,
                'phone': d.contact_phone,
            }
            for d in depts
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ─── Department statistics (public / admin) ───────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_statistics(request):
    try:
        from Categories.models import Category as ComplaintCategory
        from django.db.models.functions import ExtractYear

        year_param = request.query_params.get('year')
        year = int(year_param) if year_param and year_param.isdigit() else None

        departments_data = []
        for dept in Department.objects.all():
            base_qs = _dept_complaint_qs(dept)
            if year:
                base_qs = base_qs.filter(current_time__year=year)

            complaint_count  = base_qs.count()
            pending_count    = base_qs.filter(status='Pending').count()
            inprogress_count = base_qs.filter(status='In Process').count()
            resolved_count   = base_qs.filter(status='Completed').count()
            officer_count    = base_qs.exclude(officer_id=None).values('officer_id').distinct().count()
            resolution_rate  = round(resolved_count / complaint_count * 100, 1) if complaint_count else 0

            departments_data.append({
                'name': dept.name,
                'category': dept.category,
                'complaint_count': complaint_count,
                'pending_count': pending_count,
                'inprogress_count': inprogress_count,
                'resolved_count': resolved_count,
                'officer_count': officer_count,
                'resolution_rate': resolution_rate,
            })

        category_distribution = []
        for cat in ComplaintCategory.objects.all():
            qs = Complaint.objects.filter(Category=cat)
            if year:
                qs = qs.filter(current_time__year=year)
            count = qs.count()
            if count > 0:
                category_distribution.append({'name': cat.name, 'value': count})

        monthly_trend = []
        for i in range(5, -1, -1):
            total_months = timezone.now().year * 12 + timezone.now().month - 1 - i
            y = total_months // 12
            m = (total_months % 12) + 1
            monthly_trend.append({
                'month': f"{cal.month_abbr[m]} {y}",
                'complaints': Complaint.objects.filter(current_time__year=y, current_time__month=m).count(),
                'resolved':   Complaint.objects.filter(current_time__year=y, current_time__month=m, status='Completed').count(),
                'pending':    Complaint.objects.filter(current_time__year=y, current_time__month=m, status='Pending').count(),
            })

        years_qs = Complaint.objects.annotate(yr=ExtractYear('current_time')).values_list('yr', flat=True).distinct().order_by('yr')
        yearly_trend = []
        for y in years_qs:
            if y:
                yearly_trend.append({
                    'year': str(y),
                    'complaints': Complaint.objects.filter(current_time__year=y).count(),
                    'resolved':   Complaint.objects.filter(current_time__year=y, status='Completed').count(),
                    'pending':    Complaint.objects.filter(current_time__year=y, status='Pending').count(),
                    'inprogress': Complaint.objects.filter(current_time__year=y, status='In Process').count(),
                })

        return Response({
            'department_statistics': departments_data,
            'category_distribution': category_distribution,
            'monthly_trend': monthly_trend,
            'yearly_trend': yearly_trend,
        })
    except Exception as e:
        import traceback; traceback.print_exc()
        return Response({'error': str(e)}, status=500)


# ─── Officer list (admin) ─────────────────────────────────────────────────────

class OfficerDetail(ListAPIView):
    queryset = Officer.objects.all()
    serializer_class = OfficerSerializer

    def list(self, request, *args, **kwargs):
        officers = Officer.objects.select_related('department').all()
        result = []
        for o in officers:
            dept_name = o.department.name if o.department else ''
            result.append({
                'officer_id': o.officer_id,
                'name': o.name,
                'email': o.email,
                'phone': o.phone,
                'is_available': o.is_available,
                'department': dept_name,
            })
        return Response(result)


# ─── Department profile ───────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_profile(request):
    try:
        dept = _get_user_department(request.user)
        if not dept:
            return Response({'error': 'No department found for this user'}, status=status.HTTP_404_NOT_FOUND)

        qs = _dept_complaint_qs(dept)
        total     = qs.count()
        active    = qs.filter(status__in=['Pending', 'In Process']).count()
        resolved  = qs.filter(status='Completed').count()

        avg_resolution_time = 0
        resolved_qs = qs.filter(status='Completed', resolved_time__isnull=False)
        if resolved_qs.exists():
            total_days = sum(
                (c.resolved_time - c.current_time).days
                for c in resolved_qs
                if c.current_time and c.resolved_time and c.resolved_time >= c.current_time
            )
            avg_resolution_time = total_days / resolved_qs.count()

        satisfaction_rate = 85.0
        performance_score = min(100, (resolved / max(1, total) * 50) + (satisfaction_rate * 0.5))

        return Response({
            'id': dept.id,
            'code': dept.category,
            'name': dept.get_category_display(),
            'description': dept.description,
            'head': dept.head_officer.get_full_name() if dept.head_officer else 'Not Assigned',
            'email': dept.contact_email,
            'phone': dept.contact_phone,
            'totalOfficers': dept.officers.count(),
            'activeComplaints': active,
            'resolvedComplaints': resolved,
            'avgResolutionTime': round(avg_resolution_time, 1),
            'satisfactionRate': round(satisfaction_rate, 1),
            'performanceScore': round(performance_score, 1),
            'category': dept.get_category_display(),
            'status': 'Active',
        })
    except Exception as e:
        print(f"Error in department_profile: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── Officers in department ───────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_officers(request):
    try:
        dept = _get_user_department(request.user)

        # Fallback: return all available officers when no department is linked
        if not dept:
            officers_qs = Officer.objects.filter(is_available=True) or Officer.objects.all()
            data = []
            for o in officers_qs:
                handled  = Complaint.objects.filter(officer_id=o.officer_id).count()
                resolved = Complaint.objects.filter(officer_id=o.officer_id, status='Completed').count()
                data.append({
                    'id': o.officer_id,
                    'name': o.name,
                    'email': o.email,
                    'phone': getattr(o, 'phone', 'Not Available'),
                    'role': 'Officer',
                    'department': None,
                    'status': 'Active' if o.is_available else 'Inactive',
                    'joinedDate': None,
                    'totalComplaintsHandled': handled,
                    'avgResolutionTime': 0,
                    'satisfactionRate': 85.0,
                    'performanceScore': round(min(100, (resolved / max(1, handled) * 50) + 42.5)),
                })
            return Response(data)

        # Officers that belong to this department (M2M via CustomUser)
        dept_user_officers = dept.officers.all()
        # Also include Officer records linked via the new FK
        dept_officer_records = Officer.objects.filter(department=dept)

        data = []
        seen_emails = set()

        def _append_officer_stats(name, email, phone, role_label, dept_label, joined, is_active, officer_id=None):
            if email in seen_emails:
                return
            seen_emails.add(email)
            qs = Complaint.objects.filter(officer_id=officer_id) if officer_id else Complaint.objects.none()
            handled  = qs.count()
            resolved = qs.filter(status='Completed').count()
            resolved_qs = qs.filter(status='Completed', resolved_time__isnull=False)
            avg_days = 0
            if resolved_qs.exists():
                days = [
                    (c.resolved_time - c.current_time).days
                    for c in resolved_qs
                    if c.current_time and c.resolved_time and c.resolved_time >= c.current_time
                ]
                avg_days = sum(days) / len(days) if days else 0
            satisfaction = 85.0
            perf = min(100, (resolved / max(1, handled) * 50) + (satisfaction * 0.5))
            data.append({
                'id': officer_id or email,
                'name': name,
                'email': email,
                'phone': phone or 'Not Available',
                'role': role_label,
                'department': dept_label,
                'status': 'Active' if is_active else 'Inactive',
                'joinedDate': joined,
                'totalComplaintsHandled': handled,
                'avgResolutionTime': round(avg_days, 1),
                'satisfactionRate': round(satisfaction, 1),
                'performanceScore': round(perf, 1),
            })

        for o in dept_officer_records:
            _append_officer_stats(
                o.name, o.email, o.phone, 'Officer',
                dept.get_category_display(), None, o.is_available, o.officer_id
            )

        for user in dept_user_officers:
            officer_rec = Officer.objects.filter(email=user.email).first()
            _append_officer_stats(
                user.get_full_name() or user.email,
                user.email,
                getattr(user, 'mobile_number', None),
                'Officer',
                dept.get_category_display(),
                user.date_joined.strftime('%Y-%m-%d') if user.date_joined else None,
                user.is_active,
                officer_rec.officer_id if officer_rec else None,
            )

        return Response(data)
    except Exception as e:
        print(f"Error in department_officers: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── Complaints for department ────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_complaints(request):
    try:
        dept = _get_user_department(request.user)
        qs = _dept_complaint_qs(dept).order_by('-current_time') if dept else Complaint.objects.all().order_by('-current_time')

        data = []
        for c in qs:
            data.append({
                'id': c.id,
                'title': c.title or 'Untitled',
                'description': (c.Description or '')[:200] + ('...' if len(c.Description or '') > 200 else ''),
                'category': c.Category.name if c.Category else 'Uncategorized',
                'priority': c.priority_level,
                'status': c.status,
                'submittedDate': c.current_time.strftime('%Y-%m-%d') if c.current_time else 'Unknown',
                'assignedOfficer': c.officer_id.name if c.officer_id else 'Unassigned',
                'citizenName': c.user.get_full_name() if c.user else 'Unknown',
                'citizenEmail': c.user.email if c.user else 'Unknown',
                'citizenPhone': getattr(c.user, 'mobile_number', 'Not Available'),
                'location': c.location_address or 'Not specified',
            })
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── Performance metrics ──────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_performance(request):
    try:
        dept = _get_user_department(request.user)
        if not dept:
            return Response({'error': 'No department found for this user'}, status=status.HTTP_404_NOT_FOUND)

        dept_users = dept.officers.all()
        qs = _dept_complaint_qs(dept)

        # Monthly stats (last 6 months)
        monthly_stats = []
        for i in range(5, -1, -1):
            month_start = timezone.now() - timedelta(days=30 * (i + 1))
            month_end   = timezone.now() - timedelta(days=30 * i)
            month_qs    = qs.filter(current_time__gte=month_start, current_time__lt=month_end)
            monthly_stats.append({
                'month': month_start.strftime('%b'),
                'complaints': month_qs.count(),
                'resolved': month_qs.filter(status='Completed').count(),
                'pending': month_qs.filter(status='Pending').count(),
            })

        # Category distribution
        cat_stats = qs.values('Category__name').annotate(count=Count('id')).order_by('-count')
        colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
        category_distribution = [
            {'category': s['Category__name'] or 'Uncategorized', 'count': s['count'], 'color': colors[i % len(colors)]}
            for i, s in enumerate(cat_stats)
        ]

        # Priority distribution
        priority_colors = {'High': '#EF4444', 'Medium': '#F59E0B', 'Low': '#10B981'}
        priority_distribution = [
            {'priority': s['priority_level'], 'count': s['count'], 'color': priority_colors.get(s['priority_level'], '#6B7280')}
            for s in qs.values('priority_level').annotate(count=Count('id')).order_by('-count')
        ]

        # Officer performance
        officer_performance = []
        for user in dept_users:
            officer_rec = Officer.objects.filter(email=user.email).first()
            o_qs = Complaint.objects.filter(officer_id=officer_rec) if officer_rec else Complaint.objects.none()
            handled  = o_qs.count()
            resolved = o_qs.filter(status='Completed').count()
            resolved_timed = o_qs.filter(status='Completed', resolved_time__isnull=False)
            avg_time = 0
            if resolved_timed.exists():
                days = [
                    (c.resolved_time - c.current_time).days
                    for c in resolved_timed
                    if c.current_time and c.resolved_time and c.resolved_time >= c.current_time
                ]
                avg_time = sum(days) / len(days) if days else 0
            officer_performance.append({
                'officer': user.get_full_name() or user.email,
                'handled': handled,
                'resolved': resolved,
                'avgTime': round(avg_time, 1),
                'satisfaction': 85.0,
            })

        return Response({
            'monthlyStats': monthly_stats,
            'categoryDistribution': category_distribution,
            'priorityDistribution': priority_distribution,
            'officerPerformance': officer_performance,
        })
    except Exception as e:
        print(f"Error in department_performance: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── Update department profile ────────────────────────────────────────────────

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_department_profile(request):
    try:
        user = request.user
        dept = None
        if hasattr(user, 'headed_department') and user.headed_department.exists():
            dept = user.headed_department.first()
        if not dept:
            return Response({'error': 'Only department heads can update profile'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        if 'description' in data:
            dept.description = data['description']
        if 'contact_email' in data:
            dept.contact_email = data['contact_email']
        if 'contact_phone' in data:
            dept.contact_phone = data['contact_phone']
        dept.save()
        return Response({'message': 'Profile updated successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── Department dashboard ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_dashboard(request):
    try:
        user = request.user
        dept = _get_user_department(user)

        if dept:
            qs           = _dept_complaint_qs(dept)
            dept_name    = dept.get_category_display()
            dept_code    = dept.category
            dept_email   = dept.contact_email
            dept_phone   = dept.contact_phone
            head_name    = dept.head_officer.get_full_name() if dept.head_officer else 'Not Assigned'
            dept_officers_count = dept.officers.count()
        else:
            qs           = Complaint.objects.all()
            dept_name    = 'All Departments'
            dept_code    = ''
            dept_email   = ''
            dept_phone   = ''
            head_name    = 'N/A'
            dept_officers_count = Officer.objects.count()

        total      = qs.count()
        pending    = qs.filter(status='Pending').count()
        inprogress = qs.filter(status='In Process').count()
        resolved   = qs.filter(status='Completed').count()

        all_officers    = Officer.objects.filter(department=dept) if dept else Officer.objects.all()
        active_officers = all_officers.filter(is_available=True).count()
        inactive_officers = all_officers.filter(is_available=False).count()

        sla_compliance   = round(resolved / total * 100, 1) if total else 0
        officer_workload = round(total / max(active_officers, 1), 1)

        current_year = timezone.now().year
        monthly_counts = {
            str(m): qs.filter(current_time__year=current_year, current_time__month=m).count()
            for m in range(1, 13)
        }

        recent_data = []
        for comp in qs.order_by('-current_time')[:6]:
            recent_data.append({
                'id': comp.id,
                'title': comp.title or 'Untitled',
                'description': (comp.Description or '')[:100],
                'status': comp.status,
                'priority': comp.priority_level,
                'current_time': comp.current_time.strftime('%Y-%m-%d') if comp.current_time else '',
                'location_address': comp.location_address or '',
                'Category': comp.Category.name if comp.Category else '',
            })

        recent_activity = []
        for comp in qs.order_by('-current_time')[:5]:
            recent_activity.append({
                'id': f'comp_{comp.id}', 'type': 'complaint',
                'description': f'Complaint #{comp.id}: {comp.title or "Untitled"}',
                'time': comp.current_time.strftime('%Y-%m-%d %H:%M') if comp.current_time else '',
                'officer': comp.officer_id.name if comp.officer_id else 'Unassigned',
            })
        for comp in qs.filter(status='Completed').order_by('-current_time')[:3]:
            recent_activity.append({
                'id': f'res_{comp.id}', 'type': 'resolution',
                'description': f'Complaint #{comp.id} resolved',
                'time': comp.current_time.strftime('%Y-%m-%d %H:%M') if comp.current_time else '',
                'officer': comp.officer_id.name if comp.officer_id else 'Unknown',
            })
        recent_activity = sorted(recent_activity, key=lambda x: x['time'], reverse=True)[:8]

        return Response({
            'department': {
                'name': dept_name,
                'code': dept_code,
                'category': dept_name,   # full display name e.g. 'Water Supply'
                'email': dept_email,
                'phone': dept_phone,
                'head': head_name,
                'officer_count': dept_officers_count,
            },
            'stats': {'total': total, 'pending': pending, 'inProgress': inprogress, 'resolved': resolved},
            'performance': {
                'avgResolutionTime': 0,
                'slaCompliance': sla_compliance,
                'officerWorkload': officer_workload,
                'citizenSatisfaction': 4.2,
            },
            'officers': {'total': all_officers.count(), 'active': active_officers, 'inactive': inactive_officers},
            'monthlyCounts': monthly_counts,
            'recentComplaints': recent_data,
            'recentActivity': recent_activity,
        })
    except Exception as e:
        import traceback; traceback.print_exc()
        return Response({'error': str(e)}, status=500)


# ─── Departments overview ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def departments_overview(request):
    try:
        dept = _get_user_department(request.user)
        if not dept:
            return Response({'error': 'Unable to determine department for this user'}, status=400)

        qs       = _dept_complaint_qs(dept)
        total    = qs.count()
        pending  = qs.filter(status='Pending').count()
        inprog   = qs.filter(status='In Process').count()
        resolved = qs.filter(status='Completed').count()

        officers_count        = dept.officers.count()
        active_officers_count = dept.officers.filter(is_active=True).count()

        departments_data = [{
            'id': dept.id,
            'name': dept.get_category_display(),
            'code': dept.category,
            'description': dept.description,
            'contact_email': dept.contact_email,
            'contact_phone': dept.contact_phone,
            'head_officer': {
                'id': dept.head_officer.id if dept.head_officer else None,
                'name': dept.head_officer.get_full_name() if dept.head_officer else None,
                'email': dept.head_officer.email if dept.head_officer else None,
            },
            'officers': {
                'total': officers_count,
                'active': active_officers_count,
                'inactive': officers_count - active_officers_count,
            },
            'statistics': {
                'total_complaints': total,
                'pending_complaints': pending,
                'in_progress_complaints': inprog,
                'resolved_complaints': resolved,
                'resolution_rate': round(resolved / max(total, 1) * 100, 1),
                'avg_resolution_time': 2.5,
                'sla_compliance': 85.0,
            },
            'created_at': dept.created_at.strftime('%Y-%m-%d') if dept.created_at else None,
        }]

        return Response({
            'departments': departments_data,
            'overview': {
                'total_departments': 1,
                'total_complaints': total,
                'total_resolved': resolved,
                'overall_resolution_rate': round(resolved / max(total, 1) * 100, 1),
                'total_officers': officers_count,
            },
            'user_department': dept.get_category_display(),
        })
    except Exception as e:
        print(f"Error in departments_overview: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
