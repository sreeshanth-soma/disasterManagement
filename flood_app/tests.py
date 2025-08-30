from django.test import TestCase
from django.contrib.gis.geos import Polygon
from .models import FloodEvent

class FloodEventModelTest(TestCase):

    def test_flood_event_creation(self):
        polygon = Polygon(((0, 0), (0, 1), (1, 1), (1, 0), (0, 0)))
        event = FloodEvent.objects.create(
            name="Test Flood Event",
            geom=polygon,
            confidence=0.85,
            source="Test Sensor"
        )
        self.assertIsInstance(event, FloodEvent)
        self.assertEqual(event.name, "Test Flood Event")
        self.assertEqual(event.confidence, 0.85)
        self.assertEqual(event.geom.geom_type, 'Polygon')
