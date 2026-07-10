from django.urls import path
from . import views

app_name = 'officer'

urlpatterns = [
    path('test/', views.test_endpoint, name='test_endpoint'),
    path('dashboard-stats/', views.officer_dashboard_stats, name='officer_dashboard_stats'),
    path('recent-complaints/', views.officer_recent_complaints, name='officer_recent_complaints'),
    path('monthly-trends/', views.officer_monthly_trends, name='officer_monthly_trends'),
    path('complaints/', views.officer_complaints, name='officer_complaints'),
    path('complaints/<int:complaint_id>/update/', views.update_complaint_status, name='update_complaint_status'),
    path('complaints/<int:complaint_id>/history/', views.complaint_status_history, name='complaint_status_history'),
    path('performance/', views.officer_performance, name='officer_performance'),
    path('profile/', views.officer_profile, name='officer_profile'),
    path('debug/', views.debug_officer_data, name='debug_officer_data'),
]
