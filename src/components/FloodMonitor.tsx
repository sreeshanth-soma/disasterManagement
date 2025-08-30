import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';

const FloodMonitor: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-8 h-8 text-red-600" />
        <h2 className="text-3xl font-bold text-gray-900">Flood Event Monitor</h2>
      </div>

      {/* Placeholder Content */}
      <div className="card">
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Flood Map</h3>
          <p className="text-gray-600 mb-4">
            This section will display real-time flood events on an interactive map using Leaflet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800">High Risk Areas</h4>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Medium Risk Areas</h4>
              <p className="text-2xl font-bold text-yellow-600">5</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Low Risk Areas</h4>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloodMonitor;