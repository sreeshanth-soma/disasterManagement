import axios from 'axios';
import { FloodEvent, RoadSegment, VictimReport, ApiResponse, DashboardStats } from '../types';

// Configure axios with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flood Events API
export const floodEventApi = {
  getAll: () => api.get<ApiResponse<FloodEvent>>('/flood-events/'),
  getById: (id: number) => api.get<FloodEvent>(`/flood-events/${id}/`),
  create: (data: Partial<FloodEvent>) => api.post<FloodEvent>('/flood-events/', data),
  update: (id: number, data: Partial<FloodEvent>) => api.put<FloodEvent>(`/flood-events/${id}/`, data),
  delete: (id: number) => api.delete(`/flood-events/${id}/`),
};

// Road Segments API
export const roadSegmentApi = {
  getAll: () => api.get<ApiResponse<RoadSegment>>('/road-segments/'),
  getById: (id: number) => api.get<RoadSegment>(`/road-segments/${id}/`),
  create: (data: Partial<RoadSegment>) => api.post<RoadSegment>('/road-segments/', data),
  update: (id: number, data: Partial<RoadSegment>) => api.put<RoadSegment>(`/road-segments/${id}/`, data),
  delete: (id: number) => api.delete(`/road-segments/${id}/`),
};

// Victim Reports API
export const victimReportApi = {
  getAll: () => api.get<ApiResponse<VictimReport>>('/victim-reports/'),
  getById: (id: number) => api.get<VictimReport>(`/victim-reports/${id}/`),
  create: (data: Partial<VictimReport>) => api.post<VictimReport>('/victim-reports/', data),
  update: (id: number, data: Partial<VictimReport>) => api.put<VictimReport>(`/victim-reports/${id}/`, data),
  delete: (id: number) => api.delete(`/victim-reports/${id}/`),
};

// Dashboard stats (we'll implement this later)
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    // For now, calculate stats from individual API calls
    const [floods, roads, victims] = await Promise.all([
      floodEventApi.getAll(),
      roadSegmentApi.getAll(),
      victimReportApi.getAll(),
    ]);

    return {
      activeFloodEvents: floods.data.count,
      blockedRoads: roads.data.results.filter(road => road.status === 'blocked' || road.status === 'flooded').length,
      pendingReports: victims.data.results.filter(report => report.status === 'new').length,
      rescuedVictims: victims.data.results.filter(report => report.status === 'rescued').length,
    };
  },
};

export default api;
