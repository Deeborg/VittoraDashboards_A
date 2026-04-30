import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { exportToCSV } from '../../utils/formatters';
import { dashboardService } from '../../services/api';
import './Header.scss';

interface HeaderProps {
  onRefresh?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  const location = useLocation();
  const [dateRange, setDateRange] = useState('last30Days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard Overview',
    '/sales-analytics': 'Sales Analytics',
    '/performance': 'Performance Metrics',
    '/customers': 'Customer Management',
    '/products': 'Product Catalog',
    '/orders': 'Order Management',
    '/entities': 'Business Entities',
    '/regions': 'Regional Analysis',
    '/settings': 'Settings',
  };

  const getPageTitle = () => {
    return pageTitles[location.pathname] || 'Sales Analytics Dashboard';
  };

  const handleExport = async () => {
    try {
      const summary = await dashboardService.getSummary();
      const data = [{
        'Total Sales': `$${summary.totalSales.toLocaleString()}`,
        'Total Orders': summary.totalOrders,
        'Total Customers': summary.totalCustomers,
        'Pending Orders': summary.pendingOrders,
        'Revenue Growth': `${summary.revenueGrowth}%`,
        'Average Order Value': `$${summary.avgOrderValue.toLocaleString()}`,
        'Conversion Rate': `${summary.conversionRate}%`,
        'Export Date': new Date().toLocaleDateString(),
      }];
      
      exportToCSV(data, 'dashboard_report');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const dateRangeOptions = [
    { value: 'last7Days', label: 'Last 7 Days' },
    { value: 'last30Days', label: 'Last 30 Days' },
    { value: 'last90Days', label: 'Last 90 Days' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">{getPageTitle()}</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="header-right">
        <div className="header-controls">
          {/* <select
            className="date-range-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select> */}

          <button 
            className="btn btn-secondary export-btn"
            onClick={handleExport}
          >
            <span className="btn-icon">↓</span>
            <span>Export Report</span>
          </button>

          <button 
            className={`btn btn-primary refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <span className="btn-icon">
              {isRefreshing ? '↻' : '↻'}
            </span>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Active Users</span>
            <span className="stat-value">247</span>
          </div>
          <div className="divider"></div>
          <div className="stat-item">
            <span className="stat-label">Response Time</span>
            <span className="stat-value">124ms</span>
          </div>
        </div> */}
      </div>
    </header>
  );
};

export default Header;