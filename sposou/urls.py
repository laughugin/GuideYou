# sposou/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static
from pages.views import PagesView  # Import the correct view class

# Corrected router registration
router = routers.DefaultRouter()
router.register(r'pages', PagesView)  # Use the correct viewset class

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # Include the registered router URLs
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



