from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoadSegmentViewSet

router = DefaultRouter()
router.register(r'segments', RoadSegmentViewSet, basename='road_segment')

urlpatterns = [
    path('', include(router.urls)),
]
