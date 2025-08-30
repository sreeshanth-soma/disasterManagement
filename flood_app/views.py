from rest_framework_gis.filters import InBBoxFilter
from rest_framework_gis.views import GeoJSONLayerView
from .models import FloodEvent
from .serializers import FloodEventSerializer

class FloodEventViewSet(GeoJSONLayerView):
    queryset = FloodEvent.objects.all()
    serializer_class = FloodEventSerializer
    bbox_filter_field = "geom"
    filter_backends = (InBBoxFilter,)
