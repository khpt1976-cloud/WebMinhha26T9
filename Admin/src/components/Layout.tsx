import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
        setMobileMenuOpen(false);
      } else {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };



  const handleOverlayClick = () => {
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={handleOverlayClick}></div>
      )}
      
      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header 
          onToggleSidebar={handleSidebarToggle}
        />
        
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
        
        <footer className="admin-footer">
          <div className="footer-content">
            <div className="footer-left">
              <p>&copy; 2025 Cửa Hàng Minh Hà. All rights reserved.</p>
            </div>
            <div className="footer-right">
              <span>Admin Panel v1.0.0</span>
              <span className="separator">|</span>
              <span>Phát triển bởi OpenHands AI</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;