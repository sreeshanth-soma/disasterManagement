import axios from 'axios';
import type {
  GeoJSONFeatureCollection,
  GeoJSONFeature,
  FloodEventProperties,
  RoadSegmentProperties,
  VictimReportProperties,
  GeoJSONPolygon,
  GeoJSONLineString,
  GeoJSONPoint,
  DashboardStats
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to parse geometry string to GeoJSON
const parseGeometry = (geometryString: string): GeoJSONPoint | GeoJSONLineString | GeoJSONPolygon | null => {
  if (!geometryString || typeof geometryString !== 'string') {
    return null;
  }

  // Parse POINT geometry: "SRID=4326;POINT (-74.003 40.714)"
  const pointMatch = geometryString.match(/POINT \(([^)]+)\)/);
  if (pointMatch) {
    const coords = pointMatch[1].split(' ').map(Number);
    return {
      type: 'Point',
      coordinates: [coords[0], coords[1]] // [longitude, latitude]
    } as GeoJSONPoint;
  }

  // Parse LINESTRING geometry: "SRID=4326;LINESTRING (-74.003 40.714, -74.004 40.715)"
  const lineMatch = geometryString.match(/LINESTRING \(([^)]+)\)/);
  if (lineMatch) {
    const coordPairs = lineMatch[1].split(', ');
    const coordinates = coordPairs.map(pair => {
      const coords = pair.split(' ').map(Number);
      return [coords[0], coords[1]]; // [longitude, latitude]
    });
    return {
      type: 'LineString',
      coordinates: coordinates
    } as GeoJSONLineString;
  }

  // Parse POLYGON geometry: "SRID=4326;POLYGON ((-74.003 40.714, ...))"
  const polygonMatch = geometryString.match(/POLYGON \(\(([^)]+)\)\)/);
  if (polygonMatch) {
    const coordPairs = polygonMatch[1].split(', ');
    const coordinates = coordPairs.map(pair => {
      const coords = pair.split(' ').map(Number);
      return [coords[0], coords[1]]; // [longitude, latitude]
    });
    return {
      type: 'Polygon',
      coordinates: [coordinates] // Array of linear rings
    } as GeoJSONPolygon;
  }

  return null;
};

const extractFeatures = <T, G>(response: { data: { results: { features: any[] } } }): GeoJSONFeature<T, G>[] => {
  if (!response || !response.data || !response.data.results || !Array.isArray(response.data.results.features)) {
    console.error("API Error: Unexpected response format from backend", response);
    return [];
  }
  
  return response.data.results.features.map(feature => ({
    ...feature,
    geometry: parseGeometry(feature.geometry) || feature.geometry
  }));
};

export const floodEventApi = {
  getAll: async () => {
    const response = await api.get<{ results: { features: any[] } }>('/flood-events/');
    return extractFeatures(response);
  },
  getById: (id: number) => api.get<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon>>(`/flood-events/${id}/`),
  create: (data: Partial<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon>>) => api.post<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon>>('/flood-events/', data),
  update: (id: number, data: Partial<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon>>) => api.put<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon>>(`/flood-events/${id}/`, data),
  delete: (id: number) => api.delete(`/flood-events/${id}/`),
  triggerScrape: () => api.post('/flood-events/trigger_social_media_scrape/'),
  getStats: () => api.get('/flood-events/stats/'),
};

export const roadSegmentApi = {
  getAll: async () => {
    const response = await api.get<{ results: { features: any[] } }>('/road-segments/');
    return extractFeatures(response);
  },
  getById: (id: number) => api.get<GeoJSONFeature<RoadSegmentProperties, GeoJSONLineString>>(`/road-segments/${id}/`),
  create: (data: Partial<GeoJSONFeature<RoadSegmentProperties, GeoJSONLineString>>) => api.post<GeoJSONFeature<RoadSegmentProperties, GeoJSONLineString>>('/road-segments/', data),
  update: (id: number, data: Partial<GeoJSONFeature<RoadSegmentProperties, GeoJSONLineString>>) => api.put<GeoJSONFeature<RoadSegmentProperties, GeoJSONLineString>>(`/road-segments/${id}/`, data),
  delete: (id: number) => api.delete(`/road-segments/${id}/`),
};

export const victimReportApi = {
  getAll: async () => {
    const response = await api.get<{ results: { features: any[] } }>('/victim-reports/');
    return extractFeatures(response);
  },
  getById: (id: number) => api.get<GeoJSONFeature<VictimReportProperties, GeoJSONPoint>>(`/victim-reports/${id}/`),
  create: (data: Partial<GeoJSONFeature<VictimReportProperties, GeoJSONPoint>>) => api.post<GeoJSONFeature<VictimReportProperties, GeoJSONPoint>>('/victim-reports/', data),
  update: (id: number, data: Partial<GeoJSONFeature<VictimReportProperties, GeoJSONPoint>>) => api.put<GeoJSONFeature<VictimReportProperties, GeoJSONPoint>>(`/victim-reports/${id}/`, data),
  delete: (id: number) => api.delete(`/victim-reports/${id}/`),
};

export const socialMediaApi = {
  // For now, get social media posts from flood events API
  getAll: async () => {
    const response = await api.get('/flood-events/');
    // Filter for social media posts
    const allEvents = extractFeatures(response);
    return allEvents.filter(event => event.properties.source === 'social_media');
  },
  getFloodRelevant: async () => {
    const response = await api.get('/flood-events/');
    const allEvents = extractFeatures(response);
    return allEvents.filter(event => event.properties.source === 'social_media');
  },
  getStats: async () => {
    const response = await api.get('/flood-events/');
    const allEvents = extractFeatures(response);
    const socialMediaEvents = allEvents.filter(event => event.properties.source === 'social_media');
    return {
      data: {
        total_posts: socialMediaEvents.length,
        flood_relevant_posts: socialMediaEvents.length,
        processed_posts: socialMediaEvents.length,
        platform_stats: {
          news: socialMediaEvents.filter(e => e.properties.social_media_source === 'news').length,
          reddit: socialMediaEvents.filter(e => e.properties.social_media_source === 'reddit').length,
        },
        relevance_rate: 1.0
      }
    };
  },
  getById: (id: number) => api.get(`/flood-events/${id}/`),
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    console.log("Fetching dashboard stats...");
    try {
      const [floodsResponse, roadsResponse, victimsResponse] = await Promise.all([
        floodEventApi.getAll(),
        roadSegmentApi.getAll(),
        victimReportApi.getAll(),
      ]);
      
      console.log("Raw API responses:", { floodsResponse, roadsResponse, victimsResponse });
      
      return {
        activeFloodEvents: floodsResponse.length,
        blockedRoads: roadsResponse.filter(road => road.properties.status === 'blocked' || road.properties.status === 'flooded').length,
        pendingReports: victimsResponse.filter(report => report.properties.status === 'new').length,
        rescuedVictims: victimsResponse.filter(report => report.properties.status === 'rescued').length,
      };
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      throw error;
    }
  },
};

export default api;
