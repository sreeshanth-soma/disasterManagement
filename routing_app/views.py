from rest_framework_gis.filters import InBBoxFilter
from rest_framework_gis.views import GeoJSONLayerView
from .models import RoadSegment
from .serializers import RoadSegmentSerializer

class RoadSegmentViewSet(GeoJSONLayerView):
    queryset = RoadSegment.objects.all()
    serializer_class = RoadSegmentSerializer
    bbox_filter_field = "geom"
    filter_backends = (InBBoxFilter,)
