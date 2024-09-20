from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PagesView, FileUploadView

router = DefaultRouter()
router.register(r'pages', PagesView)
router.register(r'upload', FileUploadView, basename='file-upload')

urlpatterns = [
    path('', include(router.urls)),
]
