from django.contrib import admin
from .models import RoadSegment


@admin.register(RoadSegment)
class RoadSegmentAdmin(admin.ModelAdmin):
    list_display = ['osm_id', 'status', 'last_checked']
    list_filter = ['status', 'last_checked']
    search_fields = ['osm_id']
    readonly_fields = ['last_checked']
