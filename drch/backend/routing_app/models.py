from django.contrib.gis.db import models
from django.utils import timezone


class RoadSegment(models.Model):
    STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('flooded', 'Flooded'),
        ('blocked', 'Blocked'),
    ]
    
    osm_id = models.BigIntegerField()
    geom = models.LineStringField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='normal')
    last_checked = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Road Segment {self.osm_id} - {self.status}"
    
    class Meta:
        db_table = 'road_segments'
