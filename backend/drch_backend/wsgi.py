import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drch_backend.settings')

application = get_wsgi_application()

# If you're running Daphne or Hypercorn, your ASGI application will be used
# instead of this WSGI one for WebSocket connections.
# The ASGI_APPLICATION setting points to the entry point for ASGI.
