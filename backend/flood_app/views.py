from rest_framework import viewsets
from rest_framework_gis.filters import InBBoxFilter
from .models import FloodEvent
from .serializers import FloodEventSerializer

class FloodEventViewSet(viewsets.ModelViewSet):
    queryset = FloodEvent.objects.all()
    serializer_class = FloodEventSerializer
    filter_backends = [InBBoxFilter]
    bbox_filter_field = 'geom'
