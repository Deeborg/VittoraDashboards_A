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
        {/* Main content with left panel and right content */}
        <div className="dashboard-layout">
          {/* Left Panel - Square format, full screen */}
          <div className="left-panel">
            {/* Scrollable content */}
            <div className="left-panel-content">
              {/* Analytics Section */}
              <div className="panel-header">
                <h3>ANALYTICS</h3>
                <span className="panel-count">{menuItems.length} modules</span>
              </div>
              
              {/* Menu Items */}
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
            </div>
          </div>

          {/* Right Content Area with Square Dark Blue Header */}
          <div className="right-content">
            <div className="dashboard-header">
              <h2>Loans & Borrowing Dashboard</h2>
              <p className="header-description">Monitor outstanding loans and improve borrowing strategy with visual insights</p>
            </div>
            <div className="content-area">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default LoanRoot;