import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const statsData = [
    { 
      title: 'TOTAL ECB EXPOSURE', 
      value: '$4.25B', 
      change: '+2.3%', 
      trend: 'up',
      subtitle: 'vs last month',
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
      icon: '💰'
    },
    { 
      title: 'AVG INTEREST RATE', 
      value: '4.85%', 
      change: '-0.02%', 
      trend: 'down',
      subtitle: 'from 4.87%',
      color: 'linear-gradient(135deg, #f093fb, #f5576c)',
      icon: '📈',
      navigateTo: 'interest-rates'
    },
    { 
      title: 'HEDGING RATIO', 
      value: '68%', 
      change: '+3%', 
      trend: 'up',
      subtitle: 'from 65%',
      color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      icon: '🛡️',
      navigateTo: 'hedging'
    }
  ];

  const currencyData = [
    { name: 'USD', amount: '$2.1B', percentage: 45, color: '#3b82f6' },
    { name: 'EUR', amount: '€1.2B', percentage: 25, color: '#10b981' },
    { name: 'GBP', amount: '£0.5B', percentage: 12, color: '#f59e0b' },
    { name: 'JPY', amount: '¥0.3B', percentage: 8, color: '#ef4444' },
    { name: 'CHF', amount: 'CHF0.15B', percentage: 5, color: '#8b5cf6' }
  ];

  const quickLinks = [
    { name: 'Covenants', icon: '📋', path: 'covenants', color: '#f59e0b' },
    { name: 'Risk Analysis', icon: '⚠️', path: 'risk-analysis', color: '#ef4444' },
    { name: 'Payment Schedule', icon: '📅', path: 'payment-schedule', color: '#3b82f6' }
  ];

  return (
    <div className="dashboard">
      {/* Header with gradient */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <p>Comprehensive monitoring of External Commercial Borrowings</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span>Active Facilities</span>
            <strong>12</strong>
          </div>
          <div className="header-stat">
            <span>Total Exposure</span>
            <strong>$4.25B</strong>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div 
            key={index}
            className={`stat-card ${stat.navigateTo ? 'clickable' : ''}`}
            style={{ background: stat.color }}
            onClick={() => stat.navigateTo && navigate(`/analytics/LoansBorrowing/${stat.navigateTo}`)}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-footer">
                <span className={`stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                </span>
                <span className="stat-subtitle">{stat.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Currency Exposure Section */}
      <div className="currency-section">
        <div className="section-header">
          <div>
            <h2>Currency Exposure</h2>
            <p className="section-subtitle">Breakdown by currency</p>
          </div>
          <button 
            className="view-all-btn"
            onClick={() => navigate('/analytics/LoansBorrowing/currency-exposure')}
          >
            View Details →
          </button>
        </div>

        <div className="currency-content">
          {/* Currency List */}
          <div className="currency-list">
            {currencyData.map((currency) => (
              <div key={currency.name} className="currency-item">
                <div className="currency-info">
                  <span className="currency-name" style={{ color: currency.color }}>
                    {currency.name}
                  </span>
                  <span className="currency-amount">{currency.amount}</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${currency.percentage}%`,
                      backgroundColor: currency.color 
                    }}
                  >
                    <span className="progress-label">{currency.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Donut Chart Preview */}
          <div className="chart-preview">
            <div className="donut-chart">
              {currencyData.map((currency, index) => (
                <div 
                  key={currency.name}
                  className="donut-segment"
                  style={{ 
                    '--percentage': currency.percentage,
                    '--color': currency.color,
                    '--offset': currencyData.slice(0, index).reduce((sum, c) => sum + c.percentage, 0)
                  } as React.CSSProperties}
                />
              ))}
              <div className="donut-center">
                <span className="donut-total">$4.25B</span>
                <span className="donut-label">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        {quickLinks.map((link) => (
          <button
            key={link.name}
            className="quick-link-btn"
            style={{ borderColor: link.color }}
            onClick={() => navigate(`/analytics/LoansBorrowing/${link.path}`)}
          >
            <span className="quick-link-icon" style={{ background: link.color }}>
              {link.icon}
            </span>
            <span className="quick-link-name">{link.name}</span>
          </button>
        ))}
      </div>

      {/* Executive Summary */}
      <div className="summary-card">
        <h3>Executive Summary</h3>
        <p className="summary-text">
          Current ECB exposure stands at <strong>$4.25B</strong> with an average interest rate of <strong>4.85%</strong>. 
          Hedging ratio is at <strong>68%</strong>, showing a 3% increase from last month. 
          USD remains the dominant currency with 45% exposure, followed by EUR at 25%.
        </p>
        <div className="summary-metrics">
          <div className="summary-metric">
            <span className="metric-label">Risk Score</span>
            <span className="metric-value good">72/100</span>
          </div>
          <div className="summary-metric">
            <span className="metric-label">Liquidity</span>
            <span className="metric-value good">Healthy</span>
          </div>
          <div className="summary-metric">
            <span className="metric-label">Next Payment</span>
            <span className="metric-value warning">15 days</span>
          </div>
          <div className="summary-metric">
            <span className="metric-label">Covenants</span>
            <span className="metric-value warning">1 At Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;