from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import contact_us
from .serializer import contactusSerializer

# Create your views here.


class ContactUSview(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'success': False, 'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            queries = contact_us.objects.all().order_by('-id')
            serializer = contactusSerializer(queries, many=True)
            return Response({'success': True, 'count': queries.count(), 'results': serializer.data})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = contactusSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'success': True, 'message': 'Contact form submitted successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
            return Response({'success': False, 'errors': serializer.errors, 'message': 'Form validation failed'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        if not request.user.is_authenticated:
            return Response({'success': False, 'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        query_id = request.query_params.get('id')
        if not query_id:
            return Response({'success': False, 'error': 'Query ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            query = contact_us.objects.get(id=query_id)
            query.delete()
            return Response({'success': True, 'message': 'Query deleted successfully'})
        except contact_us.DoesNotExist:
            return Response({'success': False, 'error': 'Query not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


