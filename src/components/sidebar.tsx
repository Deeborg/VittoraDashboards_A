import React, { useState, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./ResponsiveSidebar.css";
import {
  FaChartBar,
  FaBook,
  FaUser,
  FaChartLine,
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
  FaProjectDiagram,
  FaTools,
  FaLayerGroup,
  FaTruck,
  FaHome,
  FaTachometerAlt, // Ensure this is exactly here
  FaThLarge        // Adding this as a backup dashboard icon
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

  // Main menu items
  const mainMenu = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/summary", icon: <FaChartBar />, label: "Financial Snapshot" },
    { path: "/modules", icon: <FaBook />, label: "Key Modules" },
    { path: "/trial-balance", icon: <FaMoneyBillWave />, label: "Trial Balance" },
    { path: "/analytics", icon: <FaTachometerAlt />, label: "Financial Dashboards" },
  ];

  // Modules submenu
  const modulesMenu = [
    { moduleId: "finance", icon: <FaProjectDiagram />, label: "FP&A" },
    { moduleId: "autm", icon: <FaTools />, label: "AuTM" },
    { moduleId: "commercial", icon: <FaLayerGroup />, label: "CPX" },
    { moduleId: "scm", icon: <FaTruck />, label: "SCM" },
  ];

  const handleModuleMenuClick = (moduleId: string) => {
    navigate("/modules", { state: { scrollToModule: moduleId } });
  };

  const isModuleActive = (moduleId: string) => {
    if (location.pathname === "/modules") {
      if (location.state && location.state.scrollToModule === moduleId) return true;
    }
    return false;
  };

  return (
    <div className="layout">
      {!shouldHideSidebar && (
        <aside
          className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
          style={{ width: expanded ? "250px" : "80px" }}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <div className="sidebar-header-container">
            {expanded && <h1 className="sidebar-title">Vittora</h1>}
            <button
              className="toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
          </div>

          <nav className="sidebar-nav">
            {mainMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              >
                <div className="nav-icon">{item.icon}</div>
                {expanded && <span className="nav-label">{item.label}</span>}
                {!expanded && <div className="nav-tooltip">{item.label}</div>}
              </Link>
            ))}

            <div
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                margin: "18px 0 10px 0",
                padding: expanded ? "10px 0" : "4px 0",
                background: expanded ? "#2C3E50" : "transparent",
                transition: "all 0.2s",
                boxShadow: expanded ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: expanded ? "15px" : "0px",
                  color: "#fff",
                  padding: expanded ? "0 18px 6px 18px" : "0",
                  letterSpacing: "0.5px",
                  opacity: expanded ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
              >
                Modules
              </div>
              {modulesMenu.map((mod) => (
                <div
                  key={mod.moduleId}
                  className={`nav-item sub-nav-item${isModuleActive(mod.moduleId) ? " active" : ""}`}
                  style={{
                    paddingLeft: expanded ? "18px" : "0",
                    fontSize: expanded ? "14px" : "0px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: expanded ? "flex-start" : "center",
                    opacity: expanded ? 1 : 1,
                    cursor: "pointer",
                    transition: "opacity 0.2s, font-size 0.2s, justify-content 0.2s",
                  }}
                  onClick={() => handleModuleMenuClick(mod.moduleId)}
                >
                  <div className="nav-icon">{mod.icon}</div>
                  {expanded && <span style={{ marginLeft: 8 }}>{mod.label}</span>}
                  {!expanded && <div className="nav-tooltip">{mod.label}</div>}
                </div>
              ))}
            </div>
          </nav>
          
          <div className="sidebar-footer">
            <a
              href="https://www.ajalabs.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className={`nav-item ${!expanded ? "collapsed" : ""}`}
            >
              <div className="nav-icon">
                <FaUser />
              </div>
              {expanded && (
                <div className="profile-info">
                  <span className="profile-name">AJALABS.AI</span>
                  <span className="profile-email">info@ajalabs.ai</span>
                </div>
              )}
              {!expanded && <div className="nav-tooltip">AJALABS.AI</div>}
            </a>
          </div>
        </aside>
      )}

      <div className="main-content" style={{ marginLeft: shouldHideSidebar ? '0' : (expanded ? '250px' : '80px'), transition: 'margin-left 0.3s ease' }}>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}