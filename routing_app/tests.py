from django.test import TestCase
from django.contrib.gis.geos import LineString
from .models import RoadSegment

class RoadSegmentModelTest(TestCase):

    def test_road_segment_creation(self):
        linestring = LineString((0, 0), (1, 1))
        segment = RoadSegment.objects.create(
            osm_id=12345,
            geom=linestring,
            status='normal'
        )
        self.assertIsInstance(segment, RoadSegment)
        self.assertEqual(segment.osm_id, 12345)
        self.assertEqual(segment.status, 'normal')
        self.assertEqual(segment.geom.geom_type, 'LineString')
