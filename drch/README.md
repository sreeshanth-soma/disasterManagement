# Disaster Response Coordination Hub

This project aims to build a comprehensive platform for disaster response coordination, integrating various modules for flood detection, rescue routing, and communication.

## Getting Started

To set up the database and Redis for the project, navigate to the `database/` directory and run:

```bash
docker-compose up -d
```

### Django Database Configuration

To connect Django to the PostGIS database, use the following settings in your `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'drch_db',
        'USER': 'drch_user',
        'PASSWORD': 'drch_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Geospatial Libraries (GDAL)

For macOS users, you might need to install GDAL via Homebrew:

```bash
brew install gdal
```

If you encounter issues, you might need to set `GDAL_LIBRARY_PATH` in your environment or `settings.py`.

## Running with Docker Compose

To run the backend Django application, database (PostGIS), Redis, and Celery services using Docker Compose, navigate to the `drch/database/` directory and run:

```bash
docker-compose up --build -d
```

This will build the Docker images and start all the services in the background.

### Accessing the Django Application

The Django application will be accessible at `http://localhost:8000`.
