from django.contrib.gis.db import models
from django.utils import timezone

class VictimReport(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('triaged', 'Triaged'),
        ('rescued', 'Rescued'),
    ]
    
    phone = models.CharField(max_length=20)
    location = models.PointField()
    address = models.CharField(max_length=255, blank=True, null=True)  # New address field
    needs = models.JSONField(default=dict)
    priority = models.IntegerField(default=1)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='new')
    reported_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Report #{self.id} - {self.phone} ({self.status})"
    
    class Meta:
        ordering = ['-reported_at']
