import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Clock, Shield, Phone, MapPin } from 'lucide-react';
import { victimReportApi } from '../services/api';
import type { VictimReport } from '../types';

const VictimReports: React.FC = () => {
  const [victimReports, setVictimReports] = useState<VictimReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVictimReports = async () => {
      try {
        const response = await victimReportApi.getAll();
        setVictimReports(response.data.results);
        setError(null);
      } catch (err) {
        setError('Failed to load victim reports');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'triaged':
        return 'bg-orange-100 text-orange-800';
      case 'rescued':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const newReports = victimReports.filter(report => report.status === 'new').length;
  const triagedReports = victimReports.filter(report => report.status === 'triaged').length;
  const rescuedReports = victimReports.filter(report => report.status === 'rescued').length;

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
              <p className="text-2xl font-bold text-gray-900">{victimReports.length}</p>
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

      {/* Victim Reports List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div className="space-y-4">
          {victimReports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(report.status)}
                  <h4 className="font-medium text-gray-900">Report #{report.id}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                    {getPriorityLabel(report.priority)}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{report.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">
                      {report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">Reported:</span>
                    <span className="ml-2 font-medium">{new Date(report.reported_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Needs:</span>
                    <div className="mt-1">
                      {Object.keys(report.needs).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(report.needs).map(([key, value]) => (
                            <span key={key} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No specific needs reported</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="btn-primary text-sm">
                  View Details
                </button>
                {report.status === 'new' && (
                  <button className="btn-warning text-sm">
                    Start Triage
                  </button>
                )}
                {report.status === 'triaged' && (
                  <button className="btn-danger text-sm">
                    Mark Rescued
                  </button>
                )}
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VictimReports;
