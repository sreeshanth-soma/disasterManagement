import axios from 'axios';
import type {
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  ApiResponse,
  FloodEventProperties,
  RoadSegmentProperties,
  VictimReportProperties,
  DashboardStats,
} from '../types';

// Configure axios with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to safely extract features and log if unexpected
const getFeatures = <T>(response: any, endpoint: string): GeoJSONFeature<T>[] => {
  // Handle Django REST Framework paginated response
  if (response?.data?.results?.features && Array.isArray(response.data.results.features)) {
    return response.data.results.features as GeoJSONFeature<T>[];
  }
  // Handle direct GeoJSON response
  if (response?.data?.features && Array.isArray(response.data.features)) {
    return response.data.features as GeoJSONFeature<T>[];
  }
  console.error(`API Error: Unexpected response format from ${endpoint}`, response?.data);
  return [];
};

// Helper to extract GeoJSON data from API response
export const extractGeoJSONData = <T>(response: any): GeoJSONFeatureCollection<T> | null => {
  // Handle Django REST Framework paginated response
  if (response?.data?.results && typeof response.data.results === 'object') {
    return response.data.results as GeoJSONFeatureCollection<T>;
  }
  // Handle direct GeoJSON response
  if (response?.data && typeof response.data === 'object') {
    return response.data as GeoJSONFeatureCollection<T>;
  }
  return null;
};

// Flood Events API
export const floodEventApi = {
  getAll: () => api.get<ApiResponse<GeoJSONFeatureCollection<FloodEventProperties>>>('/flood-events/'),
  getById: (id: number) => api.get<GeoJSONFeature<FloodEventProperties>>(`/flood-events/${id}/`),
  create: (data: Partial<FloodEventProperties & { geom: any }>) => api.post<GeoJSONFeature<FloodEventProperties>>('/flood-events/', data),
  update: (id: number, data: Partial<FloodEventProperties & { geom: any }>) => api.put<GeoJSONFeature<FloodEventProperties>>(`/flood-events/${id}/`, data),
  delete: (id: number) => api.delete(`/flood-events/${id}/`),
};

// Road Segments API
export const roadSegmentApi = {
  getAll: () => api.get<ApiResponse<GeoJSONFeatureCollection<RoadSegmentProperties>>>('/road-segments/'),
  getById: (id: number) => api.get<GeoJSONFeature<RoadSegmentProperties>>(`/road-segments/${id}/`),
  create: (data: Partial<RoadSegmentProperties & { geom: any }>) => api.post<GeoJSONFeature<RoadSegmentProperties>>('/road-segments/', data),
  update: (id: number, data: Partial<RoadSegmentProperties & { geom: any }>) => api.put<GeoJSONFeature<RoadSegmentProperties>>(`/road-segments/${id}/`, data),
  delete: (id: number) => api.delete(`/road-segments/${id}/`),
};

// Victim Reports API
export const victimReportApi = {
  getAll: () => api.get<ApiResponse<GeoJSONFeatureCollection<VictimReportProperties>>>('/victim-reports/'),
  getById: (id: number) => api.get<GeoJSONFeature<VictimReportProperties>>(`/victim-reports/${id}/`),
  create: (data: Partial<VictimReportProperties & { location: any }>) => api.post<GeoJSONFeature<VictimReportProperties>>('/victim-reports/', data),
  update: (id: number, data: Partial<VictimReportProperties & { location: any }>) => api.put<GeoJSONFeature<VictimReportProperties>>(`/victim-reports/${id}/`, data),
  delete: (id: number) => api.delete(`/victim-reports/${id}/`),
};

// Dashboard stats
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

      const floodFeatures = getFeatures<FloodEventProperties>(floodsResponse, '/flood-events/');
      const roadFeatures = getFeatures<RoadSegmentProperties>(roadsResponse, '/road-segments/');
      const victimFeatures = getFeatures<VictimReportProperties>(victimsResponse, '/victim-reports/');

      const floodEvents = floodFeatures.map(f => ({ id: f.id, ...f.properties, geom: f.geometry }));
      const roadSegments = roadFeatures.map(f => ({ id: f.id, ...f.properties, geom: f.geometry }));
      const victimReports = victimFeatures.map(f => ({ id: f.id, ...f.properties, location: f.geometry }));

      return {
        activeFloodEvents: floodEvents.length,
        blockedRoads: roadSegments.filter(road => road.status === 'blocked' || road.status === 'flooded').length,
        pendingReports: victimReports.filter(report => report.status === 'new').length,
        rescuedVictims: victimReports.filter(report => report.status === 'rescued').length,
      };
    } catch (error) {
      console.error("Error in getStats:", error);
      throw error; // Re-throw to be caught by the component's error handling
    }
  },
};

export default api;
