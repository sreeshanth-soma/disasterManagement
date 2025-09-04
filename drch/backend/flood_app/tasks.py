from celery import shared_task
from django.utils import timezone
from django.contrib.gis.geos import Point, Polygon
from django.contrib.gis.geos import GEOSGeometry
import logging

from .models import FloodEvent, SocialMediaPost
from .services.social_media_scraper import SocialMediaScraper

logger = logging.getLogger(__name__)


@shared_task
def scrape_social_media():
    """Celery task to scrape social media for flood-related content"""
    try:
        scraper = SocialMediaScraper()
        posts = scraper.scrape_all_platforms()
        
        created_count = 0
        flood_events_created = 0
        
        for post_data in posts:
            # Save raw post data
            post, created = SocialMediaPost.objects.get_or_create(
                post_id=post_data['post_id'],
                platform=post_data['platform'],
                defaults={
                    'content': post_data['content'],
                    'author_username': post_data['author_username'],
                    'author_display_name': post_data.get('author_display_name', ''),
                    'post_url': post_data['post_url'],
                    'created_at': post_data['created_at'],
                    'engagement_metrics': post_data.get('engagement_metrics', {}),
                    'location_data': post_data.get('location_data', {}),
                    'media_urls': post_data.get('media_urls', []),
                    'flood_relevant': post_data.get('flood_relevant', False),
                    'confidence_score': post_data.get('confidence_score', 0.0),
                }
            )
            
            if created:
                created_count += 1
                post.processed = True
                post.save()
                
                # Create FloodEvent if confidence is high enough
                if post_data.get('confidence_score', 0) > 0.5:
                    flood_event = create_flood_event_from_post(post_data)
                    if flood_event:
                        flood_events_created += 1
        
        logger.info(f"Social media scraping completed: {created_count} new posts, {flood_events_created} flood events created")
        return {
            'posts_created': created_count,
            'flood_events_created': flood_events_created,
            'total_processed': len(posts)
        }
        
    except Exception as e:
        logger.error(f"Social media scraping failed: {e}")
        raise


def create_flood_event_from_post(post_data: dict) -> FloodEvent:
    """Create a FloodEvent from social media post data"""
    try:
        # Extract location information
        location = extract_location_from_post(post_data)
        
        if not location:
            logger.warning(f"No location found for post {post_data['post_id']}")
            return None
        
        # Create a small polygon around the point (approximate area)
        point = Point(location['lng'], location['lat'])
        # Create a small buffer around the point (roughly 100m radius)
        polygon = point.buffer(0.001)  # Roughly 100m in degrees
        
        # Generate event name
        event_name = f"Flood Alert - {post_data['platform'].title()} - {post_data['author_username']}"
        
        # Calculate confidence based on multiple factors
        base_confidence = post_data.get('confidence_score', 0.5)
        engagement_boost = calculate_engagement_boost(post_data.get('engagement_metrics', {}))
        final_confidence = min(base_confidence + engagement_boost, 1.0)
        
        flood_event = FloodEvent.objects.create(
            name=event_name,
            geom=polygon,
            confidence=final_confidence,
            source='social_media',
            social_media_source=post_data['platform'],
            original_post_id=post_data['post_id'],
            post_content=post_data['content'],
            author_username=post_data['author_username'],
            engagement_score=calculate_engagement_score(post_data.get('engagement_metrics', {})),
            post_url=post_data['post_url'],
            location_description=location.get('description', ''),
            severity_level=post_data.get('severity_level', 'medium'),
            verified=False
        )
        
        logger.info(f"Created flood event {flood_event.id} from {post_data['platform']} post")
        return flood_event
        
    except Exception as e:
        logger.error(f"Failed to create flood event from post: {e}")
        return None


