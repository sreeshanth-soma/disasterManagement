// Utility functions to parse Django's SRID geometry format

export interface ParsedPoint {
  lat: number;
  lng: number;
}

export interface ParsedPolygon {
  paths: Array<{ lat: number; lng: number }>;
}

export interface ParsedLineString {
  path: Array<{ lat: number; lng: number }>;
}

/**
 * Parse SRID POINT format: "SRID=4326;POINT (-74.003 40.714)"
 */
export const parsePointGeometry = (geometryString: string): ParsedPoint | null => {
  try {
    // Extract the POINT part
    const pointMatch = geometryString.match(/POINT\s*\(\s*([^)]+)\s*\)/i);
    if (!pointMatch) return null;

    // Extract coordinates
    const coords = pointMatch[1].trim().split(/\s+/);
    if (coords.length !== 2) return null;

    const lng = parseFloat(coords[0]);
    const lat = parseFloat(coords[1]);

    if (isNaN(lat) || isNaN(lng)) return null;

    return { lat, lng };
  } catch (error) {
    console.error('Error parsing point geometry:', error);
    return null;
  }
};

/**
 * Parse SRID POLYGON format: "SRID=4326;POLYGON ((-74.0059 40.7128, -74 40.7128, ...))"
 */
export const parsePolygonGeometry = (geometryString: string): ParsedPolygon | null => {
  try {
    // Extract the POLYGON part
    const polygonMatch = geometryString.match(/POLYGON\s*\(\s*\(([^)]+)\)\s*\)/i);
    if (!polygonMatch) return null;

    // Extract coordinate pairs
    const coordPairs = polygonMatch[1].split(',');
    const paths: Array<{ lat: number; lng: number }> = [];

    for (const pair of coordPairs) {
      const coords = pair.trim().split(/\s+/);
      if (coords.length !== 2) continue;

      const lng = parseFloat(coords[0]);
      const lat = parseFloat(coords[1]);

      if (!isNaN(lat) && !isNaN(lng)) {
        paths.push({ lat, lng });
      }
    }

    return paths.length > 0 ? { paths } : null;
  } catch (error) {
    console.error('Error parsing polygon geometry:', error);
    return null;
  }
};

/**
 * Parse SRID LINESTRING format: "SRID=4326;LINESTRING (-74.0059 40.7128, -74 40.715)"
 */
export const parseLineStringGeometry = (geometryString: string): ParsedLineString | null => {
  try {
    // Extract the LINESTRING part
    const lineMatch = geometryString.match(/LINESTRING\s*\(\s*([^)]+)\s*\)/i);
    if (!lineMatch) return null;

    // Extract coordinate pairs
    const coordPairs = lineMatch[1].split(',');
    const path: Array<{ lat: number; lng: number }> = [];

    for (const pair of coordPairs) {
      const coords = pair.trim().split(/\s+/);
      if (coords.length !== 2) continue;

      const lng = parseFloat(coords[0]);
      const lat = parseFloat(coords[1]);

      if (!isNaN(lat) && !isNaN(lng)) {
        path.push({ lat, lng });
      }
    }

    return path.length > 0 ? { path } : null;
  } catch (error) {
    console.error('Error parsing linestring geometry:', error);
    return null;
  }
};

/**
 * Generic geometry parser that detects the type
 */
export const parseGeometry = (geometryString: string) => {
  if (typeof geometryString !== 'string') {
    console.warn('Geometry is not a string:', geometryString);
    return null;
  }

  if (geometryString.includes('POINT')) {
    return { type: 'Point', ...parsePointGeometry(geometryString) };
  } else if (geometryString.includes('POLYGON')) {
    return { type: 'Polygon', ...parsePolygonGeometry(geometryString) };
  } else if (geometryString.includes('LINESTRING')) {
    return { type: 'LineString', ...parseLineStringGeometry(geometryString) };
  }

  console.warn('Unknown geometry type:', geometryString);
  return null;
};
