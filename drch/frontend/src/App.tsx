import { useState } from 'react';
import './styles/Navbar.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FloodDashboard from './components/FloodDashboard';
import RoadStatus from './components/RoadStatus';
import VictimReports from './components/VictimReports';
import SocialMediaAlerts from './components/SocialMediaAlerts';
import { useJsApiLoader } from '@react-google-maps/api';

type TabType = 'dashboard' | 'floods' | 'roads' | 'victims' | 'communications' | 'social-media';

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["maps"];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-main',
    googleMapsApiKey: apiKey || '',
    libraries: libraries,
  });

  // Check if API key is missing or has billing issues
  const isApiKeyMissing = !apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
  const hasBillingError = loadError?.message?.includes('BillingNotEnabledMapError') || 
                         loadError?.message?.includes('billing');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'floods':
        return <FloodDashboard 
          onAlertClick={(id) => console.log('Alert clicked for:', id)}
          onEvacuationOrder={(zones) => console.log('Evacuation ordered for zones:', zones)}
          isLoaded={isLoaded}
          loadError={loadError || (isApiKeyMissing ? new Error('Google Maps API key not configured') : 
                     hasBillingError ? new Error('Google Cloud billing not enabled') : undefined)}
        />;
      case 'roads':
        return <RoadStatus isLoaded={isLoaded} loadError={loadError || (isApiKeyMissing ? new Error('Google Maps API key not configured') : undefined)} />;
      case 'victims':
        return <VictimReports isLoaded={isLoaded} loadError={loadError || (isApiKeyMissing ? new Error('Google Maps API key not configured') : undefined)} />;
      case 'social-media':
        return <SocialMediaAlerts />;
      case 'communications':
        return <div className="text-center p-8"><h2 className="text-2xl font-bold text-gray-600">Communications Module Coming Soon</h2></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Navbar-3 Style Navigation */}
      <Navbar activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as TabType)} />

      {/* Main Content */}
      <main style={{
        paddingTop: '72px', // Height of navbar
        minHeight: '100vh',
        background: '#f8fafc',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
};

export default App;
