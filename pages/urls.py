from django.urls import path
from . import views  # Import directly from the same module, not itself

urlpatterns = [
    path('', views.home, name='home'),  # This should work if there's no circular import
]