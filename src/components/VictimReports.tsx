import React from 'react';
import { Users, Clock, AlertTriangle, Shield, Phone, MapPin } from 'lucide-react';

const VictimReports: React.FC = () => {
  // Mock data for demonstration
  const reports = [
    {
      id: 1,
      phone: '+1 (555) 123-4567',
      status: 'new',
      priority: 'high',
      location: 'Downtown Area',
      reportedAt: '10 mins ago',
      needs: ['Medical Aid', 'Food']
    },
    {
      id: 2,
      phone: '+1 (555) 987-6543',
      status: 'triaged',
      priority: 'medium',
      location: 'Riverside District',
      reportedAt: '25 mins ago',
      needs: ['Shelter', 'Water']
    },
    {
      id: 3,
      phone: '+1 (555) 456-7890',
      status: 'rescued',
      priority: 'low',
      location: 'North Bridge',
      reportedAt: '1 hour ago',
      needs: ['Transportation']
    },
  ];

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Users className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-900">Victim Reports</h2>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <Users className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'new').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">
                {reports.filter(r => r.status === 'triaged').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rescued</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'rescued').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(report.status)}
                  <h4 className="font-medium text-gray-900">Report #{report.id}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                    {report.priority.toUpperCase()}
                  </span>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(report.status)}`}>
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
                    <span className="font-medium">{report.location}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">Reported:</span>
                    <span className="ml-2 font-medium">{report.reportedAt}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Needs:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {report.needs.map((need, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="btn-primary text-sm">View Details</button>
                {report.status === 'new' && (
                  <button className="btn-warning text-sm">Start Triage</button>
                )}
                {report.status === 'triaged' && (
                  <button className="btn-danger text-sm">Mark Rescued</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VictimReports;