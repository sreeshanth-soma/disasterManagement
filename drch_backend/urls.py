from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/flood_events/', include('flood_app.urls')),
    path('api/road_segments/', include('routing_app.urls')),
    path('api/victim_reports/', include('communications_app.urls')),
]
