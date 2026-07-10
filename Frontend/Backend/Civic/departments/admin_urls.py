from django.urls import path
from . import admin_views
from .views import department_profile, department_officers, department_complaints, department_performance, update_department_profile

app_name = 'departments'

urlpatterns = [
    path('', admin_views.department_management, name='department_management'),
    path('<int:pk>/', admin_views.department_detail, name='department_detail'),
    path('stats/', admin_views.department_stats, name='department_stats'),
    path('logged-in-users/', admin_views.department_logged_in_users, name='department_logged_in_users'),
    path('<int:pk>/officers/', admin_views.department_officers_list, name='department_officers_list'),
    path('<int:pk>/assign-officer/', admin_views.assign_officer_to_department, name='assign_officer_to_department'),
    path('<int:pk>/remove-officer/<int:officer_id>/', admin_views.remove_officer_from_department, name='remove_officer_from_department'),
]
