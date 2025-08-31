import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Users, Navigation, Shield, Activity, MapPin, Loader2, Droplets } from 'lucide-react';
import { dashboardApi } from '../services/api';
import type { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeFloodEvents: 0,
    blockedRoads: 0,
    pendingReports: 0,
    rescuedVictims: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    const interval = setInterval(fetchStats, 30000); // Refresh stats every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-theme page-container">
        <div className="content-wrapper animate-fade-in">
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <div className="loading-text">Loading Dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-theme page-container">
      <div className="content-wrapper animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div className="page-title">
            <BarChart3 size={48} />
            <span>Emergency Operations Dashboard</span>
          </div>
          <div className="page-actions">
            <button className="btn-theme group">
              <TrendingUp size={20} className="group-hover:animate-pulse" />
              Analytics
            </button>
            <button className="btn-theme-secondary group">
              <Activity size={20} className="group-hover:animate-spin-slow" />
              Real-time
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger animate-fade-in">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Key Metrics */}
        <div className="stats-grid">
          <div className="stat-card animate-slide-in-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Flood Events</p>
                <p className="text-3xl font-bold text-disaster-600">{stats.activeFloodEvents}</p>
                <p className="text-xs text-gray-500 mt-1">Critical incidents requiring attention</p>
              </div>
              <div className="p-3 bg-disaster-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-disaster-600 animate-pulse-effect" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Blocked Roads</p>
                <p className="text-3xl font-bold text-warning-600">{stats.blockedRoads}</p>
                <p className="text-xs text-gray-500 mt-1">Roads affected by flooding</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <Navigation className="w-8 h-8 text-warning-600" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Reports</p>
                <p className="text-3xl font-bold text-secondary-500">{stats.pendingReports}</p>
                <p className="text-xs text-gray-500 mt-1">Victim reports awaiting response</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Users className="w-8 h-8 text-secondary-500" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-in-left delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Rescued Victims</p>
                <p className="text-3xl font-bold text-success-600">{stats.rescuedVictims}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully rescued individuals</p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Shield className="w-8 h-8 text-success-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="theme-card animate-fade-in delay-400">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-disaster-600" />
              Emergency Response
            </h3>
            <div className="space-y-3">
              <button className="w-full btn-theme bg-disaster-600 hover:bg-disaster-700">
                <AlertTriangle size={20} />
                Activate Emergency Protocol
              </button>
              <button className="w-full btn-theme-secondary border-disaster-600 text-disaster-600 hover:bg-disaster-600 hover:text-white">
                <Users size={20} />
                Deploy Rescue Teams
              </button>
              <button className="w-full btn-theme-secondary border-warning-600 text-warning-600 hover:bg-warning-600 hover:text-white">
                <Navigation size={20} />
                Update Road Closures
              </button>
            </div>
          </div>

          <div className="theme-card animate-fade-in delay-500">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary-600" />
              Monitoring Tools
            </h3>
            <div className="space-y-3">
              <button className="w-full btn-theme bg-primary-600 hover:bg-primary-700" onClick={() => console.log('View Flood Monitor')}>
                <Droplets size={20} />
                View Flood Monitor
              </button>
              <button className="w-full btn-theme bg-primary-600 hover:bg-primary-700" onClick={() => console.log('Check Road Status')}>
                <Navigation size={20} />
                Check Road Status
              </button>
              <button className="w-full btn-theme bg-primary-600 hover:bg-primary-700" onClick={() => console.log('Review Victim Reports')}>
                <Users size={20} />
                Review Victim Reports
              </button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="theme-card animate-fade-in delay-600">
          <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary-600" />
            System Status Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success-50 rounded-lg animate-pulse-effect">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-8 h-8 text-success-600" />
              </div>
              <h4 className="font-semibold text-text-primary">Monitoring Systems</h4>
              <p className="text-sm text-success-600 font-medium">Operational</p>
              <p className="text-xs text-gray-500 mt-1">All sensors active</p>
            </div>
            
            <div className="text-center p-4 bg-primary-50 rounded-lg animate-pulse-effect delay-100">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="font-semibold text-text-primary">GPS Tracking</h4>
              <p className="text-sm text-primary-600 font-medium">Active</p>
              <p className="text-xs text-gray-500 mt-1">12 units deployed</p>
            </div>
            
            <div className="text-center p-4 bg-secondary-50 rounded-lg animate-pulse-effect delay-200">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-secondary-500" />
              </div>
              <h4 className="font-semibold text-text-primary">Communication</h4>
              <p className="text-sm text-warning-600 font-medium">Partial</p>
              <p className="text-xs text-gray-500 mt-1">2 towers down</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="theme-card mt-6 animate-fade-in delay-700">
          <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-disaster-50 rounded-lg border-l-4 border-disaster-500 animate-slide-in-left">
              <AlertTriangle className="w-5 h-5 text-disaster-600" />
              <div className="flex-1">
                <p className="font-medium text-text-primary">New flood event detected</p>
                <p className="text-sm text-gray-600">Downtown Financial District - High confidence</p>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-success-50 rounded-lg border-l-4 border-success-500 animate-slide-in-left delay-100">
              <Shield className="w-5 h-5 text-success-600" />
              <div className="flex-1">
                <p className="font-medium text-text-primary">Victim successfully rescued</p>
                <p className="text-sm text-gray-600">Central Park West - Priority 3</p>
              </div>
              <span className="text-xs text-gray-500">5 min ago</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-warning-50 rounded-lg border-l-4 border-warning-500 animate-slide-in-left delay-200">
              <Navigation className="w-5 h-5 text-warning-600" />
              <div className="flex-1">
                <p className="font-medium text-text-primary">Road closure updated</p>
                <p className="text-sm text-gray-600">Brooklyn Bridge - Status: Blocked</p>
              </div>
              <span className="text-xs text-gray-500">8 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
