import { useState, useEffect } from 'react';
import { GoogleMap, Polyline, InfoWindow } from '@react-google-maps/api';
import { Navigation, AlertTriangle, CheckCircle, XCircle, RefreshCw, MapPin, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { roadSegmentApi } from '../services/api';
import type { GeoJSONFeature, RoadSegmentProperties, GeoJSONLineString } from '../types';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

interface RoadStatusProps {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const RoadStatus: React.FC<RoadStatusProps> = ({ isLoaded, loadError }) => {
  const [roadFeatures, setRoadFeatures] = useState<GeoJSONFeature<RoadSegmentProperties, GeoJSONLineString>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<GeoJSONFeature<RoadSegmentProperties, GeoJSONLineString> | null>(null);

  useEffect(() => {
    const fetchRoadSegments = async () => {
      try {
        const response = await roadSegmentApi.getAll();
        if (!response || !Array.isArray(response)) {
          throw new Error('Unexpected API response format for road segments');
        }
        setRoadFeatures(response);
        setError(null);
      } catch (err) {
        setError('Failed to load road segments: ' + (err as Error).message);
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
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'flooded':
        return <AlertTriangle className="w-5 h-5 text-disaster-600" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-warning-600" />;
      default:
        return <Navigation className="w-5 h-5 text-secondary-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-success-100 text-success-800';
      case 'flooded':
        return 'bg-disaster-100 text-disaster-800';
      case 'blocked':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getPolylineColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#22c55e'; // Green
      case 'flooded':
        return '#dc2626'; // Red
      case 'blocked':
        return '#ea580c'; // Orange
      default:
        return '#9ca3af'; // Gray
    }
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (loading || !isLoaded) {
    return (
      <div className="road-theme page-container">
        <div className="content-wrapper animate-fade-in">
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <div className="loading-text">Loading Road Status...</div>
          </div>
        </div>
      </div>
    );
  }

  const normalRoads = roadFeatures.filter(road => road.properties.status === 'normal').length;
  const floodedRoads = roadFeatures.filter(road => road.properties.status === 'flooded').length;
  const blockedRoads = roadFeatures.filter(road => road.properties.status === 'blocked').length;

  return (
    <div className="road-theme page-container">
      <div className="content-wrapper animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div className="page-title">
            <Navigation size={48} />
            <span>Road Status Monitor</span>
          </div>
          <div className="page-actions">
            <button className="btn-theme" onClick={() => console.log('Refresh Road Status')}>
              <RefreshCw size={20} />
              Refresh Status
            </button>
            <button className="btn-theme-secondary" onClick={() => console.log('Add Road Closure')}>
              <MapPin size={20} />
              Add Closure
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger animate-fade-in">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card animate-slide-in-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Roads</p>
                <p className="text-3xl font-bold text-secondary-900">{roadFeatures.length}</p>
                <p className="text-xs text-gray-500 mt-1">Monitored segments</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Navigation className="w-8 h-8 text-secondary-600" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Normal</p>
                <p className="text-3xl font-bold text-success-600">{normalRoads}</p>
                <p className="text-xs text-gray-500 mt-1">Open for traffic</p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Flooded</p>
                <p className="text-3xl font-bold text-disaster-600">{floodedRoads}</p>
                <p className="text-xs text-gray-500 mt-1">Water on roadway</p>
              </div>
              <div className="p-3 bg-disaster-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-disaster-600" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Blocked</p>
                <p className="text-3xl font-bold text-warning-600">{blockedRoads}</p>
                <p className="text-xs text-gray-500 mt-1">Closed to traffic</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <XCircle className="w-8 h-8 text-warning-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Map and Road List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 map-container animate-fade-in delay-400">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={11}
                options={{ 
                  streetViewControl: false, 
                  mapTypeControl: false, 
                  fullscreenControl: false,
                  styles: [
                    {
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#4a4a4a" }]
                    },
                    {
                      featureType: "road.highway",
                      elementType: "geometry",
                      stylers: [{ color: "#6a6a6a" }]
                    },
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#193341" }]
                    },
                    {
                      featureType: "landscape",
                      elementType: "geometry",
                      stylers: [{ color: "#2c5a2c" }]
                    },
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    },
                    {
                      featureType: "transit",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    }
                  ]
                }}
              >
                {/* Render Road Segments as Polylines */}
                {roadFeatures.map((feature) => {
                  if (feature.geometry && feature.geometry.type === 'LineString' && Array.isArray(feature.geometry.coordinates)) {
                    const lineCoordinates = feature.geometry.coordinates as [number, number][];
                    const path = lineCoordinates.map(coord => ({
                      lat: coord[1],
                      lng: coord[0],
                    }));

                    return (
                      <Polyline
                        key={feature.id}
                        path={path}
                        options={{
                          strokeColor: getPolylineColor(feature.properties.status),
                          strokeOpacity: 0.9,
                          strokeWeight: 6,
                        }}
                        onClick={() => setSelectedRoad(feature)}
                      />
                    );
                  }
                  return null;
                })}

              {/* InfoWindow for selected road */}
              {selectedRoad && selectedRoad.geometry && selectedRoad.geometry.type === 'LineString' && (
                <InfoWindow
                  position={{
                    lat: selectedRoad.geometry.coordinates[0][1],
                    lng: selectedRoad.geometry.coordinates[0][0],
                  }}
                  onCloseClick={() => setSelectedRoad(null)}
                >
                  <div className="p-3 max-w-xs">
                    <h3 className="font-semibold text-text-primary mb-2">Road Segment #{selectedRoad.id}</h3>
                    <div className="space-y-1 text-sm text-text-secondary">
                      <p><strong>OSM ID:</strong> {selectedRoad.properties.osm_id}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-1 badge ${getStatusColor(selectedRoad.properties.status)}`}>
                          {selectedRoad.properties.status.charAt(0).toUpperCase() + selectedRoad.properties.status.slice(1)}
                        </span>
                      </p>
                      <p><strong>Last Checked:</strong> {new Date(selectedRoad.properties.last_checked).toLocaleString()}</p>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
            ) : (
              <div className="loading-container"><Loader2 className="loading-spinner" /><div className="loading-text">Loading Map...</div></div>
            )}
          </div>

          {/* Road Segments List */}
          <div className="theme-card animate-slide-in-left delay-500">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-warning-600" />
              Road Segments
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {roadFeatures.map((road) => (
                <div
                  key={road.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedRoad?.id === road.id
                      ? 'border-warning-500 bg-warning-50 shadow-md animate-pulse-effect'
                      : 'border-gray-200 hover:border-warning-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedRoad(road)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(road.properties.status)}
                      <span className="font-medium text-text-primary text-sm">#{road.properties.osm_id}</span>
                    </div>
                    <span className={`badge ${getStatusColor(road.properties.status)}`}>
                      {road.properties.status.charAt(0).toUpperCase() + road.properties.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-text-secondary mb-2">
                    <Clock className="w-3 h-3" />
                    <span>Last checked: {new Date(road.properties.last_checked).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button className="badge bg-warning-100 text-warning-700 hover:bg-warning-200" onClick={() => console.log('Update Status', road.id)}>
                      Update Status
                    </button>
                    <button className="badge bg-secondary-100 text-secondary-700 hover:bg-secondary-200" onClick={() => console.log('View Details', road.id)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Road Details */}
        {selectedRoad && (
          <div className="theme-card mt-6 animate-fade-in delay-600">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-warning-600" />
              Road Segment Details: #{selectedRoad.properties.osm_id}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-text-primary mb-3">Segment Information</h4>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Segment ID:</span>
                    <span className="font-medium">#{selectedRoad.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OSM ID:</span>
                    <span className="font-medium">{selectedRoad.properties.osm_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span className={`badge ${getStatusColor(selectedRoad.properties.status)}`}>
                      {selectedRoad.properties.status.charAt(0).toUpperCase() + selectedRoad.properties.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date(selectedRoad.properties.last_checked).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-3">Management Actions</h4>
                <div className="space-y-2">
                  <button className="w-full btn-theme text-sm" onClick={() => console.log('Update Status', selectedRoad.id)}>
                    <RefreshCw size={16} />
                    Update Status
                  </button>
                  <button className="w-full btn-theme-secondary border-disaster-600 text-disaster-600 hover:bg-disaster-600 hover:text-white text-sm" onClick={() => console.log('Mark as Blocked', selectedRoad.id)}>
                    <XCircle size={16} />
                    Mark as Blocked
                  </button>
                  <button className="w-full btn-theme-secondary border-success-600 text-success-600 hover:bg-success-600 hover:text-white text-sm" onClick={() => console.log('Mark as Normal', selectedRoad.id)}>
                    <CheckCircle size={16} />
                    Mark as Normal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Impact Summary */}
        <div className="theme-card mt-6 animate-fade-in delay-700">
          <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-warning-600" />
            Traffic Impact Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success-50 rounded-lg animate-pulse-effect">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <h4 className="font-semibold text-text-primary">Normal Flow</h4>
              <p className="text-2xl font-bold text-success-600">{roadFeatures.length > 0 ? Math.round((normalRoads / roadFeatures.length) * 100) : 0}%</p>
              <p className="text-xs text-gray-500 mt-1">of roads operational</p>
            </div>
            
            <div className="text-center p-4 bg-disaster-50 rounded-lg animate-pulse-effect delay-100">
              <div className="w-12 h-12 bg-disaster-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-disaster-600" />
              </div>
              <h4 className="font-semibold text-text-primary">Flood Impact</h4>
              <p className="text-2xl font-bold text-disaster-600">{floodedRoads}</p>
              <p className="text-xs text-gray-500 mt-1">segments affected</p>
            </div>
            
            <div className="text-center p-4 bg-warning-50 rounded-lg animate-pulse-effect delay-200">
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-warning-600" />
              </div>
              <h4 className="font-semibold text-text-primary">Total Closures</h4>
              <p className="text-2xl font-bold text-warning-600">{blockedRoads + floodedRoads}</p>
              <p className="text-xs text-gray-500 mt-1">roads unavailable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadStatus;
