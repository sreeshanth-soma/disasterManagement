from django.contrib.gis.db import models
from django.utils import timezone


class FloodEvent(models.Model):
    name = models.CharField(max_length=255)
    geom = models.PolygonField()
    confidence = models.FloatField()
    detected_at = models.DateTimeField(default=timezone.now)
    source = models.CharField(max_length=255)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'flood_events'