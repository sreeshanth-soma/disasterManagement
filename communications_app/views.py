from rest_framework import viewsets
from rest_framework_gis.filters import InBBoxFilter
from rest_framework_gis.views import GeoJSONLayerView
from .models import VictimReport
from .serializers import VictimReportSerializer

class VictimReportViewSet(GeoJSONLayerView):
    queryset = VictimReport.objects.all()
    serializer_class = VictimReportSerializer
    bbox_filter_field = "location"
    filter_backends = (InBBoxFilter,)
