from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point, Polygon, LineString
from flood_app.models import FloodEvent
from routing_app.models import RoadSegment
from communications_app.models import VictimReport
from django.utils import timezone
import random


class Command(BaseCommand):
    help = 'Create sample data for disaster management system'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create sample flood events
        flood_areas = [
            {
                'name': 'Downtown Financial District Flood',
                'coords': [[-74.0059, 40.7128], [-74.0000, 40.7128], [-74.0000, 40.7200], [-74.0059, 40.7200], [-74.0059, 40.7128]],
                'confidence': 0.85,
                'source': 'Satellite Detection'
            },
            {
                'name': 'Brooklyn Heights Overflow',
                'coords': [[-73.9950, 40.6960], [-73.9900, 40.6960], [-73.9900, 40.7020], [-73.9950, 40.7020], [-73.9950, 40.6960]],
                'confidence': 0.92,
                'source': 'Ground Sensors'
            },
            {
                'name': 'Queens Riverside Flood',
                'coords': [[-73.8500, 40.7500], [-73.8400, 40.7500], [-73.8400, 40.7580], [-73.8500, 40.7580], [-73.8500, 40.7500]],
                'confidence': 0.78,
                'source': 'Drone Survey'
            }
        ]

        for flood_data in flood_areas:
            polygon = Polygon(flood_data['coords'])
            flood_event, created = FloodEvent.objects.get_or_create(
                name=flood_data['name'],
                defaults={
                    'geom': polygon,
                    'confidence': flood_data['confidence'],
                    'source': flood_data['source'],
                    'detected_at': timezone.now()
                }
            )
            if created:
                self.stdout.write(f'Created flood event: {flood_event.name}')

        # Create sample road segments
        road_segments = [
            {
                'osm_id': 123456789,
                'coords': [[-74.0059, 40.7128], [-74.0000, 40.7150]],
                'status': 'flooded'
            },
            {
                'osm_id': 987654321,
                'coords': [[-73.9950, 40.6960], [-73.9900, 40.6980]],
                'status': 'blocked'
            },
            {
                'osm_id': 456789123,
                'coords': [[-73.8500, 40.7500], [-73.8450, 40.7520]],
                'status': 'normal'
            }
        ]

        for road_data in road_segments:
            linestring = LineString(road_data['coords'])
            road_segment, created = RoadSegment.objects.get_or_create(
                osm_id=road_data['osm_id'],
                defaults={
                    'geom': linestring,
                    'status': road_data['status'],
                    'last_checked': timezone.now()
                }
            )
            if created:
                self.stdout.write(f'Created road segment: {road_segment.osm_id}')

        # Create sample victim reports
        victim_reports = [
            {
                'phone': '+1-555-0001',
                'coords': [-74.0030, 40.7140],
                'needs': {'medical': True, 'food': True, 'shelter': False},
                'priority': 4,
                'status': 'new'
            },
            {
                'phone': '+1-555-0002',
                'coords': [-73.9925, 40.6980],
                'needs': {'medical': False, 'food': True, 'shelter': True},
                'priority': 2,
                'status': 'triaged'
            },
            {
                'phone': '+1-555-0003',
                'coords': [-73.8475, 40.7540],
                'needs': {'medical': False, 'food': False, 'shelter': True},
                'priority': 1,
                'status': 'rescued'
            }
        ]

        for victim_data in victim_reports:
            point = Point(victim_data['coords'])
            victim_report, created = VictimReport.objects.get_or_create(
                phone=victim_data['phone'],
                defaults={
                    'location': point,
                    'needs': victim_data['needs'],
                    'priority': victim_data['priority'],
                    'status': victim_data['status'],
                    'reported_at': timezone.now()
                }
            )
            if created:
                self.stdout.write(f'Created victim report: {victim_report.phone}')

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
