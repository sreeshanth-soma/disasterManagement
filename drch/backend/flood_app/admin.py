from django.contrib import admin
from .models import FloodEvent


@admin.register(FloodEvent)
class FloodEventAdmin(admin.ModelAdmin):
    list_display = ['name', 'confidence', 'detected_at', 'source']
    list_filter = ['detected_at', 'source', 'confidence']
    search_fields = ['name', 'source']
    readonly_fields = ['detected_at']
