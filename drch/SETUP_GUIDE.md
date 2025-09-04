# 🚀 Setup Guide - Get Your FREE API Keys

## Step 1: YouTube Data API Key (FREE)

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create a New Project (or use existing)
- Click "Select a project" → "New Project"
- Name: "Flood Monitor" (or any name you like)
- Click "Create"

### 1.3 Enable YouTube Data API v3
- Go to "APIs & Services" → "Library"
- Search for "YouTube Data API v3"
- Click on it → "Enable"

### 1.4 Create API Key
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "API Key"
- Copy the API key (starts with "AIza...")

### 1.5 (Optional) Restrict the API Key
- Click on your API key to edit
- Under "API restrictions" → "Restrict key"
- Select "YouTube Data API v3"
- Click "Save"

## Step 2: News API Key (FREE)

### 2.1 Go to News API
- Visit: https://newsapi.org/
- Click "Get API Key"

### 2.2 Sign Up
- Enter your email
- Choose a password
- Click "Create Account"

### 2.3 Verify Email
- Check your email for verification link
- Click the link to verify

### 2.4 Get Your API Key
- After verification, you'll see your API key
- Copy it (starts with letters/numbers)

## Step 3: Add Keys to Your Project

### 3.1 Create Environment File
```bash
# In your backend directory
cp env.example .env
```

### 3.2 Edit .env File
```bash
# Add your API keys
YOUTUBE_API_KEY=AIzaSyC...your_youtube_key_here
NEWS_API_KEY=your_news_api_key_here

# Other settings (keep defaults for now)
DATABASE_URL=postgresql://username:password@localhost:5432/disaster_management
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Step 4: Test Your Setup

### 4.1 Install Dependencies
```bash
# Make sure you're in the backend directory
cd /Users/somasreeshanth/Desktop/disasterManagement/drch/backend

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4.2 Run Migrations
```bash
python manage.py migrate
```

### 4.3 Test the Scrapers
```bash
python manage.py shell
```

Then in the Python shell:
```python
from flood_app.services.social_media_scraper import SocialMediaScraper
scraper = SocialMediaScraper()
posts = scraper.scrape_all_platforms()
print(f"Found {len(posts)} flood-related posts!")
```

## Step 5: Start the System

### 5.1 Start Django Server
```bash
python manage.py runserver
```

### 5.2 Start Celery Worker (in another terminal)
```bash
# In a new terminal, go to backend directory
cd /Users/somasreeshanth/Desktop/disasterManagement/drch/backend
source .venv/bin/activate

# Start Celery worker
celery -A drch_backend worker --loglevel=info
```

### 5.3 Start Celery Beat (in another terminal)
```bash
# In a third terminal, go to backend directory
cd /Users/somasreeshanth/Desktop/disasterManagement/drch/backend
source .venv/bin/activate

# Start Celery beat for scheduled tasks
celery -A drch_backend beat --loglevel=info
```

## Step 6: Set Up Periodic Tasks
```bash
python manage.py setup_social_media
```

## Step 7: Start Frontend
```bash
# In a new terminal, go to frontend directory
cd /Users/somasreeshanth/Desktop/disasterManagement/drch/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎉 You're Done!

Your flood monitoring system should now be running with:
- ✅ Reddit scraping (works immediately)
- ✅ YouTube scraping (with your API key)
- ✅ News API scraping (with your API key)
- ✅ Automatic scraping every 15 minutes
- ✅ Frontend displaying social media alerts

## 🔍 Check Your Results

1. Open your browser to: http://localhost:3000
2. Click on "Social Media Alerts" tab
3. You should see flood-related posts from Reddit, YouTube, and news sources!

## 🆘 Troubleshooting

### If you get API errors:
- Check your API keys are correct
- Make sure you've enabled the YouTube Data API
- Verify your News API account is activated

### If you get database errors:
- Make sure PostgreSQL is running
- Check your DATABASE_URL in .env file

### If you get Celery errors:
- Make sure Redis is running
- Check your CELERY_BROKER_URL in .env file
