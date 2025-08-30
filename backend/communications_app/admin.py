from django.contrib import admin
from .models import VictimReport


@admin.register(VictimReport)
class VictimReportAdmin(admin.ModelAdmin):
    list_display = ['phone', 'priority', 'status', 'reported_at']
    list_filter = ['status', 'priority', 'reported_at']
    search_fields = ['phone']
    readonly_fields = ['reported_at']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('phone', 'location')
        }),
        ('Report Details', {
            'fields': ('needs', 'priority', 'status')
        }),
        ('Timestamps', {
            'fields': ('reported_at',),
            'classes': ('collapse',)
        }),
    )
