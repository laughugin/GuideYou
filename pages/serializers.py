# pages/serializers.py
from rest_framework import serializers
from .models import Pages  # Adjust the import according to your models

class PagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pages
        fields = '__all__'  # Or specify the fields you want to include
