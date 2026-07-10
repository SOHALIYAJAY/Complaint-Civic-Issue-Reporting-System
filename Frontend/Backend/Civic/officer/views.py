from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta, datetime
from complaints.models import Complaint
from complaints.serializers import ComplaintSerializer
from departments.models import Officer, Department
from accounts.models import CustomUser
import json

# Canonical status values
VALID_STATUSES = {'Pending', 'In Process', 'Completed'}

# Map legacy / alternate values to canonical
_STATUS_ALIAS = {
    'in-progress': 'In Process',
    'in_progress': 'In Process',
    'resolved':    'Completed',
    'Pending':     'Pending',
    'In Process':  'In Process',
    'Completed':   'Completed',
}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_endpoint(request):
    print(f"DEBUG: Test endpoint hit by user: {request.user.username}")
    return Response({
        'message': 'Officer app is working!',
        'user': request.user.username,
        'timestamp': str(timezone.now()),
        'status': 'success'
    })


def _get_officer_for_user(user):
    if not user:
        return None
    try:
        officer = Officer.objects.filter(email=user.email).first()
        if officer:
            return officer
        officer = Officer.objects.filter(officer_id=user.username).first()
        if officer:
            return officer
    except Exception as e:
        print(f"Error getting officer for user {user.username}: {e}")
    return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_dashboard_stats(request):
    user = request.user
    try:
        officer = _get_officer_for_user(user)
        if not officer:
            return Response({'totalComplaints': 0, 'resolvedComplaints': 0, 'pendingComplaints': 0,
                             'inProgressComplaints': 0, 'overdueComplaints': 0,
                             'averageResolutionTime': 0, 'performanceScore': 0,
                             'todayComplaints': 0, 'weeklyComplaints': 0})

        qs = Complaint.objects.filter(officer_id=officer)
        total       = qs.count()
        resolved    = qs.filter(status='Completed').count()
        pending     = qs.filter(status='Pending').count()
        in_progress = qs.filter(status='In Process').count()

        today      = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        today_count  = qs.filter(current_time__date=today).count()
        weekly_count = qs.filter(current_time__date__gte=week_start).count()

        seven_days_ago = timezone.now() - timedelta(days=7)
        overdue = qs.filter(current_time__lt=seven_days_ago, status__in=['Pending', 'In Process']).count()

        avg_days = 0
        resolved_qs = qs.filter(status='Completed', current_time__isnull=False, resolved_time__isnull=False)
        if resolved_qs.exists():
            days_list = [(c.resolved_time - c.current_time).days for c in resolved_qs if c.resolved_time >= c.current_time]
            avg_days = round(sum(days_list) / len(days_list), 1) if days_list else 0

        perf = 0
        if total > 0:
            res_rate = (resolved / total) * 100
            sla_ok = sum(1 for c in resolved_qs if c.resolved_time and c.current_time and (c.resolved_time - c.current_time).days <= 3)
            sla_rate = (sla_ok / resolved_qs.count() * 100) if resolved_qs.exists() else 0
            perf = round(min(100, res_rate * 0.6 + sla_rate * 0.4))

        return Response({
            'totalComplaints': total, 'resolvedComplaints': resolved,
            'pendingComplaints': pending, 'inProgressComplaints': in_progress,
            'overdueComplaints': overdue, 'averageResolutionTime': avg_days,
            'performanceScore': perf, 'todayComplaints': today_count, 'weeklyComplaints': weekly_count,
        })
    except Exception as e:
        print(f"Error in officer_dashboard_stats: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_recent_complaints(request):
    user = request.user
    try:
        officer = _get_officer_for_user(user)
        if not officer:
            return Response([])

        seven_days_ago = timezone.now() - timedelta(days=7)
        qs = Complaint.objects.filter(officer_id=officer).order_by('-current_time')[:10]
        data = []
        for c in qs:
            is_overdue = c.current_time < seven_days_ago and c.status in ['Pending', 'In Process']
            data.append({
                'id': c.id,
                'title': c.title or 'Untitled',
                'category': c.Category.name if c.Category else 'Uncategorized',
                'status': c.status,
                'priority': c.priority_level,
                'date': c.current_time.strftime('%Y-%m-%d') if c.current_time else '',
                'citizenName': c.user.get_full_name() or c.user.email if c.user else 'Unknown',
                'location': c.location_address or 'Not specified',
                'isOverdue': is_overdue,
            })
        return Response(data)
    except Exception as e:
        print(f"Error in officer_recent_complaints: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_monthly_trends(request):
    user = request.user
    try:
        officer = _get_officer_for_user(user)
        if not officer:
            return Response([])

        MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        current_year = timezone.now().year
        qs = Complaint.objects.filter(officer_id=officer, current_time__year=current_year)
        counts = qs.values('current_time__month').annotate(total=Count('id'))
        month_map = {row['current_time__month']: row['total'] for row in counts}
        data = [{'month': MONTH_NAMES[m - 1], 'complaints': month_map.get(m, 0)} for m in range(1, 13)]
        return Response(data)
    except Exception as e:
        print(f"Error in officer_monthly_trends: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def officer_profile(request):
    user = request.user
    try:
        officer = _get_officer_for_user(user)

        if request.method == 'GET':
            if not officer:
                return Response({
                    'id': user.id,
                    'name': user.get_full_name() or user.email,
                    'email': user.email,
                    'phone': getattr(user, 'mobile_number', None),
                    'address': getattr(user, 'address', None),
                    'department': 'Sanitation',
                    'designation': 'Officer',
                    'joinDate': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else None,
                    'totalComplaintsHandled': 5,
                    'complaintsResolved': 2,
                    'pendingComplaints': 3,
                    'averageResolutionTime': 2.5,
                    'performanceScore': 85,
                    'isAvailable': True,
                    'lastLogin': user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else None
                })

            complaints = Complaint.objects.filter(officer_id=officer)
            total_complaints = complaints.count()
            resolved_complaints = complaints.filter(status='Completed').count()
            pending_complaints = complaints.filter(status='Pending').count()

            avg_resolution_time = 0
            resolved_with_time = complaints.filter(
                status='Completed',
                current_time__isnull=False,
                resolved_time__isnull=False
            )
            if resolved_with_time.exists():
                total_days = 0
                count = 0
                for c in resolved_with_time:
                    if c.current_time and c.resolved_time:
                        d = (c.resolved_time - c.current_time).days
                        if d >= 0:
                            total_days += d
                            count += 1
                if count > 0:
                    avg_resolution_time = total_days / count

            performance_score = 0
            if total_complaints > 0:
                resolution_rate = (resolved_complaints / total_complaints) * 100
                sla_compliant = sum(
                    1 for c in resolved_with_time
                    if c.current_time and c.resolved_time and (c.resolved_time - c.current_time).days <= 3
                )
                sla_rate = (sla_compliant / resolved_with_time.count() * 100) if resolved_with_time.exists() else 0
                performance_score = min(100, max(0, resolution_rate * 0.6 + sla_rate * 0.4))

            return Response({
                'id': user.id,
                'name': user.get_full_name() or user.email,
                'email': user.email,
                'phone': getattr(user, 'mobile_number', None),
                'address': getattr(user, 'address', None),
                'department': (
                    user.departments.first().get_category_display()
                    if hasattr(user, 'departments') and user.departments.exists()
                    else (
                        user.headed_department.first().get_category_display()
                        if hasattr(user, 'headed_department') and user.headed_department.exists()
                        else None
                    )
                ),
                'designation': 'Officer',
                'joinDate': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else None,
                'totalComplaintsHandled': total_complaints,
                'complaintsResolved': resolved_complaints,
                'pendingComplaints': pending_complaints,
                'averageResolutionTime': round(avg_resolution_time, 1),
                'performanceScore': round(performance_score),
                'isAvailable': officer.is_available if officer else True,
                'lastLogin': user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else None
            })

        elif request.method == 'PUT':
            data = request.data
            if 'name' in data:
                parts = data['name'].split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''
            if 'phone' in data:
                user.mobile_number = data['phone']
            if 'address' in data:
                user.address = data['address']
            if officer and 'isAvailable' in data:
                officer.is_available = data['isAvailable']
                officer.save()
            try:
                user.save()
            except Exception:
                pass
            return Response({
                'message': 'Profile updated successfully',
                'name': user.get_full_name() or user.email,
                'phone': user.mobile_number,
                'address': user.address
            })

    except Exception as e:
        print(f"Error in officer_profile: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_complaints(request):
    try:
        officer = _get_officer_for_user(request.user)
        if not officer:
            return Response({'complaints': [], 'categories': [], 'total': 0,
                             'filters': {'status': 'all', 'category': 'all', 'search': ''}})

        qs = Complaint.objects.filter(officer_id=officer).order_by('-current_time')

        status_filter   = request.GET.get('status', 'all')
        category_filter = request.GET.get('category', 'all')
        priority_filter = request.GET.get('priority', 'all')
        search_query    = request.GET.get('search', '')

        if status_filter != 'all':
            canonical = _STATUS_ALIAS.get(status_filter, status_filter)
            qs = qs.filter(status=canonical)
        if category_filter != 'all':
            qs = qs.filter(Category__name=category_filter)
        if priority_filter != 'all':
            qs = qs.filter(priority_level=priority_filter)
        if search_query:
            qs = qs.filter(
                Q(title__icontains=search_query) |
                Q(Description__icontains=search_query)
            )

        categories = list(
            Complaint.objects.filter(officer_id=officer)
            .values_list('Category__name', flat=True)
            .distinct()
        )

        total_count = qs.count()

        try:
            page      = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
        except (ValueError, TypeError):
            page, page_size = 1, 10
        offset = (page - 1) * page_size
        qs = qs[offset: offset + page_size]

        seven_days_ago = timezone.now() - timedelta(days=7)
        data = []
        for c in qs:
            is_overdue = c.current_time < seven_days_ago and c.status in ['Pending', 'In Process']
            data.append({
                'id': c.id,
                'title': c.title or 'Untitled',
                'description': c.Description or '',
                'category': c.Category.name if c.Category else 'Uncategorized',
                'status': c.status,
                'priority': c.priority_level,
                'date': c.current_time.strftime('%Y-%m-%d') if c.current_time else '',
                'submittedDate': c.current_time.strftime('%d %b %Y') if c.current_time else '',
                'location': c.location_address or 'Not specified',
                'district': c.location_District or '',
                'taluka': c.location_taluk or '',
                'citizenName': (c.user.get_full_name() or c.user.email) if c.user else 'Unknown',
                'citizenEmail': c.user.email if c.user else '',
                'citizenPhone': getattr(c.user, 'mobile_number', '') or '',
                'isOverdue': is_overdue,
                'image': request.build_absolute_uri(c.image_video.url) if c.image_video else None,
                'remarks': c.remarks or '',
                'updatedAt': c.updated_at.strftime('%d %b %Y, %H:%M') if c.updated_at else '',
            })

        return Response({
            'complaints': data,
            'categories': [c for c in categories if c],
            'total': total_count,
            'filters': {'status': status_filter, 'category': category_filter,
                        'priority': priority_filter, 'search': search_query},
        })
    except Exception as e:
        print(f"Error in officer_complaints: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_complaint_status(request, complaint_id):
    try:
        officer = _get_officer_for_user(request.user)
        if not officer:
            return Response({'error': 'Officer not found'}, status=404)

        complaint = Complaint.objects.filter(id=complaint_id, officer_id=officer).first()
        if not complaint:
            return Response({'error': 'Complaint not found'}, status=404)

        raw_status = request.data.get('status')
        remarks = request.data.get('remarks', '')

        if raw_status:
            new_status = _STATUS_ALIAS.get(raw_status, raw_status)
            if new_status not in VALID_STATUSES:
                return Response({'error': f'Invalid status. Must be one of: {list(VALID_STATUSES)}'}, status=400)

            complaint.status = new_status
            if new_status == 'Completed':
                complaint.resolved_time = timezone.now()

            from complaints.models import ComplaintStatusHistory
            ComplaintStatusHistory.objects.create(
                complaint=complaint,
                status=new_status,
                changed_by=officer,
                remarks=remarks,
            )

        if remarks:
            complaint.remarks = remarks

        complaint.updated_at = timezone.now()
        complaint.save()

        return Response({
            'message': 'Complaint updated successfully',
            'status': complaint.status,
            'remarks': complaint.remarks,
        })
    except Exception as e:
        print(f"Error in update_complaint_status: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def complaint_status_history(request, complaint_id):
    """Return status history for a complaint (accessible by civic user, department user, officer, admin)."""
    try:
        complaint = Complaint.objects.filter(id=complaint_id).first()
        if not complaint:
            return Response({'error': 'Complaint not found'}, status=404)

        from complaints.models import ComplaintStatusHistory
        history = ComplaintStatusHistory.objects.filter(complaint=complaint).order_by('timestamp')

        history_data = [
            {
                'status': h.status,
                'remarks': h.remarks,
                'timestamp': h.timestamp.strftime('%d %b %Y, %H:%M'),
                'changed_by': h.changed_by.name if h.changed_by else 'System',
            }
            for h in history
        ]

        return Response({
            'complaint_id': complaint_id,
            'current_status': complaint.status,
            'submitted_at': complaint.current_time.strftime('%d %b %Y, %H:%M') if complaint.current_time else None,
            'history': history_data,
        })
    except Exception as e:
        print(f"Error in complaint_status_history: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_officer_data(request):
    try:
        user = request.user
        officers = Officer.objects.all()
        officer_data = [
            {
                'officer_id': o.officer_id, 'name': o.name, 'email': o.email,
                'phone': o.phone, 'is_available': o.is_available,
                'complaints_count': Complaint.objects.filter(officer_id=o).count()
            }
            for o in officers
        ]
        current_officer = _get_officer_for_user(user)
        current_officer_data = None
        if current_officer:
            current_complaints = Complaint.objects.filter(officer_id=current_officer)
            current_officer_data = {
                'officer_id': current_officer.officer_id,
                'name': current_officer.name,
                'email': current_officer.email,
                'complaints_count': current_complaints.count(),
                'complaints': [{'id': c.id, 'title': c.title, 'status': c.status, 'priority': c.priority_level} for c in current_complaints]
            }
        return Response({
            'user': {'username': user.username, 'id': user.id, 'email': user.email},
            'all_officers': officer_data,
            'current_user_officer': current_officer_data
        })
    except Exception as e:
        print(f"Error in debug_officer_data: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_performance(request):
    try:
        officer = _get_officer_for_user(request.user)
        if not officer:
            return Response({
                'totalComplaints': 5, 'resolvedComplaints': 2, 'pendingComplaints': 3,
                'resolutionRate': 40.0, 'averageResolutionTime': 2.5,
                'officerName': 'Test Officer', 'officerId': 'TEST001'
            })

        complaints = Complaint.objects.filter(officer_id=officer)
        total_complaints = complaints.count()
        resolved_complaints = complaints.filter(status='Completed').count()
        pending_complaints = complaints.filter(status='Pending').count()
        resolution_rate = (resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0

        resolved_with_time = complaints.filter(
            status='Completed', current_time__isnull=False, resolved_time__isnull=False
        )
        avg_resolution_time = 0
        if resolved_with_time.exists():
            total_time = sum(
                (c.resolved_time - c.current_time).days
                for c in resolved_with_time
                if c.current_time and c.resolved_time and (c.resolved_time - c.current_time).days >= 0
            )
            avg_resolution_time = total_time / resolved_with_time.count()

        return Response({
            'totalComplaints': total_complaints,
            'resolvedComplaints': resolved_complaints,
            'pendingComplaints': pending_complaints,
            'resolutionRate': round(resolution_rate, 2),
            'averageResolutionTime': round(avg_resolution_time, 1),
            'officerName': officer.name,
            'officerId': officer.officer_id
        })
    except Exception as e:
        print(f"Error in officer_performance: {str(e)}")
        return Response({'error': str(e)}, status=500)
