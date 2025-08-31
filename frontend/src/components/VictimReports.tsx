import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Users, AlertTriangle, Clock, Shield } from 'lucide-react';
import { victimReportApi, extractGeoJSONData } from '../services/api';
import { parsePointGeometry } from '../utils/geometryParser';
import ModernCard from './ModernCard';
import type { GeoJSONFeature, VictimReportProperties } from '../types';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 40.714, // New York City - closer to actual data
  lng: -74.003, // New York City - closer to actual data
};

const VictimReports: React.FC = () => {
  const [victimFeatures, setVictimFeatures] = useState<GeoJSONFeature<VictimReportProperties>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<GeoJSONFeature<VictimReportProperties> | null>(null);

  // Retrieve API key from environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-victims',
    googleMapsApiKey: apiKey || '',
    // Note: Using classic Marker API (deprecated Feb 2024, but supported for 12+ months)
    // TODO: Migrate to AdvancedMarkerElement when @react-google-maps/api supports it
  });

  useEffect(() => {
    const fetchVictimReports = async () => {
      try {
        const response = await victimReportApi.getAll();
        // Extract GeoJSON data from API response
        const geoJSONData = extractGeoJSONData<VictimReportProperties>(response);
        const features = geoJSONData?.features || [];
        setVictimFeatures(features);
        console.log("Victim Reports Features:", features);
        setError(null);
      } catch (err: any) {
        setError('Failed to load victim reports: ' + (err?.message || 'Unknown error'));
        console.error('Victim reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVictimReports();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'triaged':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'rescued':
        return <Shield className="w-5 h-5 text-green-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };



  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'bg-red-100 text-red-800';
    if (priority >= 3) return 'bg-orange-100 text-orange-800';
    if (priority >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return 'Critical';
    if (priority >= 3) return 'High';
    if (priority >= 2) return 'Medium';
    return 'Low';
  };

  // Action handlers
  const handleViewDetails = (feature: GeoJSONFeature<VictimReportProperties>) => {
    setSelectedMarker(feature);
    // You can add more detailed view logic here
    console.log('Viewing details for report:', feature.id);
  };

  const handleStartTriage = async (feature: GeoJSONFeature<VictimReportProperties>) => {
    try {
      console.log('Starting triage for report:', feature.id);
      // Here you would typically call an API to update the status
      // await victimReportApi.update(feature.id, { ...feature.properties, status: 'triaged' });
      // Then refresh the data
      alert(`Started triage for Report #${feature.id}`);
    } catch (error) {
      console.error('Error starting triage:', error);
      alert('Failed to start triage');
    }
  };

  const handleMarkRescued = async (feature: GeoJSONFeature<VictimReportProperties>) => {
    try {
      console.log('Marking as rescued for report:', feature.id);
      // Here you would typically call an API to update the status
      // await victimReportApi.update(feature.id, { ...feature.properties, status: 'rescued' });
      // Then refresh the data
      alert(`Marked Report #${feature.id} as rescued!`);
    } catch (error) {
      console.error('Error marking as rescued:', error);
      alert('Failed to mark as rescued');
    }
  };

  const handleViewOnMap = (feature: GeoJSONFeature<VictimReportProperties>) => {
    const position = parsePointGeometry(feature.geometry as unknown as string);
    if (position) {
      setSelectedMarker(feature);
      // You could also center the map on this location
      console.log('Viewing on map:', position);
    }
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (loading || !isLoaded) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-lg text-gray-700">Loading Map...</p>
    </div>
  );

  const newReports = victimFeatures.filter(feature => feature.properties.status === 'new').length;
  const triagedReports = victimFeatures.filter(feature => feature.properties.status === 'triaged').length;
  const rescuedReports = victimFeatures.filter(feature => feature.properties.status === 'rescued').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Victim Reports</h2>
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
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{victimFeatures.length}</p>
            </div>
            <Users className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-yellow-600">{newReports}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{triagedReports}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rescued</p>
              <p className="text-2xl font-bold text-green-600">{rescuedReports}</p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Map and Reports List */}
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
                {/* Render Victim Report Markers */}
                {victimFeatures.map((feature) => {
                  // Parse the SRID geometry string
                  const position = parsePointGeometry(feature.geometry as unknown as string);
                  
                  if (position) {
                    return (
                      <Marker
                        key={feature.id}
                        position={position}
                        title={`Report #${feature.id} - ${feature.properties.status}`}
                        onClick={() => setSelectedMarker(feature)}
                      />
                    );
                  } else {
                    console.warn(`Failed to parse geometry for feature ${feature.id}:`, feature.geometry);
                  }
                  return null;
                })}

                {/* InfoWindow for selected marker */}
                {selectedMarker && (() => {
                  const position = parsePointGeometry(selectedMarker.geometry as unknown as string);
                  return position ? (
                    <InfoWindow
                      position={position}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="p-2 max-w-xs">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(selectedMarker.properties.status)}
                          <h3 className="font-semibold text-gray-900">Report #{selectedMarker.id}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedMarker.properties.priority)}`}>
                            {getPriorityLabel(selectedMarker.properties.priority)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Status:</strong> {selectedMarker.properties.status}</div>
                          <div><strong>Phone:</strong> {selectedMarker.properties.phone}</div>
                          <div><strong>Address:</strong> {selectedMarker.properties.address}</div>
                          <div><strong>Reported:</strong> {new Date(selectedMarker.properties.reported_at).toLocaleString()}</div>
                          {selectedMarker.properties.needs && Object.keys(selectedMarker.properties.needs).length > 0 && (
                            <div>
                              <strong>Needs:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(selectedMarker.properties.needs).map(([key, value]) => (
                                  value && <span key={key} className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">{key}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </InfoWindow>
                  ) : null;
                })()}
              </GoogleMap>
            ) : (
              <div>Loading Map...</div>
            )
          }
        </div>

        {/* Victim Reports List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="space-y-4">
            {victimFeatures.map((feature) => {
              const position = parsePointGeometry(feature.geometry as unknown as string);
              const needsTags = Object.entries(feature.properties.needs || {})
                .filter(([_, value]) => value)
                .map(([key, _]) => ({ label: key }));

              return (
                <ModernCard
                  key={feature.id}
                  title={`Report #${feature.id}`}
                  subtitle={feature.properties.address}
                  status={feature.properties.status}
                  priority={getPriorityLabel(feature.properties.priority).toLowerCase() as any}
                  icon={Users}
                  statusIcon={getStatusIcon(feature.properties.status)}
                  timestamp={feature.properties.reported_at}
                  location={position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : 'N/A'}
                  details={[
                    { label: 'Phone', value: feature.properties.phone },
                    { label: 'Priority', value: getPriorityLabel(feature.properties.priority) },
                  ]}
                  tags={needsTags}
                  actions={[
                    { label: 'View Details', onClick: () => handleViewDetails(feature), variant: 'primary' },
                    ...(feature.properties.status === 'new' ? [{ 
                      label: 'Start Triage', 
                      onClick: () => handleStartTriage(feature), 
                      variant: 'warning' as const 
                    }] : []),
                    ...(feature.properties.status === 'triaged' ? [{ 
                      label: 'Mark Rescued', 
                      onClick: () => handleMarkRescued(feature), 
                      variant: 'danger' as const 
                    }] : []),
                    { label: 'View on Map', onClick: () => handleViewOnMap(feature), variant: 'secondary' },
                  ]}
                  onClick={() => handleViewDetails(feature)}
                  isSelected={selectedMarker?.id === feature.id}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictimReports;
