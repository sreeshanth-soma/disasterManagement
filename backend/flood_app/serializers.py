from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import FloodEvent

class FloodEventSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = FloodEvent
        geo_field = 'geom'
        fields = '__all__'
