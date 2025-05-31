import React, { useState, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./ResponsiveSidebar.css";
import { FaChartBar, FaBook, FaChartLine, FaMoneyBillWave } from "react-icons/fa";
interface Props {
  children: ReactNode;
}

export default function ResponsiveSidebar({ children }: Props) {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const isSummaryPage = location.pathname === "/summary" || location.pathname === "/summary/";
  const shouldHideSidebar = isHomePage || isSummaryPage;

  // We'll keep the handleSidebarClick, but the button will be the primary expand trigger
  const handleSidebarClick = () => {
    if (!expanded) setExpanded(true); // Only expand on click when collapsed
  };

  return (
    <div className="layout">
      {!shouldHideSidebar && (
        <aside
          className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
          onClick={handleSidebarClick} // Still allows click to expand if they miss the button
        >
          <div className="sidebar-header-container">
            {expanded && <h1 className="sidebar-title">Vittora</h1>}
            <div className="toggle-container">
              {expanded ? (
                <button
                  className="toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent sidebar from expanding again
                    setExpanded(false);
                  }}
                >
                  ⏴ {/* Collapse icon */}
                </button>
              ) : (
                <button
                  className="expand-btn" // New class for the expand button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the sidebar's general click handler
                    setExpanded(true);
                  }}
                >
                  ⏵ {/* Expand icon */}
                </button>
              )}
            </div>
          </div>

          {expanded && (
            <nav className="sidebar-nav">
              <Link to="/summary" className={isSummaryPage ? "active" : ""}>
                📊 Financial Snapshot
              </Link>
              <Link to="/modules" className={location.pathname === "/modules" ? "active" : ""}>
                📚 Key Modules
              </Link>
              <Link to="/flux" className={location.pathname === "/flux" ? "active" : ""}>
                📈 Flux Analysis
              </Link>
              <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
                💰 Working Capital
              </Link>
            </nav>
          )}
        </aside>
      )}

      <div className="main-content" style={{ marginLeft: shouldHideSidebar ? '0' : '' }}>
        <img
          src=".\asset\ajalabs_black.png"
          alt="Logo"
          className="global-logo"
        />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}