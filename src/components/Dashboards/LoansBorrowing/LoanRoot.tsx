import React, { useState } from 'react';
import './LoanRoot.css';
import Dashboard from './components/Dashboard';
import CurrencyExposure from './components/CurrencyExposure';
import InterestRates from './components/InterestRates';
import Hedging from './components/Hedging';
import Covenants from './components/Covenants';
import RiskAnalysis from './components/RiskAnalysis';
import PaymentSchedule from './components/PaymentSchedule';
import { DashboardProvider } from './context/DashboardContext';

const LoanRoot: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'currency-exposure', name: 'Currency Exposure', icon: '💱' },
    { id: 'interest-rates', name: 'Interest Rates', icon: '📈' },
    { id: 'hedging', name: 'Hedging', icon: '🛡️' },
    { id: 'covenants', name: 'Covenants', icon: '📋' },
    { id: 'risk-analysis', name: 'Risk Analysis', icon: '⚠️' },
    { id: 'payment-schedule', name: 'Payment Schedule', icon: '📅' }
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'currency-exposure':
        return <CurrencyExposure />;
      case 'interest-rates':
        return <InterestRates />;
      case 'hedging':
        return <Hedging />;
      case 'covenants':
        return <Covenants />;
      case 'risk-analysis':
        return <RiskAnalysis />;
      case 'payment-schedule':
        return <PaymentSchedule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardProvider>
      <div className="loan-root-container">
        {/* Header */}
        <div className="loan-header">
          <div className="header-left">
            <h1>Vittora</h1>
            <p className="loan-subtitle">Loans & Borrowing Dashboard</p>
          </div>
          <div className="header-right">
            <span className="date-badge">Friday, February 27, 2026</span>
          </div>
        </div>

        {/* Main content with left panel and right content */}
        <div className="dashboard-layout">
          {/* Left Panel - Menu */}
          <div className="left-panel">
            <div className="panel-header">
              <h3>Analytics</h3>
              <span className="panel-count">{menuItems.length} modules</span>
            </div>
            <ul className="menu-list">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`menu-item ${activePage === item.id ? 'active' : ''}`}
                    onClick={() => setActivePage(item.id)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-name">{item.name}</span>
                    {activePage === item.id && <span className="menu-indicator">●</span>}
                  </button>
                </li>
              ))}
            </ul>
            <div className="panel-footer">
              <div className="user-info">
                <span className="user-avatar">👤</span>
                <span className="user-name">Admin</span>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="right-content">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          <div className="footer-left">
            <span>© 2026 Vittora</span>
            <span>•</span>
            <span>All rights reserved</span>
          </div>
          <div className="footer-right">
            <span>ENG</span>
            <span>11:34 AM</span>
            <span>27-02-2026</span>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default LoanRoot;