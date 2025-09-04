from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_gis.filters import InBBoxFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import FloodEvent, SocialMediaPost
from .serializers import FloodEventSerializer, SocialMediaPostSerializer
from .tasks import scrape_social_media


class FloodEventViewSet(viewsets.ModelViewSet):
    queryset = FloodEvent.objects.all()
    serializer_class = FloodEventSerializer
    filter_backends = [InBBoxFilter, DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    bbox_filter_field = 'geom'
    filterset_fields = ['source', 'severity_level', 'verified', 'social_media_source']
    search_fields = ['name', 'location_description', 'post_content', 'author_username']
    ordering_fields = ['detected_at', 'confidence', 'engagement_score']
    ordering = ['-detected_at']
    
    @action(detail=False, methods=['post'])
    def trigger_social_media_scrape(self, request):
        """Manually trigger social media scraping"""
        try:
            task = scrape_social_media.delay()
            return Response({
                'message': 'Social media scraping started',
                'task_id': task.id
            }, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({
                'error': f'Failed to start scraping: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get flood event statistics"""
        total_events = self.get_queryset().count()
        social_media_events = self.get_queryset().filter(source='social_media').count()
        verified_events = self.get_queryset().filter(verified=True).count()
        high_confidence_events = self.get_queryset().filter(confidence__gte=0.8).count()
        
        return Response({
            'total_events': total_events,
            'social_media_events': social_media_events,
            'verified_events': verified_events,
            'high_confidence_events': high_confidence_events,
            'verification_rate': verified_events / total_events if total_events > 0 else 0
        })


class SocialMediaPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SocialMediaPost.objects.all()
    serializer_class = SocialMediaPostSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['platform', 'flood_relevant', 'processed']
    search_fields = ['content', 'author_username', 'author_display_name']
    ordering_fields = ['created_at', 'confidence_score']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def flood_relevant(self, request):
        """Get only flood-relevant posts"""
        queryset = self.get_queryset().filter(flood_relevant=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get social media post statistics"""
        total_posts = self.get_queryset().count()
        flood_relevant_posts = self.get_queryset().filter(flood_relevant=True).count()
        processed_posts = self.get_queryset().filter(processed=True).count()
        
        platform_stats = {}
        for platform in ['twitter', 'youtube', 'instagram', 'facebook']:
            count = self.get_queryset().filter(platform=platform).count()
            platform_stats[platform] = count
        
        return Response({
            'total_posts': total_posts,
            'flood_relevant_posts': flood_relevant_posts,
            'processed_posts': processed_posts,
            'platform_stats': platform_stats,
            'relevance_rate': flood_relevant_posts / total_posts if total_posts > 0 else 0
        })
