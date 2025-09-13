import os
import requests
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from django.contrib.gis.geos import Point, Polygon
from django.utils import timezone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class GDACSFloodScraper:
    """GDACS (Global Disaster Alert and Coordination System) flood data scraper"""
    
    def __init__(self):
        self.base_url = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"
        self.india_bounds = {
            'north': 37.6,
            'south': 6.4,
            'east': 97.25,
            'west': 68.7
        }
    
    def get_india_floods(self, days_back: int = 30) -> List[Dict]:
        """Get flood events in India from GDACS"""
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            params = {
                'eventtype': 'FL',  # FL = Flood
                'alertlevel': '',   # All alert levels
                'country': 'IND',   # India
                'fromdate': start_date.strftime('%Y-%m-%d'),
                'todate': end_date.strftime('%Y-%m-%d'),
                'format': 'json'
            }
            
            headers = {
                'User-Agent': 'DisasterManagement/1.0 (Educational Purpose)'
            }
            
            response = requests.get(self.base_url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return self._process_gdacs_response(data)
            
        except requests.RequestException as e:
            logger.error(f"GDACS API error: {e}")
            return []
        except Exception as e:
            logger.error(f"GDACS processing error: {e}")
            return []
    
    def _process_gdacs_response(self, data: Dict) -> List[Dict]:
        """Process GDACS API response into standardized format"""
        events = []
        
        if not data or 'features' not in data:
            logger.info("No GDACS flood events found")
            return events
        
        for feature in data['features']:
            try:
                properties = feature.get('properties', {})
                geometry = feature.get('geometry', {})
                
                # Extract coordinates
                coordinates = geometry.get('coordinates', [])
                if not coordinates:
                    continue
                
                # Create event data
                event = {
                    'platform': 'gdacs',
                    'post_id': f"gdacs_{properties.get('eventid', 'unknown')}",
                    'content': self._create_content_from_gdacs(properties),
                    'author_username': 'GDACS',
                    'author_display_name': 'Global Disaster Alert and Coordination System',
                    'post_url': f"https://www.gdacs.org/Alerts/default.aspx?eventid={properties.get('eventid', '')}",
                    'created_at': self._parse_gdacs_date(properties.get('fromdate')),
                    'engagement_metrics': {},
                    'location_data': {
                        'country': properties.get('country', ''),
                        'coordinates': coordinates,
                        'bbox': geometry.get('bbox', [])
                    },
                    'media_urls': [],
                    'flood_relevant': True,
                    'confidence_score': self._calculate_gdacs_confidence(properties),
                    'severity_level': self._map_gdacs_severity(properties.get('alertlevel', '')),
                    'extracted_locations': [properties.get('country', 'India')],
                    'gdacs_data': properties  # Store original GDACS data
                }
                
                events.append(event)
                
            except Exception as e:
                logger.error(f"Error processing GDACS event: {e}")
                continue
        
        logger.info(f"Processed {len(events)} GDACS flood events for India")
        return events
    
    def _create_content_from_gdacs(self, properties: Dict) -> str:
        """Create readable content from GDACS properties"""
        event_name = properties.get('eventname', 'Flood Event')
        country = properties.get('country', 'India')
        alert_level = properties.get('alertlevel', 'Unknown')
        
        # Get population affected if available
        population = properties.get('population', {})
        pop_text = ""
        if isinstance(population, dict):
            total_pop = population.get('value', 0)
            if total_pop > 0:
                pop_text = f" Approximately {total_pop:,} people may be affected."
        
        # Get severity info
        severity_info = ""
        if alert_level:
            severity_info = f" Alert Level: {alert_level}."
        
        content = f"GDACS Official Alert: {event_name} in {country}.{severity_info}{pop_text}"
        
        # Add episode info if available
        episode = properties.get('episodeid')
        if episode:
            content += f" Episode ID: {episode}."
        
        return content
    
    def _parse_gdacs_date(self, date_str: str) -> datetime:
        """Parse GDACS date string"""
        try:
            if not date_str:
                return datetime.now()
            
            # GDACS typically uses format: 2024-09-13T00:00:00Z
            if 'T' in date_str:
                return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                return datetime.strptime(date_str, '%Y-%m-%d')
        except:
            return datetime.now()
    
    def _calculate_gdacs_confidence(self, properties: Dict) -> float:
        """Calculate confidence score for GDACS events"""
        # GDACS is official, so high base confidence
        base_confidence = 0.9
        
        # Boost based on alert level
        alert_level = properties.get('alertlevel', '').upper()
        if alert_level == 'RED':
            return 1.0
        elif alert_level == 'ORANGE':
            return 0.95
        elif alert_level == 'GREEN':
            return 0.85
        
        return base_confidence
    
    def _map_gdacs_severity(self, alert_level: str) -> str:
        """Map GDACS alert levels to our severity levels"""
        alert_level = alert_level.upper() if alert_level else ''
        
        if alert_level == 'RED':
            return 'high'
        elif alert_level == 'ORANGE':
            return 'medium'
        elif alert_level == 'GREEN':
            return 'low'
        else:
            return 'medium'


class IndiaWeatherScraper:
    """India-specific weather and flood data scraper"""
    
    def __init__(self):
        self.imd_url = "https://mausam.imd.gov.in"  # India Meteorological Department
        self.india_cities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
            'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
            'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara',
            'Ghaziabad', 'Ludhiana', 'Coimbatore', 'Kochi', 'Madurai', 'Surat'
        ]
    
    def get_current_weather_alerts(self) -> List[Dict]:
        """Get current weather alerts for India"""
        # This would integrate with IMD or other Indian weather services
        # For now, return empty list - can be implemented later
        logger.info("India weather alerts scraper ready for implementation")
        return []


