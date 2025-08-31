from django.contrib import admin
from .models import FloodEvent


@admin.register(FloodEvent)
class FloodEventAdmin(admin.ModelAdmin):
    list_display = ['name', 'confidence', 'detected_at', 'source']
    list_filter = ['detected_at', 'source', 'confidence']
    search_fields = ['name', 'source']
    readonly_fields = ['detected_at']
    
    # For now, we'll just show the geom field as text
    # You can manually enter WKT format like: POLYGON((-74.0059 40.7128, -74.0000 40.7128, -74.0000 40.7200, -74.0059 40.7200, -74.0059 40.7128))
