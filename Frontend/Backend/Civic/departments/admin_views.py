from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from departments.models import Department
from departments.serializers import deptSerializer
from accounts.models import CustomUser
from complaints.models import Complaint


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def department_management(request):
    """
    GET: List all departments
    POST: Create a new department
    """
    if request.method == 'GET':
        departments = Department.objects.all().order_by('name')
        serializer = deptSerializer(departments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = deptSerializer(data=request.data)
        if serializer.is_valid():
            # Check if category already exists
            category = request.data.get('category')
            if Department.objects.filter(category=category).exists():
                return Response(
                    {'error': 'A department with this category already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Handle head officer assignment
            head_officer_email = request.data.get('head_officer')
            if head_officer_email:
                try:
                    head_officer = CustomUser.objects.get(email=head_officer_email)
                    serializer.validated_data['head_officer'] = head_officer
                except CustomUser.DoesNotExist:
                    return Response(
                        {'error': 'Head officer not found'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            department = serializer.save()
            return Response(deptSerializer(department).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def department_detail(request, pk):
    """
    GET: Get a specific department
    PUT: Update a department
    DELETE: Delete a department
    """
    department = get_object_or_404(Department, pk=pk)
    
    if request.method == 'GET':
        serializer = deptSerializer(department)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = deptSerializer(department, data=request.data, partial=True)
        if serializer.is_valid():
            # Check if category already exists (for other departments)
            category = request.data.get('category')
            if category and category != department.category:
                if Department.objects.filter(category=category).exclude(pk=pk).exists():
                    return Response(
                        {'error': 'A department with this category already exists'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Handle head officer assignment
            head_officer_email = request.data.get('head_officer')
            if head_officer_email:
                try:
                    head_officer = CustomUser.objects.get(email=head_officer_email)
                    serializer.validated_data['head_officer'] = head_officer
                except CustomUser.DoesNotExist:
                    return Response(
                        {'error': 'Head officer not found'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            department = serializer.save()
            return Response(deptSerializer(department).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Check if department has associated complaints
        complaint_count = Complaint.objects.filter(
            Category__department=department.name
        ).count()
        
        if complaint_count > 0:
            return Response(
                {'error': f'Cannot delete department. {complaint_count} complaints are associated with this department.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if department has officers
        if department.officers.count() > 0:
            return Response(
                {'error': 'Cannot delete department. Officers are still assigned to this department.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        department.delete()
        return Response({'message': 'Department deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_logged_in_users(request):
    """
    Returns users who have logged in recently (last_login is not null),
    with their role and department info.
    """
    from django.utils import timezone
    from datetime import timedelta

    users = CustomUser.objects.filter(
        last_login__isnull=False
    ).order_by('-last_login')[:50]

    data = []
    for u in users:
        # Resolve department
        dept_name = None
        try:
            if hasattr(u, 'headed_department') and u.headed_department.exists():
                dept_name = u.headed_department.first().get_category_display()
            elif hasattr(u, 'departments') and u.departments.exists():
                dept_name = u.departments.first().get_category_display()
        except Exception:
            pass

        # Active = logged in within last 30 minutes
        is_online = (
            u.last_login and
            (timezone.now() - u.last_login).total_seconds() < 1800
        )

        data.append({
            'id': u.id,
            'name': u.get_full_name() or u.username,
            'email': u.email,
            'role': u.User_Role or 'Civic-User',
            'department': dept_name,
            'last_login': u.last_login.strftime('%Y-%m-%d %H:%M') if u.last_login else None,
            'is_active': u.is_active,
            'is_online': is_online,
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_stats(request):
    """
    Get department statistics for dashboard
    """
    departments = Department.objects.all()
    
    total_departments = departments.count()
    departments_with_head = departments.filter(head_officer__isnull=False).count()
    departments_without_head = total_departments - departments_with_head
    
    # Calculate total officers across all departments
    total_officers = sum(dept.officers.count() for dept in departments)
    
    # Category distribution
    from collections import defaultdict
    category_count = defaultdict(int)
    for dept in departments:
        category_label = dict(Department.CATEGORY_CHOICES).get(dept.category, dept.category)
        category_count[category_label] += 1
    
    category_distribution = [
        {'category': label, 'count': count} 
        for label, count in category_count.items()
    ]
    
    stats = {
        'total_departments': total_departments,
        'total_officers': total_officers,
        'departments_with_head': departments_with_head,
        'departments_without_head': departments_without_head,
        'category_distribution': category_distribution
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_officers_list(request, pk):
    """
    Get list of officers in a specific department
    """
    department = get_object_or_404(Department, pk=pk)
    officers = department.officers.all()
    
    officers_data = []
    for officer in officers:
        officers_data.append({
            'id': officer.id,
            'name': officer.get_full_name(),
            'email': officer.email,
            'role': officer.User_Role or 'Officer',
            'is_active': officer.is_active,
            'date_joined': officer.date_joined.strftime('%Y-%m-%d') if officer.date_joined else None
        })
    
    return Response({
        'department': deptSerializer(department).data,
        'officers': officers_data,
        'total_officers': len(officers_data)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_officer_to_department(request, pk):
    """
    Assign an officer to a department
    """
    department = get_object_or_404(Department, pk=pk)
    officer_email = request.data.get('officer_email')
    
    if not officer_email:
        return Response(
            {'error': 'Officer email is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        officer = CustomUser.objects.get(email=officer_email)
        
        # Check if officer is already assigned
        if department.officers.filter(id=officer.id).exists():
            return Response(
                {'error': 'Officer is already assigned to this department'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        department.officers.add(officer)
        return Response({'message': 'Officer assigned successfully'})
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Officer not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_officer_from_department(request, pk, officer_id):
    """
    Remove an officer from a department
    """
    department = get_object_or_404(Department, pk=pk)
    
    try:
        officer = department.officers.get(id=officer_id)
        department.officers.remove(officer)
        return Response({'message': 'Officer removed successfully'})
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Officer not found in this department'}, 
            status=status.HTTP_404_NOT_FOUND
        )
