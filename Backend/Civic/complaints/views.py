from django.shortcuts import render
from .models import Complaint, ComplaintAssignment, ComplaintCategory
from .serializers import ComplaintSerializer, ComplaintAssignmentSerializer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import generics, status
from Categories.models import Category
import time
import cloudinary
import cloudinary.utils

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


import logging
logger = logging.getLogger(__name__)

class CreateComplaintView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print("=== CREATE COMPLAINT REQUEST ===")
        print("FILES payload:", request.FILES)
        print("DATA payload:", request.data)
        logger.info(f"Received request.FILES: {request.FILES}")
        try:
            data = request.data.copy()
            cat_val = data.get('Category')

            if cat_val is not None and not str(cat_val).isdigit():
                dept_name = str(cat_val).strip()
                dept_code = DEPT_NAME_TO_CODE.get(dept_name, 'OTHER')

                cc, _ = Category.objects.get_or_create(
                    name=dept_name,
                    defaults={'code': dept_code, 'department': dept_code},
                )
                if cc.code != dept_code or cc.department != dept_code:
                    cc.code = dept_code
                    cc.department = dept_code
                    cc.save(update_fields=['code', 'department'])

                data['Category'] = cc.id

            if 'image_video' in request.FILES:
                try:
                    import cloudinary.uploader
                    print("--- INITIATING NATIVE BACKEND CLOUDINARY PUSH ---")
                    upload_result = cloudinary.uploader.upload(request.FILES['image_video'])
                    data['image_video'] = upload_result.get('secure_url')
                    print("--- BACKEND CLOUDINARY UPLOAD SUCCESS ---", data['image_video'])
                except Exception as cloudinary_err:
                    print("--- BACKEND CLOUDINARY ERROR ---", cloudinary_err)
                    logger.error(f"Cloudinary upload error: {str(cloudinary_err)}", exc_info=True)
                    return Response({'success': False, 'error': f"Image upload to Cloudinary failed: {str(cloudinary_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            serializer = ComplaintSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                print("--- VALIDATION SUCCESS, SAVING NOW ---")
                try:
                    complaint = serializer.save()
                    if complaint.image_video:
                        print("--- CLOUDINARY UPLOAD SUCCESS --- URL:", complaint.image_video)
                    else:
                        print("--- COMPLAINT SAVED WITHOUT IMAGE ---")
                except Exception as save_err:
                    print("--- ERROR DURING DRF SAVE ---", save_err)
                    logger.error(f"Save error: {str(save_err)}", exc_info=True)
                    return Response({'success': False, 'error': f"Database save failed: {str(save_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response({
                    'success': True,
                    'message': 'Complaint Successfully Submitted',
                    'complaint_id': complaint.id,
                    'data': ComplaintSerializer(complaint, context={'request': request}).data
                }, status=status.HTTP_201_CREATED)

            print("--- DRF VALIDATION ERROR ---", serializer.errors)
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print("--- CRITICAL API ERROR ---", str(e))
            logger.error(f"Critical error in CreateComplaintView: {str(e)}", exc_info=True)
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


