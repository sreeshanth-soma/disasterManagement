// API Response types
export interface GeoJSONFeature<T> {
  id: number;
  type: 'Feature';
  geometry: {
    type: string; // e.g., 'Point', 'LineString', 'Polygon'
    coordinates: any; // Type depends on geometry type
  };
  properties: T;
}

export interface GeoJSONFeatureCollection<T> {
  type: 'FeatureCollection';
  features: GeoJSONFeature<T>[];
}

export interface FloodEventProperties {
  name: string;
  confidence: number;
  detected_at: string;
  source: string;
}

export interface RoadSegmentProperties {
  osm_id: number;
  status: 'normal' | 'flooded' | 'blocked';
  last_checked: string;
}

export interface VictimReportProperties {
  phone: string;
  needs: Record<string, any>;
  priority: number;
  status: 'new' | 'triaged' | 'rescued';
  reported_at: string;
}

// Dashboard stats
export interface DashboardStats {
  activeFloodEvents: number;
  blockedRoads: number;
  pendingReports: number;
  rescuedVictims: number;
}

// Map bounds
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Original API Response interface (now unused, but kept for context if needed)
// export interface ApiResponse<T> {
//   count: number;
//   next?: string;
//   previous?: string;
//   results: T[];
// }
