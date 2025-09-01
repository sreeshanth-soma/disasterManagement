import { useState, useEffect } from 'react';
import { GoogleMap, Polygon, InfoWindow } from '@react-google-maps/api';
import { AlertTriangle, Plus, Filter, Download, Droplets, TrendingUp, Clock, Zap, Loader2 } from 'lucide-react';
import { floodEventApi } from '../services/api';
import type { GeoJSONFeature, FloodEventProperties, GeoJSONPolygon } from '../types';
import BlogCard from './BlogCard';
import '../styles/BlogCard.css';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

interface FloodMonitorProps {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const FloodMonitor: React.FC<FloodMonitorProps> = ({ isLoaded, loadError }) => {
  const [floodFeatures, setFloodFeatures] = useState<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon> | null>(null);

  useEffect(() => {
    const fetchFloodEvents = async () => {
      try {
        const response = await floodEventApi.getAll();
        if (!response || !Array.isArray(response)) {
          throw new Error('Unexpected API response format for flood events');
        }
        setFloodFeatures(response);
        setError(null);
      } catch (err) {
        setError('Failed to load flood events: ' + (err as Error).message);
        console.error('Flood events fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFloodEvents();
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#dc2626';
    if (confidence >= 0.6) return '#ea580c';
    return '#eab308';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (loading || !isLoaded) {
    return (
      <div className="flood-theme page-container">
        <div className="content-wrapper animate-fade-in">
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <div className="loading-text">Loading Flood Monitor...</div>
          </div>
        </div>
      </div>
    );
  }

  const highConfidenceEvents = floodFeatures.filter(feature => feature.properties.confidence >= 0.8).length;
  const recentEvents = floodFeatures.filter(feature => 
    new Date(feature.properties.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="flood-theme page-container">
      <div className="content-wrapper animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div className="page-title">
            <Droplets size={48} />
            <span>Flood Event Monitor</span>
          </div>
          <div className="page-actions">
            <button className="btn-theme" onClick={() => console.log('Add Flood Event')}>
              <Plus size={20} />
              Add Event
            </button>
            <button className="btn-theme-secondary" onClick={() => console.log('Filter Flood Events')}>
              <Filter size={20} />
              Filter
            </button>
            <button className="btn-theme-secondary" onClick={() => console.log('Export Flood Events')}>
              <Download size={20} />
              Export
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
                <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-disaster-600">{floodFeatures.length}</p>
                <p className="text-xs text-gray-500 mt-1">Active flood incidents</p>
              </div>
              <div className="p-3 bg-disaster-100 rounded-full">
                <Droplets className="w-8 h-8 text-disaster-600 animate-pulse-effect" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">High Confidence</p>
                <p className="text-3xl font-bold text-warning-600">{highConfidenceEvents}</p>
                <p className="text-xs text-gray-500 mt-1">≥80% confidence level</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-warning-600" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Recent (24h)</p>
                <p className="text-3xl font-bold text-secondary-500">{recentEvents}</p>
                <p className="text-xs text-gray-500 mt-1">New detections today</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Clock className="w-8 h-8 text-secondary-500" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Alert Level</p>
                <p className="text-3xl font-bold text-disaster-600">HIGH</p>
                <p className="text-xs text-gray-500 mt-1">Emergency response active</p>
              </div>
              <div className="p-3 bg-disaster-100 rounded-full">
                <Zap className="w-8 h-8 text-disaster-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Map and Event List */}
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
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#5a5a5a" }]
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
                {/* Render Flood Event Polygons */}
                {floodFeatures.map((feature) => {
                  if (feature.geometry && feature.geometry.type === 'Polygon' && Array.isArray(feature.geometry.coordinates[0])) {
                    const polygonCoordinates = feature.geometry.coordinates[0] as [number, number][];
                    const paths = polygonCoordinates.map(coord => ({
                      lat: coord[1],
                      lng: coord[0],
                    }));

                    return (
                      <Polygon
                        key={feature.id}
                        paths={paths}
                        options={{
                          strokeColor: getConfidenceColor(feature.properties.confidence),
                          strokeOpacity: 0.8,
                          strokeWeight: 3,
                          fillColor: getConfidenceColor(feature.properties.confidence),
                          fillOpacity: 0.4,
                        }}
                        onClick={() => setSelectedFeature(feature)}
                      />
                    );
                  }
                  return null;
                })}

                {/* InfoWindow for selected feature */}
                {selectedFeature && selectedFeature.geometry && selectedFeature.geometry.type === 'Polygon' && (
                  <InfoWindow
                    position={{
                      lat: selectedFeature.geometry.coordinates[0][0][1],
                      lng: selectedFeature.geometry.coordinates[0][0][0],
                    }}
                    onCloseClick={() => setSelectedFeature(null)}
                  >
                    <div className="p-3 max-w-xs">
                      <h3 className="font-semibold text-text-primary mb-2">{selectedFeature.properties.name}</h3>
                      <div className="space-y-1 text-sm text-text-secondary">
                        <p><strong>Confidence:</strong> {(selectedFeature.properties.confidence * 100).toFixed(1)}%</p>
                        <p><strong>Source:</strong> {selectedFeature.properties.source}</p>
                        <p><strong>Detected:</strong> {formatDate(selectedFeature.properties.detected_at)}</p>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            ) : (
              <div className="loading-container"><Loader2 className="loading-spinner" /><div className="loading-text">Loading Map...</div></div>
            )}
          </div>

          {/* Event List */}
          <div className="theme-card animate-slide-in-left delay-500">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-disaster-600" />
              Active Events
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {floodFeatures.slice(0, 10).map((feature) => (
                <div
                  key={feature.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedFeature?.id === feature.id
                      ? 'border-disaster-500 bg-disaster-50 shadow-md animate-pulse-effect'
                      : 'border-gray-200 hover:border-disaster-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedFeature(feature)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-text-primary text-sm">{feature.properties.name}</h4>
                    <span
                      className="badge"
                      style={{ backgroundColor: getConfidenceColor(feature.properties.confidence), color: 'white' }}
                    >
                      {(feature.properties.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Source: {feature.properties.source}</p>
                  <p className="text-xs text-gray-500">{formatDate(feature.properties.detected_at)}</p>
                  
                  <div className="mt-2 flex gap-1">
                    <button className="badge bg-disaster-100 text-disaster-700 hover:bg-disaster-200" onClick={() => console.log('View Details', feature.id)}>
                      View Details
                    </button>
                    <button className="badge bg-warning-100 text-warning-700 hover:bg-warning-200" onClick={() => console.log('Generate Alert', feature.id)}>
                      Generate Alert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Event Details */}
        {selectedFeature && (
          <div className="theme-card mt-6 animate-fade-in delay-600">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Droplets className="w-6 h-6 text-disaster-600" />
              Event Details: {selectedFeature.properties.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-text-primary mb-3">Event Information</h4>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event ID:</span>
                    <span className="font-medium">#{selectedFeature.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence Level:</span>
                    <span className="font-medium" style={{ color: getConfidenceColor(selectedFeature.properties.confidence) }}>
                      {(selectedFeature.properties.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Detection Source:</span>
                    <span className="font-medium">{selectedFeature.properties.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">First Detected:</span>
                    <span className="font-medium">{formatDate(selectedFeature.properties.detected_at)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-3">Response Actions</h4>
                <div className="space-y-2">
                  <button className="w-full btn-theme bg-disaster-600 hover:bg-disaster-700 text-sm" onClick={() => console.log('Issue Emergency Alert', selectedFeature.id)}>
                    <AlertTriangle size={16} />
                    Issue Emergency Alert
                  </button>
                  <button className="w-full btn-theme-secondary border-warning-600 text-warning-600 hover:bg-warning-600 hover:text-white text-sm" onClick={() => console.log('Update Severity', selectedFeature.id)}>
                    <TrendingUp size={16} />
                    Update Severity
                  </button>
                  <button className="w-full btn-theme-secondary border-secondary-500 text-secondary-500 hover:bg-secondary-500 hover:text-white text-sm" onClick={() => console.log('Export Report', selectedFeature.id)}>
                    <Download size={16} />
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flood Reports Blog Cards */}
        <div className="blog-card-section mt-6 animate-fade-in delay-700">
          <h1>Flood Reports</h1>
          <div className="blog-cards-grid">
            {floodFeatures.map((feature) => (
              <BlogCard
                key={feature.id}
                title={feature.properties.name}
                description={`Confidence: ${(feature.properties.confidence * 100).toFixed(0)}% | Source: ${feature.properties.source} | Detected: ${formatDate(feature.properties.detected_at)}`}
                imageUrl={`https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&crop=center&flood=${feature.id}`}
                details={`Event ID: ${feature.id} | High confidence flood detection requiring immediate attention`}
                onClick={() => setSelectedFeature(feature)}
              />
            ))}
          </div>
          <div className="credit">
            Created by <a className="creator-link" href="#" onClick={(e) => e.preventDefault()}>DRCH System</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloodMonitor;
