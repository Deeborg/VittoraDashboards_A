import React, { useState, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./ResponsiveSidebar.css";
import { 
  FaChartBar, 
  FaBook, 
  FaChartLine, 
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaCalendarAlt,
  FaInfoCircle,
  FaCog,
  FaEnvelope
} from "react-icons/fa";

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
  // const handleSidebarClick = () => {
  //   if (!expanded) setExpanded(true); // Only expand on click when collapsed
  // };

  const menuItems = [
    { path: "/dashboard", icon: <FaMoneyBillWave />, label: "Working Capital" },
    { path: "/summary", icon: <FaChartBar />, label: "Financial Snapshot" },
    { path: "/modules", icon: <FaBook />, label: "Key Modules" },
    { path: "/flux", icon: <FaChartLine  />, label: "Flux Analysis" },
    // { path: "/about", icon: <FaInfoCircle />, label: "About" },
    // { path: "/settings", icon: <FaCog />, label: "Service" },
    // { path: "/contact", icon: <FaEnvelope />, label: "Contact" },
  ];

  return (
    <div className="layout">
      {!shouldHideSidebar && (
        <aside
          className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
          style={{ width: expanded ? "250px" : "80px" }}
        >
          <div className="sidebar-header-container">
            {expanded && <h1 className="sidebar-title">Vittora</h1>}
            <button
              className="toggle-btn"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
          </div>

          {/* {expanded && ( */}
            <nav className="sidebar-nav">
              {menuItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              >
                <div className="nav-icon">{item.icon}</div>
                {expanded && <span className="nav-label">{item.label}</span>}
                {!expanded && (
                  <div className="nav-tooltip">{item.label}</div>
                )}
              </Link>
            ))}
            </nav>
          <div className="sidebar-footer">
            {expanded && (
              <div className="user-profile">
                <div className="profile-avatar">V</div>
                <div className="profile-info">
                  <span className="profile-name">AJALABS.AI</span>
                  <span className="profile-email">info@ajalabs.ai</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      <div className="main-content" style={{ marginLeft: shouldHideSidebar ? '0' : '' ,transition: 'margin-left 0.3s ease'}}>
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