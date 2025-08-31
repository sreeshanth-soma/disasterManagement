"""
URL configuration for drch_backend project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/flood-events/', include('flood_app.urls')),
    path('api/road-segments/', include('routing_app.urls')),
    path('api/victim-reports/', include('communications_app.urls')),
]
