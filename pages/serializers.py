# pages/serializers.py
from rest_framework import serializers
from .models import Pages  # Correct import of your model

# Corrected class name to match expected usage in the views
class PagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pages
        fields = ('id', 'title', 'description', 'completed')  # Fields to serialize
