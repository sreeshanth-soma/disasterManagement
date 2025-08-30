import React, { useState, useEffect } from 'react';
import { AlertTriangle, Navigation, Users, Shield, TrendingUp, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data for now since we don't have API integration yet
  const stats = {
    activeFloodEvents: 3,
    blockedRoads: 7,
    pendingReports: 12,
    rescuedVictims: 25,
  };

  const statCards = [
    {
      title: 'Active Flood Events',
      value: stats.activeFloodEvents,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Currently detected flooding areas',
    },
    {
      title: 'Blocked Roads',
      value: stats.blockedRoads,
      icon: Navigation,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Roads affected by flooding',
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Victim reports awaiting response',
    },
    {
      title: 'Rescued Victims',
      value: stats.rescuedVictims,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Successfully rescued individuals',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Emergency Dashboard</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last updated: {currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Django Backend</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">PostGIS Database</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Real-time Updates</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Report New Flood Event
            </button>
            <button className="w-full btn-warning text-left">
              <Navigation className="w-4 h-4 inline mr-2" />
              Update Road Status
            </button>
            <button className="w-full btn-danger text-left">
              <Users className="w-4 h-4 inline mr-2" />
              Add Victim Report
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">98%</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">System Uptime</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">2.3s</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Avg Response Time</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">24/7</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;