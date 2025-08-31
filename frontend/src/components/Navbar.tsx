import React, { useState } from 'react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.classList.add('open');
    } else {
      document.body.classList.remove('open');
    }
  };

  const handleNavClick = (tab: string) => {
    onTabChange(tab);
    setIsMenuOpen(false); // Close menu on navigation
    document.body.classList.remove('open');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'floods', label: 'Flood Monitor' },
    { id: 'roads', label: 'Road Status' },
    { id: 'victims', label: 'Victim Reports' },
    { id: 'communications', label: 'Communications' }
  ];

  return (
    <div className="navbar-container">
      {/* Debug element to check if navbar is rendering */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '40px',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        🚨 DRCH - Navbar Active | Current: {activeTab}
      </div>

      <div className="background"></div>
      <nav className="navbar" style={{ top: '40px' }}>
        <div className="navbar-logo-container">
          <img
            className="navbar-logo"
            src="/assets/logo.png"
            alt="DRCH Logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="navbar-title">🚨 DRCH</span>
        </div>
        <input type="text" placeholder="Search" className="navbar-search" />
      </nav>
      <button className="navbar-burger" onClick={toggleMenu} style={{ top: '40px' }}></button>
      <nav className="menu">
        {menuItems.map((item, index) => (
          <a
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(item.id);
            }}
            className={activeTab === item.id ? 'active' : ''}
            style={{ animationDelay: `${(index + 1) * 0.1}s` }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default Navbar;