def extract_location_from_post(post_data: dict) -> dict:
    """Extract location information from post data"""
    # Try to get location from post's location data first
    location_data = post_data.get('location_data', {})
    
    if location_data and 'coordinates' in location_data:
        coords = location_data['coordinates']
        if 'coordinates' in coords:
            lng, lat = coords['coordinates']
            return {
                'lat': lat,
                'lng': lng,
                'description': location_data.get('place', {}).get('full_name', '')
            }
    
    # Fallback: try to extract from text content
    # This is a simplified version - in production, you'd use more sophisticated NLP
    content = post_data.get('content', '').lower()
    
    # Common location patterns (this would be much more sophisticated in production)
    location_keywords = [
        'hyderabad', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata',
        'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
        'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'patna'
    ]
    
    for keyword in location_keywords:
        if keyword in content:
            # Return approximate coordinates for the city
            city_coords = get_city_coordinates(keyword)
            if city_coords:
                return {
                    'lat': city_coords['lat'],
                    'lng': city_coords['lng'],
                    'description': keyword.title()
                }
    
    return None


def get_city_coordinates(city_name: str) -> dict:
    """Get approximate coordinates for major cities"""
    city_coords = {
        'hyderabad': {'lat': 17.3850, 'lng': 78.4867},
        'mumbai': {'lat': 19.0760, 'lng': 72.8777},
        'delhi': {'lat': 28.7041, 'lng': 77.1025},
        'bangalore': {'lat': 12.9716, 'lng': 77.5946},
        'chennai': {'lat': 13.0827, 'lng': 80.2707},
        'kolkata': {'lat': 22.5726, 'lng': 88.3639},
        'pune': {'lat': 18.5204, 'lng': 73.8567},
        'ahmedabad': {'lat': 23.0225, 'lng': 72.5714},
        'jaipur': {'lat': 26.9124, 'lng': 75.7873},
        'lucknow': {'lat': 26.8467, 'lng': 80.9462},
        'kanpur': {'lat': 26.4499, 'lng': 80.3319},
        'nagpur': {'lat': 21.1458, 'lng': 79.0882},
        'indore': {'lat': 22.7196, 'lng': 75.8577},
        'thane': {'lat': 19.2183, 'lng': 72.9781},
        'bhopal': {'lat': 23.2599, 'lng': 77.4126},
        'visakhapatnam': {'lat': 17.6868, 'lng': 83.2185},
        'pimpri': {'lat': 18.6298, 'lng': 73.7997},
        'patna': {'lat': 25.5941, 'lng': 85.1376},
    }
    
    return city_coords.get(city_name.lower())


def calculate_engagement_boost(metrics: dict) -> float:
    """Calculate confidence boost based on engagement metrics"""
    boost = 0.0
    
    # Twitter metrics
    if 'like_count' in metrics:
        boost += min(metrics['like_count'] / 1000, 0.1)  # Max 0.1 boost
    if 'retweet_count' in metrics:
        boost += min(metrics['retweet_count'] / 500, 0.1)  # Max 0.1 boost
    if 'reply_count' in metrics:
        boost += min(metrics['reply_count'] / 200, 0.05)  # Max 0.05 boost
    
    # YouTube metrics (if available)
    if 'view_count' in metrics:
        boost += min(metrics['view_count'] / 10000, 0.1)  # Max 0.1 boost
    
    return min(boost, 0.2)  # Cap total boost at 0.2


def calculate_engagement_score(metrics: dict) -> float:
    """Calculate overall engagement score"""
    score = 0.0
    
    # Weight different engagement types
    if 'like_count' in metrics:
        score += metrics['like_count'] * 1.0
    if 'retweet_count' in metrics:
        score += metrics['retweet_count'] * 2.0  # Retweets are more valuable
    if 'reply_count' in metrics:
        score += metrics['reply_count'] * 1.5
    if 'view_count' in metrics:
        score += metrics['view_count'] * 0.1  # Views are less valuable
    
    return score


@shared_task
def cleanup_old_social_media_posts():
    """Clean up old social media posts to prevent database bloat"""
    try:
        cutoff_date = timezone.now() - timezone.timedelta(days=30)
        deleted_count = SocialMediaPost.objects.filter(
            created_at_db__lt=cutoff_date,
            processed=True
        ).delete()[0]
        
        logger.info(f"Cleaned up {deleted_count} old social media posts")
        return {'deleted_count': deleted_count}
        
    except Exception as e:
        logger.error(f"Failed to cleanup old posts: {e}")
        raise
