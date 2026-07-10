from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from complaints.models import Complaint
from accounts.models import CustomUser
# Create your views here.

class UserDashboardStats(APIView):
    permission_classes=[IsAuthenticated]

    def get(request,self):
        user=request.user

        total=Complaint.objects.filter(user=user).count()
        In_progress=Complaint.objects.filter(user=user,status='in-progress')
        pending=Complaint.objects.filter(user=user,status='Pending')
        resolved=Complaint.objects.filter(user=user,status='resolved')

        return Response({
            "user":user.username,
            "total":total,
            "In_progress":In_progress,
            "pending":pending,
            "resolved":resolved,
            "In_progress":In_progress
        })

