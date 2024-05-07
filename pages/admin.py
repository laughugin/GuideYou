from django.contrib import admin
from .models import Pages

class PagesAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'completed')

admin.site.register(Pages, PagesAdmin)