from rest_framework import viewsets
from rest_framework_gis.filters import InBBoxFilter
from .models import RoadSegment
from .serializers import RoadSegmentSerializer

class RoadSegmentViewSet(viewsets.ModelViewSet):
    queryset = RoadSegment.objects.all()
    serializer_class = RoadSegmentSerializer
    filter_backends = [InBBoxFilter]
    bbox_filter_field = 'geom'
