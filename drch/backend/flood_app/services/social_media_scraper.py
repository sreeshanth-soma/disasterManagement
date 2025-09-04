import os
import re
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import requests
from django.conf import settings
from django.utils import timezone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class FloodKeywordDetector:
    """NLP-based flood detection from social media content"""
    
    def __init__(self):
        # Enhanced flood-related keywords and phrases
        self.flood_keywords = [
            # Direct flood terms
            'flood', 'flooding', 'flooded', 'floods', 
            'inundation', 'waterlogging', 'waterlogged',
            'deluge', 'flash flood', 'urban flood', 'river flood',
            
            # Weather terms
            'heavy rain', 'heavy rainfall', 'torrential rain', 'downpour',
            'cloudburst', 'monsoon', 'storm surge', 'cyclone',
            
            # Impact terms  
            'submerged', 'underwater', 'water entering', 'water level rising',
            'drainage overflow', 'sewer overflow', 'dam burst', 'levee breach',
            'evacuation', 'rescue operations', 'stranded', 'marooned',
            
            # Infrastructure impact
            'roads flooded', 'streets flooded', 'airport flooded', 'metro flooded',
            'underpasses flooded', 'bridges closed', 'traffic disruption',
            'power outage rain', 'schools closed rain', 'offices closed rain'
        ]
        
        # Location indicators
        self.location_indicators = [
            'near', 'at', 'in', 'around', 'close to', 'beside', 'next to',
            'area', 'street', 'road', 'colony', 'society', 'building', 'mall',
            'hospital', 'school', 'office', 'station', 'bridge', 'underpass'
        ]
        
        # Severity indicators
        self.severity_keywords = {
            'high': ['severe', 'dangerous', 'emergency', 'urgent', 'critical', 'extreme', 'massive'],
            'medium': ['moderate', 'significant', 'considerable', 'noticeable'],
            'low': ['minor', 'slight', 'little', 'small']
        }
    
    def calculate_flood_relevance(self, text: str) -> Dict:
        """Calculate flood relevance score and extract information"""
        text_lower = text.lower()
        
        # Count flood keyword matches
        flood_matches = sum(1 for keyword in self.flood_keywords if keyword in text_lower)
        
        # Calculate base relevance score
        relevance_score = min(flood_matches / 3.0, 1.0)  # Normalize to 0-1
        
        # Boost score for multiple indicators
        if flood_matches > 1:
            relevance_score *= 1.2
        
        # Check for severity indicators
        severity = 'low'
        for level, keywords in self.severity_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                severity = level
                relevance_score *= 1.1
                break
        
        # Extract potential locations
        locations = self._extract_locations(text)
        
        return {
            'relevance_score': min(relevance_score, 1.0),
            'flood_matches': flood_matches,
            'severity': severity,
            'locations': locations,
            'is_flood_relevant': relevance_score > 0.3
        }
    
    def _extract_locations(self, text: str) -> List[str]:
        """Extract potential location mentions from text"""
        locations = []
        
        # Simple regex patterns for common location formats
        patterns = [
            r'(\w+\s+(?:street|road|colony|society|area|building|mall|hospital|school|office|station|bridge|underpass))',
            r'(near\s+\w+)',
            r'(at\s+\w+)',
            r'(in\s+\w+)',
            r'(around\s+\w+)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text.lower())
            locations.extend(matches)
        
        return list(set(locations))  # Remove duplicates


class RedditScraper:
    """Reddit scraping for flood-related posts - FREE and more reliable"""
    
    def __init__(self):
        self.base_url = "https://www.reddit.com/r/all/search.json"
        # Use only verified subreddits that exist
        self.subreddits = [
            'weather', 'news', 'worldnews', 'india', 'mumbai', 
            'delhi', 'bangalore', 'hyderabad', 'Chennai', 'pune'
        ]
        
    def search_flood_posts(self, query: str = None, max_results: int = 100) -> List[Dict]:
        """Search for flood-related posts on Reddit"""
        if not query:
            query = "flood OR flooding OR waterlogging OR heavy rain OR inundation"
        
        posts = []
        
        for subreddit in self.subreddits:
            try:
                url = f"https://www.reddit.com/r/{subreddit}/search.json"
                params = {
                    'q': query,
                    'sort': 'new',
                    'limit': min(25, max_results // len(self.subreddits)),
                    't': 'day'  # Last 24 hours
                }
                
                headers = {
                    'User-Agent': 'FloodMonitor/1.0 (Educational Purpose)'
                }
                
                response = requests.get(url, params=params, headers=headers)
                response.raise_for_status()
                
                data = response.json()
                subreddit_posts = self._process_reddit_response(data, subreddit)
                posts.extend(subreddit_posts)
                
            except requests.RequestException as e:
                logger.error(f"Reddit API error for r/{subreddit}: {e}")
                continue
        
        return posts[:max_results]
    
    def _process_reddit_response(self, data: Dict, subreddit: str) -> List[Dict]:
        """Process Reddit API response into standardized format"""
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
                    'flair': post.get('link_flair_text', '')
                },
                'media_urls': [post.get('url', '')] if post.get('url') else []
            })
        
        return posts


