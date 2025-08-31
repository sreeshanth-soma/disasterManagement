import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, InfoWindow } from '@react-google-maps/api';
import { AlertTriangle, Plus, Filter, Download } from 'lucide-react';

import { floodEventApi, extractGeoJSONData } from '../services/api';
import { parsePolygonGeometry } from '../utils/geometryParser';
import ModernCard from './ModernCard';
import type { GeoJSONFeature, FloodEventProperties } from '../types';

const containerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: 40.714, // New York City - closer to actual data
  lng: -74.003, // New York City - closer to actual data
};

const FloodMonitor: React.FC = () => {
  const [floodFeatures, setFloodFeatures] = useState<GeoJSONFeature<FloodEventProperties>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature<FloodEventProperties> | null>(null);

  // Retrieve API key from environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '', // Ensure API key is provided
    // Note: Using classic Marker API (deprecated Feb 2024, but supported for 12+ months)
    // TODO: Migrate to AdvancedMarkerElement when @react-google-maps/api supports it
  });

  useEffect(() => {
    const fetchFloodEvents = async () => {
      try {
        const response = await floodEventApi.getAll();
        // Extract GeoJSON data from API response
        const geoJSONData = extractGeoJSONData<FloodEventProperties>(response);
        const features = geoJSONData?.features || [];
        setFloodFeatures(features);
        setError(null);
      } catch (err: any) {
        setError('Failed to load flood events: ' + (err?.message || 'Unknown error'));
        console.error('Flood events fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFloodEvents();
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#dc2626'; // Red for high confidence
    if (confidence >= 0.6) return '#ea580c'; // Orange for medium confidence
    return '#eab308'; // Yellow for lower confidence
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loadError) return (
    <div className="alert alert-danger">
      <AlertTriangle className="w-5 h-5" />
      <div>
        <p className="font-medium">Error loading Google Maps</p>
        <p className="text-sm">Please check your Google Maps API key configuration</p>
      </div>
    </div>
  );

  if (!apiKey) return (
    <div className="alert alert-warning">
      <AlertTriangle className="w-5 h-5" />
      <div>
        <p className="font-medium">Google Maps API key required</p>
        <p className="text-sm">Create a .env file with VITE_GOOGLE_MAPS_API_KEY to enable maps</p>
      </div>
    </div>
  );

  if (loading || !isLoaded) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-lg text-gray-700">Loading Map...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-8 h-8 text-disaster-600" />
          <h2 className="text-3xl font-bold text-gray-900">Flood Event Monitor</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
          <button className="btn-primary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{floodFeatures.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-disaster-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Confidence</p>
              <p className="text-2xl font-bold text-disaster-600">
                {floodFeatures.filter(feature => feature.properties.confidence >= 0.8).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-disaster-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">H</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent (24h)</p>
              <p className="text-2xl font-bold text-blue-600">
                {floodFeatures.filter(feature => 
                  new Date(feature.properties.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Event List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          {
            isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
              >
                {/* Render Flood Event Polygons */}
                {floodFeatures.map((feature) => {
                  // Parse the SRID geometry string
                  const polygonData = parsePolygonGeometry(feature.geometry as unknown as string);
                  
                  if (polygonData) {
                    return (
                      <Polygon
                        key={feature.id}
                        paths={polygonData.paths}
                        options={{
                          strokeColor: getConfidenceColor(feature.properties.confidence),
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          fillColor: getConfidenceColor(feature.properties.confidence),
                          fillOpacity: 0.35,
                        }}
                        onClick={() => {
                          setSelectedFeature(feature);
                          console.log('Flood area clicked:', feature.properties.name);
                        }}
                      />
                    );
                  }
                  return null;
                })}

                {/* Marker and InfoWindow for selected flood area */}
                {selectedFeature && (() => {
                  const polygonData = parsePolygonGeometry(selectedFeature.geometry as unknown as string);
                  if (polygonData && polygonData.paths.length > 0) {
                    // Use the first coordinate as the marker position (centroid would be better)
                    const markerPosition = polygonData.paths[0];
                    return (
                      <>
                        <Marker
                          position={markerPosition}
                          onClick={() => console.log('Selected Feature Marker Click')}
                        />
                        <InfoWindow
                          position={markerPosition}
                          onCloseClick={() => setSelectedFeature(null)}
                        >
                          <div className="p-2 max-w-xs">
                            <h3 className="font-semibold text-gray-900 mb-2">{selectedFeature.properties.name}</h3>
                            <div className="space-y-1 text-sm">
                              <div><strong>Confidence:</strong> {(selectedFeature.properties.confidence * 100).toFixed(1)}%</div>
                              <div><strong>Source:</strong> {selectedFeature.properties.source}</div>
                              <div><strong>Detected:</strong> {new Date(selectedFeature.properties.detected_at).toLocaleString()}</div>
                              <div><strong>Event ID:</strong> {selectedFeature.id}</div>
                            </div>
                          </div>
                        </InfoWindow>
                      </>
                    );
                  }
                  return null;
                })()}
              </GoogleMap>
            ) : (
              <div>Loading Map...</div>
            )
          }
        </div>

        {/* Event List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {floodFeatures.slice(0, 10).map((feature) => (
              <ModernCard
                key={feature.id}
                title={feature.properties.name}
                subtitle={`Event #${feature.id}`}
                confidence={feature.properties.confidence}
                icon={AlertTriangle}
                timestamp={feature.properties.detected_at}
                details={[
                  { label: 'Source', value: feature.properties.source },
                  { label: 'Confidence', value: `${(feature.properties.confidence * 100).toFixed(1)}%` },
                ]}
                actions={[
                  { label: 'View Details', onClick: () => setSelectedFeature(feature), variant: 'primary' },
                  { label: 'View on Map', onClick: () => setSelectedFeature(feature), variant: 'secondary' },
                ]}
                onClick={() => setSelectedFeature(feature)}
                isSelected={selectedFeature?.id === feature.id}
                className="transform scale-95"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected Event Details */}
      {selectedFeature && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{selectedFeature.properties.name}</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Confidence:</span> {(selectedFeature.properties.confidence * 100).toFixed(1)}%</p>
                <p><span className="font-medium">Source:</span> {selectedFeature.properties.source}</p>
                <p><span className="font-medium">Detected:</span> {formatDate(selectedFeature.properties.detected_at)}</p>
                <p><span className="font-medium">Event ID:</span> {selectedFeature.id}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
              <div className="space-y-2">
                <button className="w-full btn-primary text-sm">View Full Details</button>
                <button className="w-full btn-warning text-sm">Update Status</button>
                <button className="w-full btn-danger text-sm">Generate Alert</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloodMonitor;
