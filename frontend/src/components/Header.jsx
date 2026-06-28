import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Wifi, WifiOff, Home, LayoutDashboard, Map, Lightbulb, Siren, X } from 'lucide-react';
import { fetchMetadata } from '../services/api';

const Header = () => {
  const [apiConnected, setApiConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkApi = async () => {
      try {
        await fetchMetadata();
        setApiConnected(true);
      } catch (err) {
        setApiConnected(false);
      }
    };
    
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="top-header">
        <div className="brand-horizontal">
          <div className="brand-icon">📡</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="brand-title">TrafficPulse</div>
            <div className="brand-subtitle">v2.0</div>
          </div>
        </div>

        <button className="menu-btn" onClick={toggleMobileMenu} aria-label="Toggle Menu">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <nav className={`top-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            <Home size={18} /> <span className="nav-text">Architecture</span>
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            <LayoutDashboard size={18} /> <span className="nav-text">Overview</span>
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            <Map size={18} /> <span className="nav-text">Map</span>
          </NavLink>
          <NavLink to="/insights" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            <Lightbulb size={18} /> <span className="nav-text">Insights</span>
          </NavLink>
          <NavLink to="/dispatcher" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            <Siren size={18} /> <span className="nav-text">Dispatcher</span>
          </NavLink>
        </nav>
        
        <div className="header-right">
          <div className={`api-status ${apiConnected ? 'connected' : 'disconnected'}`}>
            {apiConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="api-status-text">{apiConnected ? 'API Connected' : 'Disconnected'}</span>
            <div className="status-dot"></div>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={closeMobileMenu}></div>
      )}
    </>
  );
};

export default Header;
