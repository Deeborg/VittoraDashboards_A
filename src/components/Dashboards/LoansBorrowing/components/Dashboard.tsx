import React from 'react';
import { useNavigate } from 'react-router-dom';
import './loanDashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Format INR values
  const formatINR = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  const statsData = [
    { 
      title: 'TOTAL ECB EXPOSURE', 
      value: '₹36,130Cr',
      inrValue: '₹361.3B',
      change: '+2.3%', 
      trend: 'up',
      subtitle: 'vs last month',
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
      icon: '💰',
      navigateTo: 'currency-exposure'
    },
    { 
      title: 'AVG INTEREST RATE', 
      value: '4.85%', 
      change: '+0.02%', 
      trend: 'up',
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
    { name: 'USD', amount: '₹16,256Cr', percentage: 45, color: '#3b82f6' },
    { name: 'EUR', amount: '₹9,562Cr', percentage: 25, color: '#10b981' },
    { name: 'GBP', amount: '₹5,100Cr', percentage: 12, color: '#f59e0b' },
    { name: 'JPY', amount: '₹2,040Cr', percentage: 8, color: '#ef4444' },
    { name: 'AUD', amount: '₹1,062Cr', percentage: 5, color: '#8b5cf6' },
    { name: 'INR', amount: '₹4,520Cr', percentage: 3, color: '#ff8c4d' },
    { name: 'CHF', amount: '₹1,147Cr', percentage: 2, color: '#a0a0d0' }
  ];

  const quickLinks = [
    { name: 'Covenants', icon: '📋', path: 'covenants', color: '#f59e0b' },
    { name: 'Risk Analysis', icon: '⚠️', path: 'risk-analysis', color: '#ef4444' },
    { name: 'Payment Schedule', icon: '📅', path: 'payment-schedule', color: '#3b82f6' }
  ];

  return (
    <div className="dashboard">
      {/* Header with gradient - Square style */}
      <div className="dashboard-header" style={{ borderRadius: 0 }}>
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <p>Comprehensive monitoring of External Commercial Borrowings</p>
        </div>
        <div className="header-stats">
          <div className="header-stat" style={{ borderRadius: 0 }}>
            <span>Active Facilities</span>
            <strong>12</strong>
          </div>
          <div className="header-stat" style={{ borderRadius: 0 }}>
            <span>Total Exposure (INR)</span>
            <strong>₹36,130Cr</strong>
            <small style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>₹361.3B</small>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid - Square corners */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div 
            key={index}
            className={`stat-card ${stat.navigateTo ? 'clickable' : ''}`}
            style={{ 
              background: stat.color,
              borderRadius: 0,
              boxShadow: 'none',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={() => stat.navigateTo && navigate(`/analytics/LoansBorrowing/${stat.navigateTo}`)}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
              {stat.inrValue && (
                <div className="stat-inr" style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
                  {stat.inrValue}
                </div>
              )}
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

      {/* Currency Exposure Section - Square corners */}
      <div className="currency-section" style={{ borderRadius: 0 }}>
        <div className="section-header">
          <div>
            <h2>Currency Exposure</h2>
            <p className="section-subtitle">Breakdown by currency (INR equivalent)</p>
          </div>
          <button 
            className="view-all-btn"
            style={{ borderRadius: 0 }}
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
                      backgroundColor: currency.color,
                      borderRadius: 0
                    }}
                  >
                    <span className="progress-label">{currency.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Donut Chart Preview - Square */}
          <div className="chart-preview" style={{ borderRadius: 0 }}>
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
                <span className="donut-total">₹36,130Cr</span>
                <span className="donut-label">Total Exposure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links - Square corners */}
      <div className="quick-links">
        {quickLinks.map((link) => (
          <button
            key={link.name}
            className="quick-link-btn"
            style={{ 
              borderColor: link.color,
              borderRadius: 0
            }}
            onClick={() => navigate(`/analytics/LoansBorrowing/${link.path}`)}
          >
            <span className="quick-link-icon" style={{ background: link.color, borderRadius: 0 }}>
              {link.icon}
            </span>
            <span className="quick-link-name">{link.name}</span>
          </button>
        ))}
      </div>

      {/* Executive Summary - Square corners */}
      <div className="summary-card" style={{ borderRadius: 0 }}>
        <h3>Executive Summary</h3>
        <p className="summary-text">
          Current ECB exposure stands at <strong>₹36,130Cr (₹361.3B)</strong> with an average interest rate of <strong>4.85%</strong>. 
          Hedging ratio is at <strong>68%</strong>, showing a 3% increase from last month. 
          USD remains the dominant currency with 45% exposure (₹16,256Cr), followed by EUR at 25% (₹9,562Cr).
        </p>
        <div className="summary-metrics">
          <div className="summary-metric" style={{ borderRadius: 0 }}>
            <span className="metric-label">Risk Score</span>
            <span className="metric-value good">72/100</span>
          </div>
          <div className="summary-metric" style={{ borderRadius: 0 }}>
            <span className="metric-label">Liquidity</span>
            <span className="metric-value good">Healthy</span>
          </div>
          <div className="summary-metric" style={{ borderRadius: 0 }}>
            <span className="metric-label">Next Payment</span>
            <span className="metric-value warning">15 days</span>
          </div>
          <div className="summary-metric" style={{ borderRadius: 0 }}>
            <span className="metric-label">Covenants</span>
            <span className="metric-value warning">1 At Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;