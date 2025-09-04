from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import FloodEvent, SocialMediaPost


class FloodEventSerializer(GeoFeatureModelSerializer):
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_level_display', read_only=True)
    
    class Meta:
        model = FloodEvent
        geo_field = 'geom'
        fields = [
            'id', 'name', 'geom', 'confidence', 'detected_at', 'source', 'source_display',
            'social_media_source', 'original_post_id', 'post_content', 'author_username',
            'engagement_score', 'post_url', 'location_description', 'severity_level',
            'severity_display', 'verified'
        ]
        read_only_fields = ['id', 'detected_at']


class SocialMediaPostSerializer(serializers.ModelSerializer):
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)
    
    class Meta:
        model = SocialMediaPost
        fields = [
            'id', 'platform', 'platform_display', 'post_id', 'content',
            'author_username', 'author_display_name', 'post_url', 'created_at',
            'engagement_metrics', 'location_data', 'media_urls', 'processed',
            'flood_relevant', 'confidence_score', 'created_at_db'
        ]
        read_only_fields = ['id', 'created_at_db']
