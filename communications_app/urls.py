from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VictimReportViewSet

router = DefaultRouter()
router.register(r'reports', VictimReportViewSet, basename='victim_report')

urlpatterns = [
    path('', include(router.urls)),
]
