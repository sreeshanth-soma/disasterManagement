from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Polygon, LineString, Point
from flood_app.models import FloodEvent
from routing_app.models import RoadSegment
from communications_app.models import VictimReport
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Creates sample data for FloodEvent, RoadSegment, and VictimReport models.'

    def handle(self, *args, **options):
        self.stdout.write("Creating sample data...")

        # Clear existing data (optional, for fresh runs)
        FloodEvent.objects.all().delete()
        RoadSegment.objects.all().delete()
        VictimReport.objects.all().delete()

        # Flood Events (Polygons) - NYC coordinates
        flood1_geom = Polygon(((-74.0059, 40.7128), (-74.0000, 40.7128), (-74.0000, 40.7200), (-74.0059, 40.7200), (-74.0059, 40.7128)))
        FloodEvent.objects.create(
            name="Downtown Financial District Flood",
            geom=flood1_geom,
            confidence=0.85,
            detected_at=timezone.now(),
            source="Satellite Detection"
        )

        flood2_geom = Polygon(((-73.9900, 40.7500), (-73.9800, 40.7500), (-73.9800, 40.7600), (-73.9900, 40.7600), (-73.9900, 40.7500)))
        FloodEvent.objects.create(
            name="Midtown East Flood Zone",
            geom=flood2_geom,
            confidence=0.72,
            detected_at=timezone.now() - timezone.timedelta(hours=2),
            source="Ground Sensor"
        )

        flood3_geom = Polygon(((-73.8500, 40.7800), (-73.8400, 40.7800), (-73.8400, 40.7900), (-73.8500, 40.7900), (-73.8500, 40.7800)))
        FloodEvent.objects.create(
            name="Queens Residential Area",
            geom=flood3_geom,
            confidence=0.91,
            detected_at=timezone.now() - timezone.timedelta(hours=1),
            source="Drone Survey"
        )

        # Road Segments (LineStrings)
        road1_geom = LineString((-74.0059, 40.7128), (-74.0000, 40.7150))
        RoadSegment.objects.create(
            osm_id=12345678,
            geom=road1_geom,
            status='flooded',
            last_checked=timezone.now()
        )

        road2_geom = LineString((-73.9900, 40.7500), (-73.9850, 40.7520))
        RoadSegment.objects.create(
            osm_id=23456789,
            geom=road2_geom,
            status='blocked',
            last_checked=timezone.now() - timezone.timedelta(minutes=30)
        )

        road3_geom = LineString((-73.8500, 40.7800), (-73.8450, 40.7820))
        RoadSegment.objects.create(
            osm_id=34567890,
            geom=road3_geom,
            status='normal',
            last_checked=timezone.now() - timezone.timedelta(minutes=15)
        )

        # Victim Reports (Points) with addresses
        victim1_location = Point(-74.003, 40.714)
        VictimReport.objects.create(
            phone="+1-555-0001",
            location=victim1_location,
            address="123 Wall Street, New York, NY 10005",
            needs={"food": True, "medical": True, "shelter": False},
            priority=4,
            status='new',
            reported_at=timezone.now()
        )

        victim2_location = Point(-73.9925, 40.698)
        VictimReport.objects.create(
            phone="+1-555-0002",
            location=victim2_location,
            address="456 Brooklyn Bridge Blvd, Brooklyn, NY 11201",
            needs={"food": True, "medical": False, "shelter": True},
            priority=2,
            status='triaged',
            reported_at=timezone.now() - timezone.timedelta(minutes=45)
        )

        victim3_location = Point(-73.8475, 40.754)
        VictimReport.objects.create(
            phone="+1-555-0003",
            location=victim3_location,
            address="789 Queens Boulevard, Queens, NY 11373",
            needs={"food": False, "medical": False, "shelter": True},
            priority=1,
            status='rescued',
            reported_at=timezone.now() - timezone.timedelta(hours=1)
        )

        victim4_location = Point(-73.9857, 40.7484)
        VictimReport.objects.create(
            phone="+1-555-0004",
            location=victim4_location,
            address="321 Times Square, New York, NY 10036",
            needs={"food": True, "medical": True, "shelter": True},
            priority=5,
            status='new',
            reported_at=timezone.now() - timezone.timedelta(minutes=20)
        )

        victim5_location = Point(-74.0060, 40.7589)
        VictimReport.objects.create(
            phone="+1-555-0005",
            location=victim5_location,
            address="654 Central Park West, New York, NY 10025",
            needs={"food": False, "medical": True, "shelter": False},
            priority=3,
            status='triaged',
            reported_at=timezone.now() - timezone.timedelta(minutes=10)
        )

        self.stdout.write(self.style.SUCCESS("Sample data created successfully!"))
        self.stdout.write(f"Created {FloodEvent.objects.count()} flood events")
        self.stdout.write(f"Created {RoadSegment.objects.count()} road segments")
        self.stdout.write(f"Created {VictimReport.objects.count()} victim reports")
