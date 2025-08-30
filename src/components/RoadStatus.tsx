import React from 'react';
import { Navigation, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const RoadStatus: React.FC = () => {
  // Mock data for demonstration
  const roadData = [
    { id: 1, name: 'Highway 101', status: 'normal', lastChecked: '2 mins ago' },
    { id: 2, name: 'Main Street', status: 'flooded', lastChecked: '5 mins ago' },
    { id: 3, name: 'Oak Avenue', status: 'blocked', lastChecked: '1 min ago' },
    { id: 4, name: 'River Road', status: 'normal', lastChecked: '3 mins ago' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'flooded':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Navigation className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'flooded':
        return 'bg-red-100 text-red-800';
      case 'blocked':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Navigation className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-900">Road Status Monitor</h2>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roads</p>
              <p className="text-2xl font-bold text-gray-900">{roadData.length}</p>
            </div>
            <Navigation className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Normal</p>
              <p className="text-2xl font-bold text-green-600">
                {roadData.filter(road => road.status === 'normal').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Flooded</p>
              <p className="text-2xl font-bold text-red-600">
                {roadData.filter(road => road.status === 'flooded').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked</p>
              <p className="text-2xl font-bold text-orange-600">
                {roadData.filter(road => road.status === 'blocked').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Road List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Road Segments</h3>
        <div className="space-y-3">
          {roadData.map((road) => (
            <div key={road.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(road.status)}
                <div>
                  <h4 className="font-medium text-gray-900">{road.name}</h4>
                  <p className="text-sm text-gray-500">Last checked: {road.lastChecked}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(road.status)}`}>
                {road.status.charAt(0).toUpperCase() + road.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadStatus;