# pages/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PagesView, FileUploadView

router = DefaultRouter()
router.register(r'pages', PagesView)  # Register PagesView
router.register(r'upload', FileUploadView, basename='file-upload')  # Register FileUploadView

urlpatterns = [
    path('', include(router.urls)),  # Include the router URLs
]
