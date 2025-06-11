// layout.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import "../Style/layout.css";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);


  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  const handleRestrictedNav = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setShowMessage(true);
  };  
  const handleCloseMessage = () => setShowMessage(false);

  return (
    <div className="layout-container">
      {/* White container for header area */}
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "24px 32px",
          margin: "0px auto 0 auto",
          maxWidth: "100vw",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div className="header-container" style={{ background: "transparent", boxShadow: "none", margin: 0, padding: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ margin: 0, color: "#2c3e50" }}>{title}</h1>
          {/* Optional: Insert logo here */}
        </div>

        {/* Navigation inside white container */}
        <nav className="nav-bar" style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="nav-links-center">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Overview</NavLink>
            <NavLink to="/liquidity" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Liquidity & Cash</NavLink>
            {/* Restricted links */}
            <NavLink
              to="/receivables"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={handleRestrictedNav}
            >
              Account Receivables
            </NavLink>
            <NavLink
              to="/payables"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={handleRestrictedNav}
            >
              Account Payable
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={handleRestrictedNav}
            >
              Inventory
            </NavLink>
          </div>
          <NavLink to="/dashboard" className="home-button">Home</NavLink>
        </nav>
      </div>

      {/* Page Content */}
      <main>{children}</main>

      {/* Go To Top Button */}
      <button
        onClick={scrollToTop}
        className={`go-top-button ${isVisible ? 'visible' : ''}`}
        aria-label="Go to top"
      >
        &#8679;
      </button>

      {/* Message Modal */}
      {showMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={handleCloseMessage}
        >
          <div
            style={{
              background: '#fff',
              padding: '32px 24px',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              maxWidth: 350,
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ color: '#c0392b', fontWeight: 600, marginBottom: 12 }}>
              Not available in demo environment.
            </p>
            <p style={{ color: '#2d3a4a', marginBottom: 0 }}>
              Write to{' '}
              <a
                href="https://www.ajalabs.ai"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0072ce', textDecoration: 'underline', fontWeight: 500 }}
              >
                ajalabs
              </a>{' '}
              to discuss further.
            </p>
            <button
              onClick={handleCloseMessage}
              style={{
                marginTop: 18,
                padding: '6px 18px',
                borderRadius: 6,
                border: 'none',
                background: '#0072ce',
                color: '#fff',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;