from django.contrib import admin
from Categories.models import Category


class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'department', 'total_comp']


admin.site.register(Category, CategoryAdmin)