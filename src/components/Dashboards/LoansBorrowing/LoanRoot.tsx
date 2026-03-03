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
        <div className="loan-dashboard-layout">
          {/* Left Panel */}
          <div className="loan-left-panel">
            <div className="loan-panel-brand">
              <h1>Vittora</h1>
            </div>
            <div className="loan-panel-header">
              <h3>ANALYTICS</h3>
              <span className="loan-panel-count">{menuItems.length} modules</span>
            </div>
            <ul className="loan-menu-list">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`loan-menu-item ${activePage === item.id ? 'active' : ''}`}
                    onClick={() => setActivePage(item.id)}
                  >
                    <span className="loan-menu-icon">{item.icon}</span>
                    <span className="loan-menu-name">{item.name}</span>
                    {activePage === item.id && <span className="loan-menu-indicator">●</span>}
                  </button>
                </li>
              ))}
            </ul>
            <div className="loan-panel-footer">
              <div className="loan-user-info">
                <span className="loan-user-avatar">👤</span>
                <span className="loan-user-name">Admin</span>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="loan-right-content">
            <div className="loan-dashboard-header">
              <h2>Loans & Borrowing Dashboard</h2>
              <p>Monitor outstanding loans and improve borrowing strategy with visual insights</p>
            </div>
            <div className="loan-content-area">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="loan-dashboard-footer">
          <div className="loan-footer-left">
            <span>AJALABS.AI</span>
            <span>•</span>
            <span>info@ajalabs.ai</span>
          </div>
          <div className="loan-footer-right">
            <span>Friday, February 27, 2026</span>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default LoanRoot;