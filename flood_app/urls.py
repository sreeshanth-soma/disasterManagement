from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FloodEventViewSet

router = DefaultRouter()
router.register(r'events', FloodEventViewSet, basename='flood_event')

urlpatterns = [
    path('', include(router.urls)),
]
