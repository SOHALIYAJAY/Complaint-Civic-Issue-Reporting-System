
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    list_display = ("email", "username", "name", "User_Role", "mobile_number", "address", "district", "taluka", "ward_number", "created_join", "is_staff", "is_active")

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "name", "User_Role", "mobile_number", "address", "district", "taluka", "ward_number")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "created_join")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "password1", "password2", "name", "User_Role", "is_staff", "is_active"),
        }),
    )

    ordering = ("email",)
    search_fields = ("email", "username", "name")


admin.site.register(CustomUser, CustomUserAdmin)





# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from .models import CustomUser


# class CustomUserAdmin(UserAdmin):
#     list_display = ["email","username",'User_Role','created_join']
    

#     # # fieldsets = (
#     # #     (None, {"fields": ("email", "password")}),
#     # #     ("Personal Info", {"fields": ("first_name", "last_name")}),
#     # #     ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
#     # #     ("Important Dates", {"fields": ("last_login",)}),
#     # # )

#     # # add_fieldsets = (
#     # #     (None, {
#     # #         "classes": ("wide",),
#     # #         "fields": ("email", "first_name", "last_name", "password1", "password2", "is_staff", "is_superuser"),
#     # #     }),
#     # # )

#     # search_fields = ("email",)

# admin.site.register(CustomUser, CustomUserAdmin)
