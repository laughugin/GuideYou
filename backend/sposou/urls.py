# sposou/urls.py
from django.urls import path
from pages.views import UserLocationView, PagesView, UserSearchHistoryView, FileUploadView  # Ensure UserLocationView is imported here

urlpatterns = [
    path('api/user-location/', UserLocationView.as_view(), name='user-location'),
    path('api/user_search_history/', UserSearchHistoryView.as_view(), name='user_search_history'),
    path('api/upload/', FileUploadView.as_view({'post': 'create'}), name='file-upload'),
]
