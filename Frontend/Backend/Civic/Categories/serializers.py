from rest_framework import serializers
from Categories.models import Category


class ComplaintCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        