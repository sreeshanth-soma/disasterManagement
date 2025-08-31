from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import VictimReport

class VictimReportSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = VictimReport
        geo_field = 'location'
        fields = '__all__'
