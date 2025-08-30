from django.contrib.gis.db import models
from django.db.models import JSONField
from django.utils import timezone


class VictimReport(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('triaged', 'Triaged'),
        ('rescued', 'Rescued'),
    ]
    
    phone = models.CharField(max_length=20)
    location = models.PointField()
    needs = JSONField(default=dict)
    priority = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    reported_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Victim Report {self.phone} - {self.status}"
    
    class Meta:
        db_table = 'victim_reports'