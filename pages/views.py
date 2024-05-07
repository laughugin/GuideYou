# pages/views.py
from django.shortcuts import render
from rest_framework import viewsets
from .serializers import PagesSerializer  # Correct import of the serializer
from .models import Pages  # Ensure the correct model is imported

# Corrected view class
class PagesView(viewsets.ModelViewSet):
    serializer_class = PagesSerializer  # Reference to the correct serializer
    queryset = Pages.objects.all()  # Correct queryset for the view
