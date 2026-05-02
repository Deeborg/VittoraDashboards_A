import React, { useState, ReactNode, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./ResponsiveSidebar.css";
import {
  FaChartBar,
  FaBook,
  FaUser,
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
  FaProjectDiagram,
  FaTools,
  FaLayerGroup,
  FaTruck,
  FaHome,
  FaTachometerAlt,
} from "react-icons/fa";
import { TbDeviceAnalytics } from "react-icons/tb";

interface Props {
  children: ReactNode;
}

export default function ResponsiveSidebar({ children }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [openMenus, setOpenMenus] = useState<any>({});
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const isSummaryPage =
    location.pathname === "/summary" || location.pathname === "/summary/";
  const shouldHideSidebar = isHomePage || isSummaryPage;

  const mainMenu = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/summary", icon: <FaChartBar />, label: "Financial Snapshot" },
    { path: "/modules", icon: <FaBook />, label: "Key Modules" },
    { path: "/trial-balance", icon: <FaMoneyBillWave />, label: "Trial Balance" },
    { path: "http://localhost:9002", icon: <TbDeviceAnalytics />, label: "Forecast simulation" },
  ];

  const modulesMenu = [
    {
      label: "FP&A",
      icon: <FaProjectDiagram />,
      children: [
        {
          label: "Forecast Intelligence",
          children: [
            { label: "Forecast", path: "/forecast" },
            { label: "Scenario Analysis", path: "/scenario" },
            { label: "Flux Analysis", path: "/flux" },
          ],
        },
        {
          label: "Profitability Intelligence",
          children: [
            { label: "ROI", path: "/roi" },
            { label: "Sentiment Analysis", path: "/sentiment" },
          ],
        },
        {
          label: "Strategic Metrics",
          children: [{ label: "ESG", path: "/esg" }],
        },
        {
          label: "Financial Monitoring",
          children: [
            { label: "Sales Analytics", path: "/sales" },
            { label: "Expense Analytics", path: "/expense" },
            { label: "Ageing (AR/AP)", path: "/ageing" },
            { label: "Investor Relations", path: "/investor" },
            { label: "Exception Reporting", path: "/exception" },
          ],
        },
      ],
    },
    {
      label: "AuTM",
      icon: <FaTools />,
      children: [
        { label: "Working Capital Optimization", path: "/dashboard" },
        { label: "Forex & Risk Analytics", path: "/forex" },
        {
          label: "Capital Strategy Intelligence",
          children: [
            { label: "Treasury", path: "/treasury" },
            { label: "Loans & Borrowing", path: "/loans" },
          ],
        },
      ],
    },
    {
      label: "SCM",
      icon: <FaTruck />,
      children: [
        { label: "Demand Forecasting", path: "/demand" },
        { label: "Procurement Planning", path: "/procurement" },
        { label: "Production Planning", path: "/production" },
        { label: "Inventory Management", path: "/inventory" },
        {
          label: "Supply Chain Finance",
          children: [{ label: "Fixed Assets", path: "/fixed-assets" }],
        },
      ],
    },
    {
      label: "CPX",
      icon: <FaLayerGroup />,
      children: [
        { label: "Customer Intelligence", path: "/customer" },
        { label: "Pricing Optimization", path: "/pricing" },
        { label: "Discount Strategy", path: "/discount" },
        { label: "Promotion Analytics", path: "/promotion" },
        {
          label: "Commercial Governance",
          children: [
            { label: "Related Party Transactions", path: "/related-party" },
            { label: "Compliance & Risk Management", path: "/compliance" },
          ],
        },
      ],
    },
  ];

  useEffect(() => {
    const newOpenMenus: any = {};

    const openParents = (items: any[]) => {
      items.forEach((item) => {
        if (item.children) {
          item.children.forEach((child: any) => {
            if (child.path === location.pathname) {
              newOpenMenus[item.label] = true;
            }
          });
          openParents(item.children);
        }
      });
    };

    openParents(modulesMenu);
    setOpenMenus((prev: any) => ({ ...prev, ...newOpenMenus }));
  }, [location.pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev: any) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderMenu = (items: any[], level = 0) => {
    return items.map((item, index) => {
      const isOpen = openMenus[item.label];
      const isActive = location.pathname === item.path;

      return (
        <div key={index}>
          <div
            className={`premium-item ${isActive ? "active" : ""}`}
            style={{
              paddingLeft: expanded ? `${12 + level * 12}px` : "0",
            }}
            onClick={() => {
              if (item.children) toggleMenu(item.label);
              else if (item.path) navigate(item.path);
            }}
          >
            {level === 0 && <div className="nav-icon">{item.icon}</div>}

            {expanded && (
              <>
                <span className="nav-text">{item.label}</span>
                {item.children && (
                  <span className={`arrow ${isOpen ? "open" : ""}`}>▶</span>
                )}
              </>
            )}
          </div>

          <div className={`submenu ${isOpen ? "open" : ""}`}>
            {item.children && renderMenu(item.children, level + 1)}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="layout">
      {!shouldHideSidebar && (
        <aside
          className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
          style={{ width: expanded ? "250px" : "80px" }}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => {
            setTimeout(() => setExpanded(false), 150);
          }}
        >
          <div className="sidebar-header-container">
            {expanded && <h1 className="sidebar-title">Vittora</h1>}
            <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
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
                {expanded && <span className="nav-text">{item.label}</span>}
              </Link>
            ))}

            <div className="module-box">
              {expanded && <div className="module-title">Modules</div>}
              {renderMenu(modulesMenu)}
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="nav-item">
              <div className="nav-icon">
                <FaUser />
              </div>
              {expanded && <span className="nav-text">AJALABS.AI</span>}
            </div>
          </div>
        </aside>
      )}

      <div
        className="main-content"
        style={{
          marginLeft: shouldHideSidebar
            ? "0"
            : expanded
            ? "250px"
            : "80px",
          transition: "margin-left 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}