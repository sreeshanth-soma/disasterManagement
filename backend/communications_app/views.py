from rest_framework import viewsets
from rest_framework_gis.filters import InBBoxFilter
from .models import VictimReport
from .serializers import VictimReportSerializer

class VictimReportViewSet(viewsets.ModelViewSet):
    queryset = VictimReport.objects.all()
    serializer_class = VictimReportSerializer
    filter_backends = [InBBoxFilter]
    bbox_filter_field = 'location'
