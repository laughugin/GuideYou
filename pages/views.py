from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import PagesSerializer
from .models import Pages
import base64
import requests

class PagesView(viewsets.ModelViewSet):
    serializer_class = PagesSerializer
    queryset = Pages.objects.all()

class FileUploadView(viewsets.ViewSet):
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request):
        file = request.FILES['file']
        coordinates = self.process_image(file)
        return Response({'coordinates': coordinates})

    def process_image(self, file):
        # Convert image to base64
        import base64
        from io import BytesIO
        image_data = BytesIO(file.read())
        encoded_image = base64.b64encode(image_data.getvalue()).decode('utf-8')

        # Call your image processing API
        response = requests.post(
            'YOUR_IMAGE_PROCESSING_API_URL',
            json={'image': encoded_image}
        )
        data = response.json()
        return data['coordinates']  # Adjust based on API response structure
