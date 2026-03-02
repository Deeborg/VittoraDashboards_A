import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './styles/ageing-dashboard.scss';

// Import chart components
import AgeingBarChart from './components/charts/AgeingBarChart';
import DonutChart from './components/charts/DonutChart';
import LineChartComponent from './components/charts/LineChart';

const AgeRoot: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'dashboard';

  // KPI Data - All 6 cards
  const kpiData = {
    receivables: { value: 3280000, overdue: 940000, change: -2.5 },
    payables: { value: 2380000, dueSoon: 600000, change: 1.8 },
    inventory: { value: 2700000, slowMoving: 450000, change: -0.7 },
    liabilities: { value: 8000000, shortTerm: 5000000, change: 3.2 },
    advances: { value: 1500000, pending: 190000, change: 0.5 },
    currentRatio: { value: 2.0, status: 'healthy', change: 0.2 }
  };

  // Ageing Data for all categories
  const ageingData = {
    receivables: {
      title: 'Receivables Ageing',
      total: 3280000,
      buckets: [
        { name: '1-30 Days', value: 1400000, percentage: 42.7, color: '#4cc9f0' },
        { name: '31-60 Days', value: 700000, percentage: 21.4, color: '#f39c12' },
        { name: '61-90 Days', value: 350000, percentage: 10.7, color: '#e67e22' },
        { name: '91-120 Days', value: 280000, percentage: 8.5, color: '#e74c3c' },
        { name: '121-180 Days', value: 250000, percentage: 7.6, color: '#c0392b' },
        { name: '181-360 Days', value: 200000, percentage: 6.1, color: '#9b59b6' },
        { name: '360+ Days', value: 100000, percentage: 3.0, color: '#34495e' }
      ]
    },
    payables: {
      title: 'Payables Ageing',
      total: 2380000,
      buckets: [
        { name: '1-30 Days', value: 1015000, percentage: 42.7, color: '#4cc9f0' },
        { name: '31-60 Days', value: 509000, percentage: 21.4, color: '#f39c12' },
        { name: '61-90 Days', value: 254000, percentage: 10.7, color: '#e67e22' },
        { name: '91-120 Days', value: 190000, percentage: 8.0, color: '#e74c3c' },
        { name: '121-180 Days', value: 166000, percentage: 7.0, color: '#c0392b' },
        { name: '181-360 Days', value: 142000, percentage: 6.0, color: '#9b59b6' },
        { name: '360+ Days', value: 100000, percentage: 4.2, color: '#34495e' }
      ]
    },
    inventory: {
      title: 'Inventory Ageing',
      total: 2700000,
      buckets: [
        { name: '1-30 Days', value: 1350000, percentage: 50.0, color: '#4cc9f0' },
        { name: '31-60 Days', value: 540000, percentage: 20.0, color: '#f39c12' },
        { name: '61-90 Days', value: 270000, percentage: 10.0, color: '#e67e22' },
        { name: '91-120 Days', value: 216000, percentage: 8.0, color: '#e74c3c' },
        { name: '121-180 Days', value: 162000, percentage: 6.0, color: '#c0392b' },
        { name: '181-360 Days', value: 108000, percentage: 4.0, color: '#9b59b6' },
        { name: '360+ Days', value: 54000, percentage: 2.0, color: '#34495e' }
      ]
    },
    liabilities: {
      title: 'Liabilities Ageing',
      total: 8000000,
      buckets: [
        { name: '1-30 Days', value: 4000000, percentage: 50.0, color: '#4cc9f0' },
        { name: '31-60 Days', value: 2000000, percentage: 25.0, color: '#f39c12' },
        { name: '61-90 Days', value: 800000, percentage: 10.0, color: '#e67e22' },
        { name: '91-120 Days', value: 560000, percentage: 7.0, color: '#e74c3c' },
        { name: '121-180 Days', value: 400000, percentage: 5.0, color: '#c0392b' },
        { name: '181-360 Days', value: 160000, percentage: 2.0, color: '#9b59b6' },
        { name: '360+ Days', value: 80000, percentage: 1.0, color: '#34495e' }
      ]
    },
    advances: {
      title: 'Advances Ageing',
      total: 1500000,
      buckets: [
        { name: '1-30 Days', value: 900000, percentage: 60.0, color: '#4cc9f0' },
        { name: '31-60 Days', value: 300000, percentage: 20.0, color: '#f39c12' },
        { name: '61-90 Days', value: 150000, percentage: 10.0, color: '#e67e22' },
        { name: '91-120 Days', value: 75000, percentage: 5.0, color: '#e74c3c' },
        { name: '121-180 Days', value: 45000, percentage: 3.0, color: '#c0392b' },
        { name: '181-360 Days', value: 20000, percentage: 1.3, color: '#9b59b6' },
        { name: '360+ Days', value: 10000, percentage: 0.7, color: '#34495e' }
      ]
    }
  };

  // Dashboard items
  const dashboardItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '' },
    { id: 'receivables', label: 'Receivables', icon: '💰', path: 'receivables' },
    { id: 'payables', label: 'Payables', icon: '💳', path: 'payables' },
    { id: 'inventory', label: 'Inventory', icon: '📦', path: 'inventory' },
    { id: 'liabilities', label: 'Liabilities', icon: '⚖️', path: 'liabilities' },
    { id: 'advances', label: 'Advances', icon: '📈', path: 'advances' }
  ];

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  return (
    <div className="ageing-container">
      {/* Left Sidebar */}
      <div className="ageing-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">V</div>
          <span className="brand-name">Vittora</span>
        </div>

        {/* Dashboard Section - ONLY SECTION NOW */}
        <div className="sidebar-section">
          <div className="section-title">DASHBOARD</div>
          <nav className="sidebar-nav">
            {dashboardItems.map((item) => {
              const isActive = item.id === 'dashboard' 
                ? currentPath === 'dashboard' || currentPath === ''
                : currentPath === item.id;
              
              return (
                <Link
                  key={item.id}
                  to={`/analytics/ageing/${item.path}`}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="footer-logo">AJALABS.AI</div>
          <div className="footer-email">info@ajalabs.ai</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ageing-main">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Ageing Dashboard</h1>
          <p className="page-subtitle">Monitor outstanding balances and improve cash flow with visual insights</p>
        </div>

        {/* KPI Cards Grid - ALL 6 CARDS */}
        <div className="kpi-grid">
          {/* RECEIVABLES - Card 1 */}
          <div className="kpi-card">
            <div className="kpi-title">RECEIVABLES</div>
            <div className="kpi-main-value">{formatCurrency(kpiData.receivables.value)}</div>
            <div className="kpi-sub-text">overdue: {formatCurrency(kpiData.receivables.overdue)}</div>
            <div className={`kpi-change ${kpiData.receivables.change < 0 ? 'down' : 'up'}`}>
              <span className="change-icon">{kpiData.receivables.change < 0 ? '↓' : '↑'}</span>
              <span>{Math.abs(kpiData.receivables.change)}%</span>
            </div>
          </div>

          {/* PAYABLES - Card 2 */}
          <div className="kpi-card">
            <div className="kpi-title">PAYABLES</div>
            <div className="kpi-main-value">{formatCurrency(kpiData.payables.value)}</div>
            <div className="kpi-sub-text">due soon: {formatCurrency(kpiData.payables.dueSoon)}</div>
            <div className={`kpi-change ${kpiData.payables.change > 0 ? 'up' : 'down'}`}>
              <span className="change-icon">↑</span>
              <span>{kpiData.payables.change}%</span>
            </div>
          </div>

          {/* INVENTORY - Card 3 */}
          <div className="kpi-card">
            <div className="kpi-title">INVENTORY</div>
            <div className="kpi-main-value">{formatCurrency(kpiData.inventory.value)}</div>
            <div className="kpi-sub-text">slow moving: {formatCurrency(kpiData.inventory.slowMoving)}</div>
            <div className={`kpi-change ${kpiData.inventory.change < 0 ? 'down' : 'up'}`}>
              <span className="change-icon">↓</span>
              <span>{Math.abs(kpiData.inventory.change)}%</span>
            </div>
          </div>

          {/* LIABILITIES - Card 4 */}
          <div className="kpi-card">
            <div className="kpi-title">LIABILITIES</div>
            <div className="kpi-main-value">{formatCurrency(kpiData.liabilities.value)}</div>
            <div className="kpi-sub-text">short term: {formatCurrency(kpiData.liabilities.shortTerm)}</div>
            <div className={`kpi-change ${kpiData.liabilities.change > 0 ? 'up' : 'down'}`}>
              <span className="change-icon">↑</span>
              <span>{kpiData.liabilities.change}%</span>
            </div>
          </div>

          {/* ADVANCES - Card 5 */}
          <div className="kpi-card">
            <div className="kpi-title">ADVANCES</div>
            <div className="kpi-main-value">{formatCurrency(kpiData.advances.value)}</div>
            <div className="kpi-sub-text">pending: {formatCurrency(kpiData.advances.pending)}</div>
            <div className={`kpi-change ${kpiData.advances.change > 0 ? 'up' : 'down'}`}>
              <span className="change-icon">↑</span>
              <span>{kpiData.advances.change}%</span>
            </div>
          </div>

          {/* CURRENT RATIO - Card 6 */}
          <div className="kpi-card">
            <div className="kpi-title">CURRENT RATIO</div>
            <div className="kpi-main-value">{kpiData.currentRatio.value}</div>
            <div className="kpi-sub-text">
              <span className={`badge badge-${kpiData.currentRatio.status === 'healthy' ? 'good' : 'warning'}`}>
                {kpiData.currentRatio.status}
              </span>
            </div>
            <div className="kpi-change up">
              <span className="change-icon">↑</span>
              <span>{kpiData.currentRatio.change}</span>
            </div>
          </div>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard ageingData={ageingData} formatCurrency={formatCurrency} />} />
          <Route path="dashboard" element={<Dashboard ageingData={ageingData} formatCurrency={formatCurrency} />} />
          <Route path="receivables" element={
            <CategoryPage 
              title="Receivables Ageing"
              data={ageingData.receivables}
              formatCurrency={formatCurrency}
            />
          } />
          <Route path="payables" element={
            <CategoryPage 
              title="Payables Ageing"
              data={ageingData.payables}
              formatCurrency={formatCurrency}
            />
          } />
          <Route path="inventory" element={
            <CategoryPage 
              title="Inventory Ageing"
              data={ageingData.inventory}
              formatCurrency={formatCurrency}
            />
          } />
          <Route path="liabilities" element={
            <CategoryPage 
              title="Liabilities Ageing"
              data={ageingData.liabilities}
              formatCurrency={formatCurrency}
            />
          } />
          <Route path="advances" element={
            <CategoryPage 
              title="Advances Ageing"
              data={ageingData.advances}
              formatCurrency={formatCurrency}
            />
          } />
        </Routes>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC<{ 
  ageingData: any; 
  formatCurrency: (value: number) => string;
}> = ({ ageingData, formatCurrency }) => {
  const [activeTab, setActiveTab] = useState<'payables' | 'receivables' | 'inventory' | 'liabilities' | 'advances'>('payables');

  // Trend data
  const trendData = [
    { month: 'Jan', receivables: 2800000, payables: 2200000, workingCapital: 3200000 },
    { month: 'Feb', receivables: 2950000, payables: 2300000, workingCapital: 3400000 },
    { month: 'Mar', receivables: 3100000, payables: 2250000, workingCapital: 3600000 },
    { month: 'Apr', receivables: 3280000, payables: 2380000, workingCapital: 3800000 },
    { month: 'May', receivables: 3400000, payables: 2450000, workingCapital: 3950000 },
    { month: 'Jun', receivables: 3550000, payables: 2550000, workingCapital: 4100000 },
  ];

  const trendLines = [
    { key: 'receivables', name: 'Receivables', color: '#3b82f6' },
    { key: 'payables', name: 'Payables', color: '#10b981' },
    { key: 'workingCapital', name: 'Working Capital', color: '#8b5cf6' },
  ];

  const currentData = ageingData[activeTab];

  return (
    <div className="dashboard-content">
      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'payables' ? 'active' : ''}`}
          onClick={() => setActiveTab('payables')}
        >
          <span className="tab-icon">📋</span>
          <span>Payables</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'receivables' ? 'active' : ''}`}
          onClick={() => setActiveTab('receivables')}
        >
          <span className="tab-icon">💰</span>
          <span>Receivables</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <span className="tab-icon">📦</span>
          <span>Inventory</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'liabilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('liabilities')}
        >
          <span className="tab-icon">⚖️</span>
          <span>Liabilities</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'advances' ? 'active' : ''}`}
          onClick={() => setActiveTab('advances')}
        >
          <span className="tab-icon">📈</span>
          <span>Advances</span>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card">
          <h3 className="card-title">
            <span className="card-icon">📊</span>
            {currentData.title} - Bar Chart
          </h3>
          <div className="bar-chart-container">
            {currentData.buckets.map((bucket: any, index: number) => (
              <div key={index} className="bar-item">
                <div className="bar-label">
                  <span>{bucket.name}</span>
                  <span className="bar-percentage">{bucket.percentage}%</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${bucket.percentage}%`, 
                      backgroundColor: bucket.color
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="chart-card">
          <h3 className="card-title">
            <span className="card-icon">🍩</span>
            {currentData.title} Distribution
          </h3>
          <div className="donut-container">
            <div className="donut-wrapper">
              <svg viewBox="0 0 100 100" className="donut-svg">
                {currentData.buckets.map((bucket: any, index: number) => {
                  let cumulativePercentage = 0;
                  for (let i = 0; i < index; i++) {
                    cumulativePercentage += currentData.buckets[i].percentage;
                  }
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="transparent"
                      stroke={bucket.color}
                      strokeWidth="10"
                      strokeDasharray={`${bucket.percentage * 2.2} 220`}
                      strokeDashoffset={-cumulativePercentage * 2.2}
                      transform="rotate(-90 50 50)"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="25" fill="white" />
              </svg>
              <div className="donut-center">
                <div className="donut-total">{formatCurrency(currentData.total)}</div>
                <div className="donut-label">Total</div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="chart-legend">
              {currentData.buckets.map((bucket: any, index: number) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: bucket.color }} />
                  <span className="legend-label">{bucket.name}</span>
                  <span className="legend-value">{bucket.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="trend-chart">
        <LineChartComponent
          title="6-Month Trend Analysis"
          data={trendData}
          lines={trendLines}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <h3>{currentData.title} Details</h3>
        <table>
          <thead>
            <tr>
              <th>Age Group</th>
              <th>Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {currentData.buckets.map((bucket: any, index: number) => (
              <tr key={index}>
                <td>
                  <span className="color-dot" style={{ backgroundColor: bucket.color }} />
                  {bucket.name}
                </td>
                <td>{formatCurrency(bucket.value)}</td>
                <td>{bucket.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Category Page Component
const CategoryPage: React.FC<{ 
  title: string; 
  data: any; 
  formatCurrency: (value: number) => string;
}> = ({ title, data, formatCurrency }) => {
  return (
    <div className="category-content">
      <h2 className="category-title">{title}</h2>
      
      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card">
          <h3 className="card-title">
            <span className="card-icon">📊</span>
            {title} - Bar Chart
          </h3>
          <div className="bar-chart-container">
            {data.buckets.map((bucket: any, index: number) => (
              <div key={index} className="bar-item">
                <div className="bar-label">
                  <span>{bucket.name}</span>
                  <span className="bar-percentage">{bucket.percentage}%</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${bucket.percentage}%`, 
                      backgroundColor: bucket.color
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="chart-card">
          <h3 className="card-title">
            <span className="card-icon">🍩</span>
            {title} Distribution
          </h3>
          <div className="donut-container">
            <div className="donut-wrapper">
              <svg viewBox="0 0 100 100" className="donut-svg">
                {data.buckets.map((bucket: any, index: number) => {
                  let cumulativePercentage = 0;
                  for (let i = 0; i < index; i++) {
                    cumulativePercentage += data.buckets[i].percentage;
                  }
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="transparent"
                      stroke={bucket.color}
                      strokeWidth="10"
                      strokeDasharray={`${bucket.percentage * 2.2} 220`}
                      strokeDashoffset={-cumulativePercentage * 2.2}
                      transform="rotate(-90 50 50)"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="25" fill="white" />
              </svg>
              <div className="donut-center">
                <div className="donut-total">{formatCurrency(data.total)}</div>
                <div className="donut-label">Total</div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="chart-legend">
              {data.buckets.map((bucket: any, index: number) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: bucket.color }} />
                  <span className="legend-label">{bucket.name}</span>
                  <span className="legend-value">{bucket.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <h3>{title} Details</h3>
        <table>
          <thead>
            <tr>
              <th>Age Group</th>
              <th>Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.buckets.map((bucket: any, index: number) => (
              <tr key={index}>
                <td>
                  <span className="color-dot" style={{ backgroundColor: bucket.color }} />
                  {bucket.name}
                </td>
                <td>{formatCurrency(bucket.value)}</td>
                <td>{bucket.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgeRoot;