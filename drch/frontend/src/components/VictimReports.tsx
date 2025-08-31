import { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Users, AlertTriangle, Clock, Shield, Phone, MapPin, Loader2, ListTodo, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';
import { victimReportApi } from '../services/api';
import type { GeoJSONFeature, VictimReportProperties, GeoJSONPoint } from '../types';
import ReportCard from './ReportCard';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

interface VictimReportsProps {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const VictimReports: React.FC<VictimReportsProps> = ({ isLoaded, loadError }) => {
  const [victimFeatures, setVictimFeatures] = useState<GeoJSONFeature<VictimReportProperties, GeoJSONPoint>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  useEffect(() => {
    const fetchVictimReports = async () => {
      try {
        const response = await victimReportApi.getAll();
        if (!response || !Array.isArray(response)) {
          throw new Error('Unexpected API response format for victim reports');
        }
        setVictimFeatures(response);
        console.log("Victim Reports Features on initial fetch:", response); 
        setError(null);
      } catch (err) {
        setError('Failed to load victim reports: ' + (err as Error).message);
        console.error('Victim reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVictimReports();

    // WebSocket connection with error handling
    let ws: WebSocket | null = null;
    
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      ws = new WebSocket(`${wsProtocol}localhost:8000/ws/reports/`);

      ws.onopen = () => {
        console.log('WebSocket connected for victim reports');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          if (message.type === 'report_message' && message.message) {
            const { action, data } = message.message;
            setVictimFeatures(prevFeatures => {
              if (action === 'created') {
                if (!prevFeatures.some(f => f.id === data.id)) {
                  return [...prevFeatures, data as GeoJSONFeature<VictimReportProperties, GeoJSONPoint>];
                }
              } else if (action === 'updated') {
                return prevFeatures.map(f => (f.id === data.id ? (data as GeoJSONFeature<VictimReportProperties, GeoJSONPoint>) : f));
              } else if (action === 'deleted') {
                return prevFeatures.filter(f => f.id !== data.id);
              }
              return prevFeatures;
            });
          }
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected for victim reports');
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection failed - continuing without real-time updates:', err);
      };
    } catch (wsError) {
      console.warn('Failed to establish WebSocket connection - continuing without real-time updates:', wsError);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="w-5 h-5 text-secondary-500" />;
      case 'triaged':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'rescued':
        return <Shield className="w-5 h-5 text-success-600" />;
      default:
        return <Users className="w-5 h-5 text-secondary-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'badge-yellow';
      case 'triaged':
        return 'badge-orange';
      case 'rescued':
        return 'badge-green';
      default:
        return 'badge-secondary';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'badge-red';
    if (priority >= 3) return 'badge-orange';
    if (priority >= 2) return 'badge-yellow';
    return 'badge-green';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return 'Critical';
    if (priority >= 3) return 'High';
    if (priority >= 2) return 'Medium';
    return 'Low';
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'new':
        return '#f97316'; // Orange
      case 'triaged':
        return '#eab308'; // Yellow
      case 'rescued':
        return '#22c55e'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (loading || !isLoaded) {
    return (
      <div className="victim-theme page-container">
        <div className="content-wrapper animate-fade-in">
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <div className="loading-text">Loading Victim Reports...</div>
          </div>
        </div>
      </div>
    );
  }

  const newReports = victimFeatures.filter(feature => feature.properties.status === 'new').length;
  const triagedReports = victimFeatures.filter(feature => feature.properties.status === 'triaged').length;
  const rescuedReports = victimFeatures.filter(feature => feature.properties.status === 'rescued').length;

  return (
    <div className="victim-theme page-container">
      <div className="content-wrapper animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div className="page-title">
            <Users size={48} />
            <span>Victim Reports</span>
          </div>
          <div className="page-actions">
            <button className="btn-theme" onClick={() => console.log('Add New Report')}>
              <Plus size={20} />
              Add Report
            </button>
            <button className="btn-theme-secondary" onClick={() => console.log('Filter Reports')}>
              <Filter size={20} />
              Filter
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
                <p className="text-sm font-medium text-gray-600 mb-1">Total Reports</p>
                <p className="text-3xl font-bold text-secondary-900">{victimFeatures.length}</p>
                <p className="text-xs text-gray-500 mt-1">All received victim reports</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Users className="w-8 h-8 text-secondary-600" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">New Reports</p>
                <p className="text-3xl font-bold text-warning-600">{newReports}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting triage</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <Clock className="w-8 h-8 text-warning-600" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Triaged</p>
                <p className="text-3xl font-bold text-primary-600">{triagedReports}</p>
                <p className="text-xs text-gray-500 mt-1">Being assessed by teams</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <ListTodo className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Rescued</p>
                <p className="text-3xl font-bold text-success-600">{rescuedReports}</p>
                <p className="text-xs text-gray-500 mt-1">Safe individuals</p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Shield className="w-8 h-8 text-success-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Map and Reports List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 map-container animate-fade-in delay-400">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                options={{ 
                  streetViewControl: false, 
                  mapTypeControl: false, 
                  fullscreenControl: false,
                  styles: [
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    },
                    {
                      featureType: "transit",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    },
                    {
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#5a5a5a" }]
                    },
                    {
                      featureType: "administrative",
                      elementType: "geometry",
                      stylers: [{ visibility: "off" }]
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
                    }
                  ]
                }}
              >
                {/* Render Victim Report Markers */}
                {victimFeatures.map((feature) => {
                  if (feature.geometry && feature.geometry.type === 'Point' && Array.isArray(feature.geometry.coordinates) && feature.geometry.coordinates.length >= 2) {
                    const position = {
                      lat: feature.geometry.coordinates[1],
                      lng: feature.geometry.coordinates[0],
                    };

                    return (
                      <Marker
                        key={feature.id}
                        position={position}
                        onClick={() => setSelectedMarker(feature.id)}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: getMarkerColor(feature.properties.status),
                          fillOpacity: 0.8,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }}
                      >
                        {selectedMarker === feature.id && (
                          <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                            <div className="p-3 max-w-xs text-text-primary">
                              <h3 className="font-semibold mb-2">Report #{feature.id}</h3>
                              <div className="space-y-1 text-sm text-text-secondary">
                                <p><strong>Phone:</strong> {feature.properties.phone}</p>
                                <p><strong>Address:</strong> {feature.properties.address || 'Address not available'}</p>
                                <p><strong>Status:</strong> 
                                  <span className={`ml-1 badge ${getStatusColor(feature.properties.status)}`}>
                                    {feature.properties.status.charAt(0).toUpperCase() + feature.properties.status.slice(1)}
                                  </span>
                                </p>
                                <p><strong>Priority:</strong> 
                                  <span className={`ml-1 badge ${getPriorityColor(feature.properties.priority)}`}>
                                    {getPriorityLabel(feature.properties.priority)}
                                  </span>
                                </p>
                                <p><strong>Reported:</strong> {new Date(feature.properties.reported_at).toLocaleString()}</p>
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    );
                  }
                  return null;
                })}
              </GoogleMap>
            ) : (
              <div className="loading-container"><Loader2 className="loading-spinner" /><div className="loading-text">Loading Map...</div></div>
            )}
          </div>

          {/* Victim Reports List */}
          <div className="section-content animate-slide-in-left delay-500">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-success-600" />
              Recent Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[40rem] overflow-y-auto p-4">
              {victimFeatures.map((feature) => (
                <ReportCard 
                  key={feature.id} 
                  report={feature}
                  onClick={() => setSelectedMarker(feature.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Selected Report Details (Optional: Can be combined with InfoWindow or a modal) */}
        {selectedMarker && (
          <div className="theme-card mt-6 animate-fade-in delay-600">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-success-600" />
              Selected Report Details
            </h3>
            {/* Details will be shown in InfoWindow, this is a placeholder if needed elsewhere */}
            <p className="text-text-secondary">Click on a marker or list item to view details in the map info window.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VictimReports;
