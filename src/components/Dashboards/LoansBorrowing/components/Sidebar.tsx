import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'tachometer-alt' },
    { id: 'currency-exposure', label: 'Currency Exposure', icon: 'globe-americas' },
    { id: 'interest-rates', label: 'Interest Rates', icon: 'percentage' },
    { id: 'hedging', label: 'Hedging', icon: 'shield-alt' },
    { id: 'covenants', label: 'Covenants', icon: 'file-contract' },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: 'exclamation-triangle' },
    { id: 'payment-schedule', label: 'Payment Schedule', icon: 'calendar-alt' },
  ];

  return (
    <aside className="sidebar"> 
        <button
          className="sidebar-back-btn"
          onClick={() =>
            navigate('/modules', {
              state: { scrollToModule: 'autm' },
            })
          }
          title="Back to AuTM"
        >
          ←
        </button>
      <div className="sidebar-header">
        <div className="logo">
          <i className="fas fa-university"></i>
          <h2>Vittora</h2>
        </div>
        <div className="bank-logo">
          <div className="logo-circle">
            <i className="fas fa-chart-pie"></i>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(item.id);
            }}
          >
            <i className={`fas fa-${item.icon}`}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <img
            src="https://ui-avatars.com/api/?name=Finance+Team&background=4d4dff&color=white&bold=true"
            alt="User"
          />
          <div className="user-info">
            <h4>Finance Team</h4>
            <p>Treasury Department</p>
          </div>
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;