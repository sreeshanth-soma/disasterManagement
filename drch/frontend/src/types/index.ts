// GeoJSON types
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][]; // Array of [longitude, latitude] pairs
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // Array of linear rings (first is exterior, rest are holes)
}

// Properties interfaces
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
  address?: string; // New address field
  needs: Record<string, boolean>;
  priority: number;
  status: 'new' | 'triaged' | 'rescued';
  reported_at: string;
}

// GeoJSON Feature types
export interface GeoJSONFeature<T, G> {
  id: number;
  type: 'Feature';
  geometry: G;
  properties: T;
}

export interface GeoJSONFeatureCollection<T, G> {
  type: 'FeatureCollection';
  features: GeoJSONFeature<T, G>[];
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
