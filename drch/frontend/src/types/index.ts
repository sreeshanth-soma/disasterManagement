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

// Union type for geometries that can be either Point or Polygon
export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon;

// Properties interfaces
export interface FloodEventProperties {
  name: string;
  confidence: number;
  detected_at: string;
  source: string;
  source_display?: string;
  social_media_source?: string;
  original_post_id?: string;
  post_content?: string;
  author_username?: string;
  engagement_score?: number;
  post_url?: string;
  location_description?: string;
  severity_level?: string;
  severity_display?: string;
  verified?: boolean;
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

export interface SocialMediaPostProperties {
  id: number;
  platform: 'twitter' | 'youtube' | 'instagram' | 'facebook';
  platform_display: string;
  post_id: string;
  content: string;
  author_username: string;
  author_display_name?: string;
  post_url: string;
  created_at: string;
  engagement_metrics: Record<string, number>;
  location_data: Record<string, any>;
  media_urls: string[];
  processed: boolean;
  flood_relevant: boolean;
  confidence_score: number;
  created_at_db: string;
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
