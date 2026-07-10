from django.shortcuts import render
from .models import Complaint, ComplaintAssignment, ComplaintCategory
from .serializers import ComplaintSerializer, ComplaintAssignmentSerializer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework import generics, status
from Categories.models import Category


# Mapping from full department display name → department category code
DEPT_NAME_TO_CODE = {
    'Roads & Infrastructure':       'ROADS',
    'Traffic & Road Safety':        'TRAFFIC',
    'Water Supply':                 'WATER',
    'Sewerage & Drainage':          'SEWERAGE',
    'Sanitation & Garbage':         'SANITATION',
    'Street Lighting':              'LIGHTING',
    'Public Health Hazard':         'HEALTH',
    'Parks & Public Spaces':        'PARKS',
    'Stray Animals':                'ANIMALS',
    'Illegal Construction':         'ILLEGAL_CONSTRUCTION',
    'Encroachment':                 'ENCROACHMENT',
    'Public Property Damage':       'PROPERTY_DAMAGE',
    'Noise Pollution':              'NOISE',
    'Electricity & Power Issues':   'ELECTRICITY',
    'Street Vendor / Hawker Issues':'VENDORS',
    'Other':                        'OTHER',
}


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
@permission_classes([IsAuthenticated])
def createcomplaint(request):
    data = request.data.copy()
    cat_val = data.get('Category')

    if cat_val is not None and not str(cat_val).isdigit():
        dept_name = str(cat_val).strip()
        dept_code = DEPT_NAME_TO_CODE.get(dept_name, 'OTHER')

        # Find or create the Category record keyed by the department display name
        cc, _ = Category.objects.get_or_create(
            name=dept_name,
            defaults={'code': dept_code, 'department': dept_code},
        )
        # Ensure code/department are up-to-date on existing records
        if cc.code != dept_code or cc.department != dept_code:
            cc.code = dept_code
            cc.department = dept_code
            cc.save(update_fields=['code', 'department'])

        data['Category'] = cc.id

    serializer = ComplaintSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        complaint = serializer.save()
        return Response({
            'success': True,
            'message': 'Complaint Successfully Submitted',
            'complaint_id': complaint.id,
            'data': ComplaintSerializer(complaint, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)

    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

