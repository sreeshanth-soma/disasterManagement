import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { AlertTriangle, Plus, Filter, Download } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { floodEventApi } from '../services/api';
import type { GeoJSONFeature, FloodEventProperties } from '../types';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const FloodMonitor: React.FC = () => {
  const [floodFeatures, setFloodFeatures] = useState<GeoJSONFeature<FloodEventProperties>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature<FloodEventProperties> | null>(null);

  useEffect(() => {
    const fetchFloodEvents = async () => {
      try {
        const response = await floodEventApi.getAll();
        if (!response || !response.data || !Array.isArray(response.data.features)) {
          throw new Error('Unexpected API response format for flood events');
        }
        setFloodFeatures(response.data.features);
        setError(null);
      } catch (err) {
        setError('Failed to load flood events');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <AlertTriangle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

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
          <div className="h-96">
            <MapContainer
              center={[40.7128, -74.0060]} // New York City as default
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {floodFeatures.map((feature) => {
                // Ensure geometry is a Polygon and extract coordinates correctly
                if (feature.geometry && feature.geometry.type === 'Polygon' && Array.isArray(feature.geometry.coordinates[0])) {
                  const polygonCoordinates = feature.geometry.coordinates[0] as [number, number][];
                  const positions = polygonCoordinates.map(coord => [coord[1], coord[0]] as [number, number]);
                  
                  return (
                    <Polygon
                      key={feature.id}
                      positions={positions}
                      pathOptions={{
                        color: getConfidenceColor(feature.properties.confidence),
                        fillColor: getConfidenceColor(feature.properties.confidence),
                        fillOpacity: 0.3,
                        weight: 2,
                      }}
                      eventHandlers={{
                        click: () => setSelectedFeature(feature),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-gray-900">{feature.properties.name}</h3>
                          <p className="text-sm text-gray-600">Confidence: {(feature.properties.confidence * 100).toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">Source: {feature.properties.source}</p>
                          <p className="text-sm text-gray-600">Detected: {formatDate(feature.properties.detected_at)}</p>
                        </div>
                      </Popup>
                    </Polygon>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>
        </div>

        {/* Event List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {floodFeatures.slice(0, 10).map((feature) => (
              <div
                key={feature.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFeature?.id === feature.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFeature(feature)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{feature.properties.name}</h4>
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full text-white"
                    style={{ backgroundColor: getConfidenceColor(feature.properties.confidence) }}
                  >
                    {(feature.properties.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Source: {feature.properties.source}</p>
                <p className="text-sm text-gray-500">{formatDate(feature.properties.detected_at)}</p>
              </div>
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
