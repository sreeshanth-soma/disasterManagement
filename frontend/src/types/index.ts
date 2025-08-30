// API Response types
export interface FloodEvent {
  id: number;
  name: string;
  geom: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  confidence: number;
  detected_at: string;
  source: string;
}

export interface RoadSegment {
  id: number;
  osm_id: number;
  geom: {
    type: 'LineString';
    coordinates: number[][];
  };
  status: 'normal' | 'flooded' | 'blocked';
  last_checked: string;
}

export interface VictimReport {
  id: number;
  phone: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  needs: Record<string, any>;
  priority: number;
  status: 'new' | 'triaged' | 'rescued';
  reported_at: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
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
