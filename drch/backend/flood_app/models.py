from django.contrib.gis.db import models
from django.utils import timezone


class FloodEvent(models.Model):
    SOURCE_CHOICES = [
        ('sar_ml', 'SAR ML Detection'),
        ('social_media', 'Social Media'),
        ('weather_api', 'Weather API'),
        ('gdacs', 'GDACS'),
        ('manual', 'Manual Report'),
    ]
    
    name = models.CharField(max_length=255)
    geom = models.PolygonField()
    confidence = models.FloatField()
    detected_at = models.DateTimeField(default=timezone.now)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='manual')
    
    # Social media specific fields
    social_media_source = models.CharField(max_length=50, blank=True, null=True)  # 'twitter', 'youtube'
    original_post_id = models.CharField(max_length=255, blank=True, null=True)
    post_content = models.TextField(blank=True, null=True)
    author_username = models.CharField(max_length=255, blank=True, null=True)
    engagement_score = models.FloatField(default=0.0)  # likes, retweets, views, etc.
    post_url = models.URLField(blank=True, null=True)
    
    # Additional metadata
    location_description = models.TextField(blank=True, null=True)
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    severity_level = models.CharField(max_length=20, choices=SEVERITY_CHOICES, blank=True, null=True)
    verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'flood_events'
        ordering = ['-detected_at']


class SocialMediaPost(models.Model):
    """Raw social media posts for processing"""
    PLATFORM_CHOICES = [
        ('reddit', 'Reddit'),
        ('youtube', 'YouTube'),
        ('news', 'News API'),
        ('telegram', 'Telegram'),
        ('twitter', 'Twitter/X'),  # Keep for future paid tier
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
    ]
    
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    post_id = models.CharField(max_length=255, unique=True)
    content = models.TextField()
    author_username = models.CharField(max_length=255)
    author_display_name = models.CharField(max_length=255, blank=True, null=True)
    post_url = models.URLField()
    created_at = models.DateTimeField()
    engagement_metrics = models.JSONField(default=dict)  # likes, retweets, views, etc.
    location_data = models.JSONField(default=dict, blank=True, null=True)
    media_urls = models.JSONField(default=list, blank=True)
    processed = models.BooleanField(default=False)
    flood_relevant = models.BooleanField(default=False)
    confidence_score = models.FloatField(default=0.0)
    created_at_db = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.platform}: {self.author_username} - {self.post_id}"
    
    class Meta:
        db_table = 'social_media_posts'
        ordering = ['-created_at']
