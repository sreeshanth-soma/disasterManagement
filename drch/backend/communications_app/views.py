import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from rest_framework import viewsets
from rest_framework_gis.filters import InBBoxFilter
from .models import VictimReport
from .serializers import VictimReportSerializer

class VictimReportViewSet(viewsets.ModelViewSet):
    queryset = VictimReport.objects.all()
    serializer_class = VictimReportSerializer
    filter_backends = [InBBoxFilter]
    bbox_filter_field = 'location'

    def perform_create(self, serializer):
        instance = serializer.save()
        self._send_websocket_update(instance, 'created')

    def perform_update(self, serializer):
        instance = serializer.save()
        self._send_websocket_update(instance, 'updated')

    def perform_destroy(self, instance):
        report_id = instance.id
        instance.delete()
        self._send_websocket_update({'id': report_id}, 'deleted')

    def _send_websocket_update(self, instance, action):
        channel_layer = get_channel_layer()
        if channel_layer:
            message = {
                'action': action,
                'data': self.serializer_class(instance).data if action != 'deleted' else instance
            }
            async_to_sync(channel_layer.group_send)(
                'reports',
                {
                    'type': 'report_message',
                    'message': message
                }
            )
