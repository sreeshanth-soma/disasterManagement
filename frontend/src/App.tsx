import { useState } from 'react';
import './App.css';
import './styles/Navbar.css'; // Import the new Navbar CSS

// Import our components
import Navbar from './components/Navbar'; // Import the new Navbar
import Dashboard from './components/Dashboard';
import FloodMonitor from './components/FloodMonitor';
import RoadStatus from './components/RoadStatus';
import VictimReports from './components/VictimReports';

type TabType = 'dashboard' | 'floods' | 'roads' | 'victims' | 'communications';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'floods':
        return <FloodMonitor />;
      case 'roads':
        return <RoadStatus />;
      case 'victims':
        return <VictimReports />;
      case 'communications':
        return <div className="text-center p-8"><h2 className="text-2xl font-bold text-gray-600">Communications Module Coming Soon</h2></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* New Navbar */}
      <Navbar activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as TabType)} />

      {/* Main Content */}
      <main style={{
        paddingTop: '72px', // Height of the new navbar
        minHeight: '100vh',
        background: '#f8fafc',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
}

export default App;
