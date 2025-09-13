from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Polygon
from flood_app.models import FloodEvent
from django.utils import timezone
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Add current flood events with today\'s dates'

    def handle(self, *args, **options):
        # Clear old data
        FloodEvent.objects.all().delete()
        
        # Create fresh flood events with current dates
        current_time = timezone.now()
        
        # Recent flood events from the last few hours
        flood_events = [
            {
                'name': 'Downtown Mumbai Flash Flood',
                'coords': [72.8777, 19.0760],  # Mumbai coordinates
                'confidence': 0.92,
                'hours_ago': 2,
                'source': 'social_media',
                'description': 'Heavy rainfall causing waterlogging in downtown Mumbai area'
            },
            {
                'name': 'Hyderabad Tech City Flooding',
                'coords': [78.4867, 17.3850],  # Hyderabad coordinates
                'confidence': 0.88,
                'hours_ago': 4,
                'source': 'social_media',
                'description': 'Tech corridors experiencing severe flooding due to monsoon rains'
            },
            {
                'name': 'Delhi NCR Urban Flood Alert',
                'coords': [77.1025, 28.7041],  # Delhi coordinates
                'confidence': 0.85,
                'hours_ago': 6,
                'source': 'social_media',
                'description': 'Multiple reports of flooded roads and metro disruptions'
            },
            {
                'name': 'Bangalore Electronic City Flood',
                'coords': [77.5946, 12.9716],  # Bangalore coordinates
                'confidence': 0.90,
                'hours_ago': 8,
                'source': 'social_media',
                'description': 'Electronic City reporting significant water accumulation'
            },
            {
                'name': 'Chennai Marina Beach Flood Warning',
                'coords': [80.2707, 13.0827],  # Chennai coordinates
                'confidence': 0.87,
                'hours_ago': 12,
                'source': 'social_media',
                'description': 'Coastal flooding affecting Marina Beach and surrounding areas'
            }
        ]
        
        created_count = 0
        
        for event_data in flood_events:
            # Create a small polygon around the point
            lng, lat = event_data['coords']
            # Create a buffer around the point (roughly 1km radius)
            buffer_size = 0.01  # Roughly 1km in degrees
            
            polygon = Polygon((
                (lng - buffer_size, lat - buffer_size),
                (lng + buffer_size, lat - buffer_size),
                (lng + buffer_size, lat + buffer_size),
                (lng - buffer_size, lat + buffer_size),
                (lng - buffer_size, lat - buffer_size)
            ))
            
            # Calculate the detection time
            detected_time = current_time - timedelta(hours=event_data['hours_ago'])
            
            flood_event = FloodEvent.objects.create(
                name=event_data['name'],
                geom=polygon,
                confidence=event_data['confidence'],
                detected_at=detected_time,
                source=event_data['source'],
                social_media_source='reddit',
                post_content=f"Recent flood report: {event_data['description']}",
                author_username=f"user_{random.randint(1000, 9999)}",
                engagement_score=random.uniform(50, 200),
                location_description=event_data['description'],
                severity_level='high' if event_data['confidence'] > 0.9 else 'medium',
                verified=False
            )
            
            created_count += 1
            self.stdout.write(f"Created: {flood_event.name} - {detected_time}")
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} current flood events!')
        )
        self.stdout.write(
            self.style.SUCCESS('Your flood reports page should now show current events.')
        )
