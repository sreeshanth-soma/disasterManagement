    DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

import os

# GDAL Configuration (for macOS Homebrew, adjust path if necessary)
if os.path.exists('/opt/homebrew/opt/gdal/lib/libgdal.dylib'):
    GDAL_LIBRARY_PATH = '/opt/homebrew/opt/gdal/lib/libgdal.dylib'

# Celery Configuration
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
