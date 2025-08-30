from django.test import TestCase
from django.contrib.gis.geos import Point
from django.db.models import JSONField
from .models import VictimReport

class VictimReportModelTest(TestCase):

    def test_victim_report_creation(self):
        point = Point(10, 20)
        needs_data = {"food": True, "water": False}
        report = VictimReport.objects.create(
            phone="1234567890",
            location=point,
            needs=needs_data,
            priority=1,
            status='new'
        )
        self.assertIsInstance(report, VictimReport)
        self.assertEqual(report.phone, "1234567890")
        self.assertEqual(report.priority, 1)
        self.assertEqual(report.status, 'new')
        self.assertEqual(report.location.geom_type, 'Point')
        self.assertEqual(report.needs, needs_data)
