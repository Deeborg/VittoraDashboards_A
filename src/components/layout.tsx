// layout.tsx
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import "../Style/layout.css";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <div className="layout-container"> {/* Optional container for layout styles */}
      {/* Header */}
      <div className="header-container">
        <h1>{title}</h1>
        {/* <img src=".\asset\logo-Picsart-BackgroundRemover.jpg" alt="Logo" width={100} /> */}
      </div>

      {/* Navigation */}
      <nav className="nav-bar">
        {/* ... your navigation links ... */}
        <div className="nav-links-center">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Overview</NavLink>
          <NavLink to="/liquidity" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Liquidity & Cash</NavLink>
          <NavLink to="/receivables" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Account Receivables</NavLink>
          <NavLink to="/payables" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Account Payable</NavLink>
          <NavLink to="/inventory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Inventory</NavLink>
        </div>
        <NavLink to="/dashboard" className="home-button">Home</NavLink>
      </nav>

      {/* Page Content */}
      <main>{children}</main>

      {/* Go To Top Button (Integrated here) */}
      <button
        onClick={scrollToTop}
        className={`go-top-button ${isVisible ? 'visible' : ''}`}
        aria-label="Go to top"
      >
        &#8679;
      </button>
    </div>
  );
};

export default Layout;