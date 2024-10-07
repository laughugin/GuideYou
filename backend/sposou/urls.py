# sposou/urls.py
from django.urls import path
from pages.views import UserLocationView, PagesView, FileUploadView  # Ensure UserLocationView is imported here

urlpatterns = [
    path('api/user-location/', UserLocationView.as_view(), name='user-location'),
    path('api/upload/', FileUploadView.as_view({'post': 'create'}), name='file-upload'),
]
