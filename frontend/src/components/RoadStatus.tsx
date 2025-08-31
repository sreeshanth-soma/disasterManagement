import { useState, useEffect } from 'react';
import { Navigation, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { roadSegmentApi } from '../services/api';
import type { GeoJSONFeature, RoadSegmentProperties } from '../types';

const RoadStatus: React.FC = () => {
  const [roadFeatures, setRoadFeatures] = useState<GeoJSONFeature<RoadSegmentProperties>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadSegments = async () => {
      try {
        const response = await roadSegmentApi.getAll();
        setRoadFeatures(response.data.features);
        setError(null);
      } catch (err) {
        setError('Failed to load road segments');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

      {/* Road Segments List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Road Segments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OSM ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roadFeatures.map((feature) => (
                <tr key={feature.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {feature.properties.osm_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(feature.properties.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feature.properties.status)}`}>
                        {feature.properties.status.charAt(0).toUpperCase() + feature.properties.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(feature.properties.last_checked).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Update
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoadStatus;
