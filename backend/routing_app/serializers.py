from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import RoadSegment

class RoadSegmentSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = RoadSegment
        geo_field = 'geom'
        fields = '__all__'