class IndiaNewsFloodScraper:
    """Enhanced news scraper focused on India floods"""
    
    def __init__(self):
        self.api_key = os.getenv('NEWS_API_KEY')
        self.base_url = "https://newsapi.org/v2/everything"
        self.india_sources = [
            'the-times-of-india', 'the-hindu', 'economic-times',
            'ndtv', 'india-today', 'zee-news'
        ]
    
    def get_india_flood_news(self, max_results: int = 50) -> List[Dict]:
        """Get flood news specifically for India"""
        if not self.api_key:
            logger.warning("News API key not configured")
            return []
        
        # India-specific flood keywords
        query = (
            "(flood OR flooding OR waterlogging OR heavy rain OR monsoon OR cloudburst) AND "
            "(India OR Mumbai OR Delhi OR Chennai OR Kolkata OR Hyderabad OR Bangalore OR "
            "Maharashtra OR Kerala OR Tamil Nadu OR West Bengal OR Telangana OR Karnataka OR "
            "Assam OR Bihar OR Uttar Pradesh OR Gujarat OR Rajasthan)"
        )
        
        params = {
            'q': query,
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': min(max_results, 100),
            'from': (datetime.now() - timedelta(days=7)).isoformat(),  # Last 7 days
            'apiKey': self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return self._process_india_news_response(data)
            
        except requests.RequestException as e:
            logger.error(f"India News API error: {e}")
            return []
    
    def _process_india_news_response(self, data: Dict) -> List[Dict]:
        """Process news API response with India focus"""
        posts = []
        
        if 'articles' not in data:
            return posts
        
        for article in data['articles']:
            # Check if article is India-related
            content = f"{article.get('title', '')} {article.get('description', '')}"
            if not self._is_india_related(content):
                continue
            
            posts.append({
                'platform': 'news',
                'post_id': article.get('url', '').split('/')[-1] or str(hash(article.get('title', ''))),
                'content': f"{article.get('title', '')} {article.get('description', '')}",
                'author_username': article.get('source', {}).get('name', ''),
                'author_display_name': article.get('author', ''),
                'post_url': article.get('url', ''),
                'created_at': datetime.fromisoformat(article.get('publishedAt', '').replace('Z', '+00:00')),
                'engagement_metrics': {},
                'location_data': {'country': 'India'},
                'media_urls': [article.get('urlToImage', '')] if article.get('urlToImage') else [],
                'flood_relevant': True,
                'confidence_score': 0.8,  # News sources are reliable
                'severity_level': 'medium',
                'extracted_locations': self._extract_indian_locations(content)
            })
        
        logger.info(f"Found {len(posts)} India-specific flood news articles")
        return posts
    
    def _is_india_related(self, content: str) -> bool:
        """Check if content is related to India"""
        india_keywords = [
            'india', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata',
            'maharashtra', 'kerala', 'tamil nadu', 'west bengal', 'karnataka',
            'monsoon', 'imd', 'indian meteorological', 'ndrf'
        ]
        
        content_lower = content.lower()
        return any(keyword in content_lower for keyword in india_keywords)
    
    def _extract_indian_locations(self, content: str) -> List[str]:
        """Extract Indian city/state names from content"""
        locations = []
        content_lower = content.lower()
        
        indian_locations = [
            'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata',
            'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
            'maharashtra', 'kerala', 'tamil nadu', 'west bengal', 'karnataka',
            'gujarat', 'rajasthan', 'uttar pradesh', 'bihar', 'assam'
        ]
        
        for location in indian_locations:
            if location in content_lower:
                locations.append(location.title())
        
        return list(set(locations))  # Remove duplicates


class IndiaRedditScraper:
    """Reddit scraper focused on India"""
    
    def __init__(self):
        self.india_subreddits = [
            'india', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai',
            'kolkata', 'pune', 'IndiaSpeaks', 'unitedstatesofindia',
            'IndianStreetBets', 'IndiaInvestments'  # These often have local discussions
        ]
    
    def search_india_flood_posts(self, max_results: int = 100) -> List[Dict]:
        """Search for flood-related posts in Indian subreddits"""
        posts = []
        
        # India-specific flood query
        query = "flood OR flooding OR waterlogging OR heavy rain OR monsoon OR cloudburst"
        
        for subreddit in self.india_subreddits:
            try:
                url = f"https://www.reddit.com/r/{subreddit}/search.json"
                params = {
                    'q': query,
                    'sort': 'new',
                    'limit': min(10, max_results // len(self.india_subreddits)),
                    't': 'week',  # Last week
                    'restrict_sr': 'true'  # Restrict to this subreddit
                }
                
                headers = {
                    'User-Agent': 'FloodMonitor/1.0 (Educational Purpose)'
                }
                
                response = requests.get(url, params=params, headers=headers, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                subreddit_posts = self._process_reddit_response(data, subreddit)
                posts.extend(subreddit_posts)
                
            except requests.RequestException as e:
                logger.error(f"Reddit API error for r/{subreddit}: {e}")
                continue
        
        logger.info(f"Found {len(posts)} India-specific Reddit flood posts")
        return posts[:max_results]
    
    def _process_reddit_response(self, data: Dict, subreddit: str) -> List[Dict]:
        """Process Reddit API response"""
        posts = []
        
        if 'data' not in data or 'children' not in data['data']:
            return posts
        
        for post_data in data['data']['children']:
            post = post_data['data']
            
            posts.append({
                'platform': 'reddit',
                'post_id': post['id'],
                'content': f"{post.get('title', '')} {post.get('selftext', '')}",
                'author_username': post.get('author', ''),
                'author_display_name': post.get('author', ''),
                'post_url': f"https://reddit.com{post.get('permalink', '')}",
                'created_at': datetime.fromtimestamp(post.get('created_utc', 0)),
                'engagement_metrics': {
                    'upvotes': post.get('ups', 0),
                    'downvotes': post.get('downs', 0),
                    'comments': post.get('num_comments', 0),
                    'score': post.get('score', 0)
                },
                'location_data': {
                    'subreddit': subreddit,
                    'flair': post.get('link_flair_text', ''),
                    'country': 'India'
                },
                'media_urls': [post.get('url', '')] if post.get('url') else [],
                'flood_relevant': True,
                'confidence_score': 0.6,  # Reddit posts are less reliable than news
                'severity_level': 'medium',
                'extracted_locations': [subreddit.title()]
            })
        
        return posts
