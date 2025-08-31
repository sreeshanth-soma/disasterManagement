# Google Maps Setup Guide

## 🗺️ Setting up Google Maps  for the Frontend

### 1. Get Google Maps  Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following s:
   - **Maps JavaScript **
   - **Geocoding ** (optional, for address lookups)
4. Go to **Credentials** > **Create Credentials** > ** Key**
5. Copy your  key

### 2. Configure  Key Restrictions (Recommended)

1. Click on your  key in the credentials list
2. Under **Application restrictions**:
   - Select "HTTP referrers (web sites)"
   - Add: `http://localhost:*` for development
   - Add your production domain when deploying
3. Under ** restrictions**:
   - Select "Restrict key"
   - Choose only the s you enabled above

### 3. Add  Key to Your Project

1. In the frontend directory, create a `.env` file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit the `.env` file and add your  key:
   ```env
   VITE_GOOGLE_MAPS__KEY=your_actual__key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### 4. Security Best Practices

- **Never commit** your `.env` file to git (it's already in .gitignore)
- Use ** key restrictions** to limit usage
- Monitor your ** usage** in Google Cloud Console
- Consider setting up **billing alerts**

### 5. Alternative: Use Without Google Maps

If you don't want to set up Google Maps, the app will show a warning message and you can still:
- View data in the Dashboard
- See statistics and reports
- Use the search functionality
- Navigate between sections

The maps will simply show a warning message instead of the interactive map.

## 🚨 Important Notes

- Google Maps has a **free tier** with generous limits for development
- The app gracefully handles missing API keys
- All other features work without maps
- You can add the API key later and restart the app

## ⚠️ Google Maps API Deprecation Notice

As of February 2024, `google.maps.Marker` is deprecated in favor of `google.maps.marker.AdvancedMarkerElement`. The current implementation uses the classic Marker API which:

- **Still works and is supported** for at least 12 months
- **Receives bug fixes** for major regressions
- **Will receive 12+ months notice** before discontinuation

### Future Migration
When `@react-google-maps/api` adds support for AdvancedMarkerElement, consider migrating:
- Better performance and customization
- Modern design and accessibility features
- Long-term support from Google

For now, the deprecation warning can be safely ignored as functionality remains intact.
