"""
URL configuration for Civic project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from complaints.views import CreateComplaintView
from complaints.district_views import DistrictDetailView
from Civic import views
from Civic.views import getcomplaint,getcomplaintlimit,getpubliccomplaints,compinfo,complaintofficer,officerprofile,officerkpi,adminallcomplaintcart,adimncomplaints,ComplaintDelete,assigncomp,crateofficer,CategoriesList,CategoryDelete,adminstats,TrackComplaint,ComplaintStatus,OfficerDelete,OfficerUpdate,OfficerAnalytics,Logout,UserMonthlyRegistrations,admindashboardcard,UserRoleDistribution,ComplaintStatusTrends,CivicUserActivityView,UserEmailList
from accounts.views import RegisterView, LoginView, LogoutView, GoogleLoginView, UserDetail, UpdateUserDetails, UserListCreateView, UserRetrieveUpdateDeleteView, ChangePasswordView, UserActivityView, ToggleTwoFactorView, UserComplaintsView, TestAPIView, AdminProfileView, AdminUpdateProfileView, AdminSystemSettingsView, VerifyEmailOTP, ResendOTP
from contact_us.views import ContactUSview
from departments.views import OfficerDetail, department_profile, department_officers, department_complaints, department_performance, update_department_profile, department_dashboard, departments_overview, department_statistics, department_list_public, DepartmentListView
from departments.admin_urls import urlpatterns as department_admin_urls
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico')),
    path('admin/', admin.site.urls),
    path('api/raisecomplaint/',CreateComplaintView.as_view(),name='raisecomplaint'),
    path('api/getcomplaint/',getcomplaint.as_view(),name='getcomplaint'),
    path('api/getcomplaintlimit/',getcomplaintlimit.as_view(),name='getcomplaintlimit'),
    path('api/getpubliccomplaints/',getpubliccomplaints.as_view(),name='getpubliccomplaints'),
    # Backwards-compatible route expected by frontend
    path('api/complaints/', getpubliccomplaints.as_view(), name='complaints'),
    path('complaintsinfo/',views.complaintsinfo,name='complaintsinfo'),
    path('api/recent-complaints-admin/',views.recent_complaints_admin,name='recent_complaints_admin'),
    path('api/complaint-priority-distribution/',views.ComplaintPriorityDistribution.as_view(),name='complaint_priority_distribution'),
    path('api/admin-user-stats/',views.AdminUserStats.as_view(),name='admin_user_stats'),
    path('api/complaintDetails/<str:pk>',views.complaintDetails,name='complaintDetails'),
    # path('api/complaintsinfo/',complaintsinfo,name='complaintsinfo'),
    path('api/getcompinfo/',compinfo.as_view(),name='compinfo'),
    path('api/complaintinfo/',views.complaintinfo.as_view(),name='complaintinfo'),
    path('api/district/<str:district_name>/', DistrictDetailView.as_view(), name='district-detail'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/verify-email/', VerifyEmailOTP.as_view(), name='verify-email'),
    path('api/verify-otp/', VerifyEmailOTP.as_view(), name='verify-otp'),
    path('api/resend-otp/', ResendOTP.as_view(), name='resend-otp'),
    path('api/test/', TestAPIView.as_view(), name='test-api'),
    path('api/login/', LoginView.as_view(),name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('api/logout/', LogoutView.as_view(),name='logout'),
    path('api/google-login/',GoogleLoginView.as_view(),name='google-login'),
    path('api/userdetails/', UserDetail.as_view(),name='user-details'),
    path('api/update-userdetails/', UpdateUserDetails.as_view(), name='update-user-details'),
    # Admin User Management
    path('api/users/', UserListCreateView.as_view(), name='user-list-create'),
    path('api/users/<int:user_id>/', UserRetrieveUpdateDeleteView.as_view(), name='user-detail-update-delete'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/user-activity/', UserActivityView.as_view(), name='user-activity'),
    path('api/toggle-2fa/', ToggleTwoFactorView.as_view(), name='toggle-2fa'),
    path('api/usercomplaints/', UserComplaintsView.as_view(), name='user-complaints'),
    # Admin Profile and Settings
    path('api/admin/profile/', AdminProfileView.as_view(), name='admin-profile'),
    path('api/admin/update-profile/', AdminUpdateProfileView.as_view(), name='admin-update-profile'),
    path('api/admin/system-settings/', AdminSystemSettingsView.as_view(), name='admin-system-settings'),
    path('api/contact/',ContactUSview.as_view(),name='contact'),
    path('api/compinfo/',views.complaintinfo.as_view(),name='compinfo'),
    path('api/deptinfo/',views.deptinfo.as_view(),name='deptinfo'),
    path('api/officerinfo/',OfficerDetail.as_view(),name='officerinfo'),
    path('api/assign-officer/',complaintofficer.as_view(), name='assign-officer'),
    # Officer Dashboard URLs (must be before the catch-all officer_id route)
    path('api/officer/', include('officer.urls')),
    path('api/officer/<str:officer_id>/',officerprofile.as_view(),name='officer-profile'),
    path('api/officer-kpi/',officerkpi.as_view(),name='officer-kpi'),
    # path('api/officercomp-info/',officerinfo.as_view(),name='officerinfo')
    path('api/admindashboardcard/',adminallcomplaintcart.as_view(),name='admindashboardcard'),
    path('api/admincomplaints/',adimncomplaints.as_view(),name='adimncomplaints'),
    path('api/complaintdelete/<int:pk>/',ComplaintDelete.as_view(),name='complaintdelete'),
    path('api/complaintupdate/<int:pk>/',views.Updatecomp.as_view(),name='complaintupdate'),
    path('api/assigncomp/<int:pk>/',assigncomp.as_view(),name='assigncomp'),
    path('api/create-officer/', crateofficer.as_view(), name='create-officer'),
    path('api/categories/', CategoriesList.as_view(), name='categories'),
    path('api/deletecategory/<int:pk>/', CategoryDelete.as_view(), name='delete-category'),
    path('api/updatecategory/<int:pk>/', views.CategoryUpdate.as_view(), name='update-category'),
    path('api/adminstats/', adminstats.as_view(), name='adminstats'),
    path('api/admindashboardcard/', admindashboardcard.as_view(), name='admindashboardcard'),
    path('api/user-role-distribution/', UserRoleDistribution.as_view(), name='user-role-distribution'),
    path('api/complaint-status-trends/', ComplaintStatusTrends.as_view(), name='complaint-status-trends'),
    path('api/user-activity/', CivicUserActivityView.as_view(), name='user-activity'),
    path('api/categorieslist/',views.CategoryList.as_view(),name='categorieslist'),
    path('api/totalcategories/',views.TotalCategories.as_view(),name='totalcategories'),
    path('api/testcategories/',views.TestCategories.as_view(),name='testcategories'),
    path('api/trackcomplaint/<str:pk>/',TrackComplaint.as_view(),name='trackcomplaint'),
    path('api/complaintmonthwise/',views.ComplaintMonthWise.as_view(),name='complaint-mothwise'),
    path('api/complaintstatus/',views.ComplaintStatus.as_view(),name='complaint-status'),
    path('api/officerdelete/<str:pk>/',OfficerDelete.as_view(),name='officer-delete'),
    path('api/officerupdate/<str:pk>/',OfficerUpdate.as_view(),name='officer-update'),
    path('api/officeranalytics/',OfficerAnalytics.as_view(),name='officer-analytics'),
    path('api/logout/',Logout.as_view(),name='logout'),
    path('api/complaintindetails/',views.ComplaintInDetail.as_view(),name='complaintindetails'),
    path('api/complaintindetails/<int:pk>/',views.ComplaintInDetail.as_view(),name='complaintindetails-detail'),
    path('api/complaints/status/',views.ComplaintStatusStats.as_view(),name='complaint-status-stats'),
    path('api/complaints/monthly/',views.ComplaintMonthlyStats.as_view(),name='complaint-monthly-stats'),
    path('api/departments/', DepartmentListView.as_view(), name='departments-list'),
    path('api/admin/departments/', include(department_admin_urls)),
    path('api/department/dashboard/', department_dashboard, name='department-dashboard'),
    path('api/departments/overview/', departments_overview, name='departments-overview'),
    path('api/departments/statistics/', department_statistics, name='departments-statistics'),
    path('api/department/user-profile/',views.DepartmentUserProfile.as_view(),name='department-user-profile'),
    path('api/department/profile/', department_profile, name='department-profile'),
    path('api/department/officers/', department_officers, name='department-officers'),
    path('api/department/complaints/', department_complaints, name='department-complaints'),
    path('api/department/performance/', department_performance, name='department-performance'),
    path('api/department/list/', department_list_public, name='department-list-public'),
    path('api/users/emails/', views.UserEmailList.as_view(), name='user-email-list'),
    path('api/department/update-profile/', update_department_profile, name='update-department-profile'),
    path('api/department/upload-image/', views.DepartmentUploadImage.as_view(), name='department-upload-image'),
    path('api/UserDistrictWise/',views.UserDistrictWise.as_view(),name='UserDistrictWise'),
    path('api/user-registrations/monthly/', UserMonthlyRegistrations.as_view(), name='user-monthly-registrations'),
    path('api/user/stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('api/stats/', views.GlobalStatsView.as_view(), name='global-stats'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)