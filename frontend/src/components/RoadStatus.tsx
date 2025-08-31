import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, InfoWindow, Marker } from '@react-google-maps/api';
import { Navigation, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

import { roadSegmentApi, extractGeoJSONData } from '../services/api';
import { parseLineStringGeometry } from '../utils/geometryParser';
import ModernCard from './ModernCard';
import type { GeoJSONFeature, RoadSegmentProperties } from '../types';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 40.714, // New York City - closer to actual data
  lng: -74.003, // New York City - closer to actual data
};

const RoadStatus: React.FC = () => {
  const [roadFeatures, setRoadFeatures] = useState<GeoJSONFeature<RoadSegmentProperties>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<GeoJSONFeature<RoadSegmentProperties> | null>(null);

  // Retrieve API key from environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-roads',
    googleMapsApiKey: apiKey || '',
    // Note: Using classic Marker API (deprecated Feb 2024, but supported for 12+ months)
    // TODO: Migrate to AdvancedMarkerElement when @react-google-maps/api supports it
  });

  useEffect(() => {
    const fetchRoadSegments = async () => {
      try {
        const response = await roadSegmentApi.getAll();
        // Extract GeoJSON data from API response
        const geoJSONData = extractGeoJSONData<RoadSegmentProperties>(response);
        const features = geoJSONData?.features || [];
        setRoadFeatures(features);
        setError(null);
      } catch (err: any) {
        setError('Failed to load road segments: ' + (err?.message || 'Unknown error'));
        console.error('Road segments fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadSegments();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'flooded':
        return <AlertTriangle className="w-5 h-5 text-disaster-600" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Navigation className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'flooded':
        return 'bg-disaster-100 text-disaster-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPolylineColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#22c55e'; // Green
      case 'flooded':
        return '#dc2626'; // Red
      case 'blocked':
        return '#f59e0b'; // Amber
      default:
        return '#9ca3af'; // Gray
    }
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (loading || !isLoaded) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-lg text-gray-700">Loading Map...</p>
    </div>
  );

  const normalRoads = roadFeatures.filter(feature => feature.properties.status === 'normal').length;
  const floodedRoads = roadFeatures.filter(feature => feature.properties.status === 'flooded').length;
  const blockedRoads = roadFeatures.filter(feature => feature.properties.status === 'blocked').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Navigation className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Road Status Monitor</h2>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roads</p>
              <p className="text-2xl font-bold text-gray-900">{roadFeatures.length}</p>
            </div>
            <Navigation className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Normal</p>
              <p className="text-2xl font-bold text-green-600">{normalRoads}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Flooded</p>
              <p className="text-2xl font-bold text-disaster-600">{floodedRoads}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-disaster-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{blockedRoads}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Map and Road List */}
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
                {/* Render Road Segments as Polylines */}
                {roadFeatures.map((feature) => {
                  // Parse the SRID geometry string
                  const lineData = parseLineStringGeometry(feature.geometry as unknown as string);
                  
                  if (lineData) {
                    return (
                      <Polyline
                        key={feature.id}
                        path={lineData.path}
                        options={{
                          strokeColor: getPolylineColor(feature.properties.status),
                          strokeOpacity: 0.8,
                          strokeWeight: 4,
                        }}
                        onClick={() => {
                          setSelectedRoad(feature);
                          console.log('Road Segment Click', feature.properties.osm_id);
                        }}
                      />
                    );
                  }
                  return null;
                })}

                {/* InfoWindow for selected road */}
                {selectedRoad && (() => {
                  const lineData = parseLineStringGeometry(selectedRoad.geometry as unknown as string);
                  if (lineData && lineData.path.length > 0) {
                    // Use the middle point of the line as marker position
                    const midIndex = Math.floor(lineData.path.length / 2);
                    const markerPosition = lineData.path[midIndex];
                    return (
                      <>
                        <Marker
                          position={markerPosition}
                          onClick={() => console.log('Selected Road Marker Click')}
                        />
                        <InfoWindow
                          position={markerPosition}
                          onCloseClick={() => setSelectedRoad(null)}
                        >
                          <div className="p-2 max-w-xs">
                            <h3 className="font-semibold text-gray-900 mb-2">Road Segment #{selectedRoad.id}</h3>
                            <div className="space-y-1 text-sm">
                              <div><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRoad.properties.status)}`}>
                                {selectedRoad.properties.status.charAt(0).toUpperCase() + selectedRoad.properties.status.slice(1)}
                              </span></div>
                              <div><strong>OSM ID:</strong> {selectedRoad.properties.osm_id}</div>
                              <div><strong>Last Checked:</strong> {new Date(selectedRoad.properties.last_checked).toLocaleString()}</div>
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

        {/* Road List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Road Segments</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {roadFeatures.map((feature) => (
              <ModernCard
                key={feature.id}
                title={`Road Segment #${feature.id}`}
                subtitle={`OSM ID: ${feature.properties.osm_id}`}
                status={feature.properties.status}
                icon={Navigation}
                statusIcon={getStatusIcon(feature.properties.status)}
                timestamp={feature.properties.last_checked}
                details={[
                  { label: 'OSM ID', value: feature.properties.osm_id },
                  { label: 'Last Checked', value: new Date(feature.properties.last_checked).toLocaleString() },
                ]}
                actions={[
                  { label: 'Update Status', onClick: () => console.log('Update status for', feature.id), variant: 'primary' },
                  { label: 'View Details', onClick: () => setSelectedRoad(feature), variant: 'secondary' },
                  { label: 'View on Map', onClick: () => setSelectedRoad(feature), variant: 'secondary' },
                ]}
                onClick={() => setSelectedRoad(feature)}
                isSelected={selectedRoad?.id === feature.id}
                className="transform scale-95"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadStatus;