class TelegramScraper:
    """Telegram channel scraping for flood-related content - FREE"""
    
    def __init__(self):
        self.channels = [
            '@weather_india', '@disaster_alert', '@flood_monitor',
            '@hyderabad_weather', '@mumbai_weather', '@delhi_weather'
        ]
        
    def search_flood_posts(self, query: str = None, max_results: int = 50) -> List[Dict]:
        """Search for flood-related posts in Telegram channels"""
        # Note: This would require Telegram Bot API or web scraping
        # For now, return empty list - can be implemented later
        logger.info("Telegram scraping not yet implemented")
        return []


class NewsAPIScraper:
    """News API scraping for flood-related articles - FREE tier available"""
    
    def __init__(self):
        self.api_key = os.getenv('NEWS_API_KEY')
        self.base_url = "https://newsapi.org/v2/everything"
        
    def search_flood_posts(self, query: str = None, max_results: int = 50) -> List[Dict]:
        """Search for flood-related news articles"""
        if not self.api_key:
            logger.warning("News API key not configured")
            return []
        
        if not query:
            query = "flood OR flooding OR waterlogging OR heavy rain OR inundation"
        
        params = {
            'q': query,
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': min(max_results, 100),
            'apiKey': self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return self._process_news_response(data)
            
        except requests.RequestException as e:
            logger.error(f"News API error: {e}")
            return []
    
    def _process_news_response(self, data: Dict) -> List[Dict]:
        """Process News API response into standardized format"""
        posts = []
        
        if 'articles' not in data:
            return posts
        
        for article in data['articles']:
            posts.append({
                'platform': 'news',
                'post_id': article.get('url', '').split('/')[-1] or str(hash(article.get('title', ''))),
                'content': f"{article.get('title', '')} {article.get('description', '')}",
                'author_username': article.get('source', {}).get('name', ''),
                'author_display_name': article.get('author', ''),
                'post_url': article.get('url', ''),
                'created_at': datetime.fromisoformat(article.get('publishedAt', '').replace('Z', '+00:00')),
                'engagement_metrics': {},
                'location_data': {},
                'media_urls': [article.get('urlToImage', '')] if article.get('urlToImage') else []
            })
        
        return posts


class YouTubeScraper:
    """YouTube scraping for flood-related videos"""
    
    def __init__(self):
        self.api_key = os.getenv('YOUTUBE_API_KEY')
        self.api_url = "https://www.googleapis.com/youtube/v3/search"
    
    def search_flood_videos(self, query: str = None, max_results: int = 50) -> List[Dict]:
        """Search for flood-related videos on YouTube"""
        if not self.api_key:
            logger.warning("YouTube API Key not configured")
            return []
        
        if not query:
            query = "flood flooding waterlogging heavy rain inundation"
        
        params = {
            'part': 'snippet',
            'q': query,
            'type': 'video',
            'maxResults': min(max_results, 50),
            'order': 'relevance',
            'publishedAfter': (datetime.now() - timedelta(days=7)).isoformat() + 'Z',
            'key': self.api_key
        }
        
        try:
            response = requests.get(self.api_url, params=params)
            
            if response.status_code == 403:
                logger.error("YouTube API 403 Error - Please check:")
                logger.error("1. YouTube Data API v3 is enabled in Google Cloud Console")
                logger.error("2. API key has proper permissions")
                logger.error("3. Billing is enabled (required for YouTube API)")
                return []
            
            response.raise_for_status()
            data = response.json()
            return self._process_youtube_response(data)
            
        except requests.RequestException as e:
            logger.error(f"YouTube API error: {e}")
            return []
    
    def _process_youtube_response(self, data: Dict) -> List[Dict]:
        """Process YouTube API response into standardized format"""
        posts = []
        
        if 'items' not in data:
            return posts
        
        for item in data['items']:
            snippet = item['snippet']
            
            post = {
                'platform': 'youtube',
                'post_id': item['id']['videoId'],
                'content': snippet['title'] + ' ' + snippet.get('description', ''),
                'author_username': snippet['channelTitle'],
                'author_display_name': snippet['channelTitle'],
                'post_url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                'created_at': datetime.fromisoformat(snippet['publishedAt'].replace('Z', '+00:00')),
                'engagement_metrics': {},  # Would need additional API call for view counts
                'location_data': {},
                'media_urls': [snippet['thumbnails']['high']['url']]
            }
            
            posts.append(post)
        
        return posts


class SocialMediaScraper:
    """Main social media scraping orchestrator - Updated with FREE alternatives"""
    
    def __init__(self):
        self.keyword_detector = FloodKeywordDetector()
        # Use FREE alternatives instead of expensive Twitter API
        self.reddit_scraper = RedditScraper()
        self.youtube_scraper = YouTubeScraper()
        self.news_scraper = NewsAPIScraper()
        self.telegram_scraper = TelegramScraper()
    
    def scrape_all_platforms(self) -> List[Dict]:
        """Scrape all configured social media platforms"""
        all_posts = []
        
        # Scrape Reddit (FREE, no API key needed)
        try:
            reddit_posts = self.reddit_scraper.search_flood_posts()
            all_posts.extend(reddit_posts)
            logger.info(f"Scraped {len(reddit_posts)} Reddit posts")
        except Exception as e:
            logger.error(f"Reddit scraping failed: {e}")
        
        # Scrape YouTube (FREE with API key)
        try:
            youtube_posts = self.youtube_scraper.search_flood_videos()
            all_posts.extend(youtube_posts)
            logger.info(f"Scraped {len(youtube_posts)} YouTube videos")
        except Exception as e:
            logger.error(f"YouTube scraping failed: {e}")
        
        # Scrape News API (FREE tier available)
        try:
            news_posts = self.news_scraper.search_flood_posts()
            all_posts.extend(news_posts)
            logger.info(f"Scraped {len(news_posts)} news articles")
        except Exception as e:
            logger.error(f"News scraping failed: {e}")
        
        # Scrape Telegram (FREE, but requires implementation)
        try:
            telegram_posts = self.telegram_scraper.search_flood_posts()
            all_posts.extend(telegram_posts)
            logger.info(f"Scraped {len(telegram_posts)} Telegram posts")
        except Exception as e:
            logger.error(f"Telegram scraping failed: {e}")
        
        # Process posts with NLP
        processed_posts = []
        for post in all_posts:
            analysis = self.keyword_detector.calculate_flood_relevance(post['content'])
            
            if analysis['is_flood_relevant']:
                post.update({
                    'flood_relevant': True,
                    'confidence_score': analysis['relevance_score'],
                    'severity_level': analysis['severity'],
                    'extracted_locations': analysis['locations']
                })
                processed_posts.append(post)
        
        logger.info(f"Found {len(processed_posts)} flood-relevant posts out of {len(all_posts)} total")
        return processed_posts
