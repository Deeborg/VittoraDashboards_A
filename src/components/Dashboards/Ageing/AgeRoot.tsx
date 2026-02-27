import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

// Import chart components
import AgeingBarChart from './components/charts/AgeingBarChart';

const AgeRoot: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'dashboard';

  // KPI Data
  const kpiData = {
    receivables: { value: 3280000, overdue: 940000, change: -2.5 },
    payables: { value: 2380000, dueSoon: 600000, change: 1.8 },
    inventory: { value: 2700000, slowMoving: 450000, change: -0.7 },
    liabilities: { value: 8000000, shortTerm: 5000000, change: 3.2 },
    advances: { value: 1500000, pending: 190000, change: 0.5 },
    currentRatio: { value: 2.0, status: 'healthy', change: 0.2 }
  };

  // Aging Data for different categories with all age groups
  const agingData = {
    receivables: {
      title: 'Receivables Aging Analysis',
      total: 19800000,
      buckets: [
        { name: '1-30 Days', value: 8500000, percentage: 42.9, color: '#4cc9f0' },
        { name: '31-60 Days', value: 4500000, percentage: 22.7, color: '#f39c12' },
        { name: '61-90 Days', value: 2500000, percentage: 12.6, color: '#e67e22' },
        { name: '91-120 Days', value: 1500000, percentage: 7.6, color: '#e74c3c' },
        { name: '121-180 Days', value: 1200000, percentage: 6.1, color: '#c0392b' },
        { name: '181-360 Days', value: 1000000, percentage: 5.1, color: '#9b59b6' },
        { name: '360+ Days', value: 600000, percentage: 3.0, color: '#34495e' }
      ]
    },
    payables: {
      title: 'Payables Aging Analysis',
      total: 1405000,
      buckets: [
        { name: '1-30 Days', value: 600000, percentage: 42.7, color: '#4cc9f0' },
        { name: '31-60 Days', value: 300000, percentage: 21.4, color: '#f39c12' },
        { name: '61-90 Days', value: 150000, percentage: 10.7, color: '#e67e22' },
        { name: '91-120 Days', value: 100000, percentage: 7.1, color: '#e74c3c' },
        { name: '121-180 Days', value: 80000, percentage: 5.7, color: '#c0392b' },
        { name: '181-360 Days', value: 90000, percentage: 6.4, color: '#9b59b6' },
        { name: '360+ Days', value: 85000, percentage: 6.0, color: '#34495e' }
      ]
    },
    inventory: {
      title: 'Inventory Aging Analysis',
      total: 28500000,
      buckets: [
        { name: '1-30 Days', value: 14500000, percentage: 50.9, color: '#4cc9f0' },
        { name: '31-60 Days', value: 8000000, percentage: 28.1, color: '#f39c12' },
        { name: '61-90 Days', value: 3500000, percentage: 12.3, color: '#e67e22' },
        { name: '91-120 Days', value: 1000000, percentage: 3.5, color: '#e74c3c' },
        { name: '121-180 Days', value: 600000, percentage: 2.1, color: '#c0392b' },
        { name: '181-360 Days', value: 500000, percentage: 1.8, color: '#9b59b6' },
        { name: '360+ Days', value: 400000, percentage: 1.4, color: '#34495e' }
      ]
    },
    liabilities: {
      title: 'Liabilities Aging Analysis',
      total: 82000000,
      buckets: [
        { name: '1-30 Days', value: 50000000, percentage: 61.0, color: '#4cc9f0' },
        { name: '31-60 Days', value: 20000000, percentage: 24.4, color: '#f39c12' },
        { name: '61-90 Days', value: 5000000, percentage: 6.1, color: '#e67e22' },
        { name: '91-120 Days', value: 3000000, percentage: 3.7, color: '#e74c3c' },
        { name: '121-180 Days', value: 1500000, percentage: 1.8, color: '#c0392b' },
        { name: '181-360 Days', value: 1500000, percentage: 1.8, color: '#9b59b6' },
        { name: '360+ Days', value: 1000000, percentage: 1.2, color: '#34495e' }
      ]
    },
    advances: {
      title: 'Advances Aging Analysis',
      total: 1551000,
      buckets: [
        { name: '1-30 Days', value: 1000000, percentage: 64.5, color: '#4cc9f0' },
        { name: '31-60 Days', value: 300000, percentage: 19.3, color: '#f39c12' },
        { name: '61-90 Days', value: 150000, percentage: 9.7, color: '#e67e22' },
        { name: '91-120 Days', value: 40000, percentage: 2.6, color: '#e74c3c' },
        { name: '121-180 Days', value: 20000, percentage: 1.3, color: '#c0392b' },
        { name: '181-360 Days', value: 25000, percentage: 1.6, color: '#9b59b6' },
        { name: '360+ Days', value: 16000, percentage: 1.0, color: '#34495e' }
      ]
    }
  };

  // Navigation items with icons
  const navItems = [
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
    <div style={styles.appContainer}>
      {/* Left Navigation Panel - Dark Blue */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Vittora</h2>
        </div>
        
        {/* MODULES SECTION REMOVED */}
        
        <nav style={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = item.id === 'dashboard' 
              ? currentPath === 'dashboard' || currentPath === ''
              : currentPath === item.id;
            
            return (
              <Link
                key={item.id}
                to={`/analytics/ageing/${item.path}`}
                style={{
                  ...styles.navItem,
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
                {isActive && <span style={styles.navActive}>•</span>}
              </Link>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.footerLogo}>AJALABS.AI</div>
          <div style={styles.footerEmail}>info@ajalabs.ai</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Ageing Dashboard</h1>
        </div>

        {/* KPI Cards - New Design */}
        <div style={styles.kpiGrid}>
          {/* RECEIVABLES */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiTitle}>RECEIVABLES</div>
            <div style={styles.kpiMainValue}>{formatCurrency(kpiData.receivables.value)}</div>
            <div style={styles.kpiSubText}>overdue: {formatCurrency(kpiData.receivables.overdue)}</div>
            <div style={{...styles.kpiChangeIndicator, color: '#ef4444'}}>↓ {Math.abs(kpiData.receivables.change)}%</div>
          </div>

          {/* PAYABLES */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiTitle}>PAYABLES</div>
            <div style={styles.kpiMainValue}>{formatCurrency(kpiData.payables.value)}</div>
            <div style={styles.kpiSubText}>due soon: {formatCurrency(kpiData.payables.dueSoon)}</div>
            <div style={{...styles.kpiChangeIndicator, color: '#10b981'}}>↑ {kpiData.payables.change}%</div>
          </div>

          {/* INVENTORY */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiTitle}>INVENTORY</div>
            <div style={styles.kpiMainValue}>{formatCurrency(kpiData.inventory.value)}</div>
            <div style={styles.kpiSubText}>slow moving: {formatCurrency(kpiData.inventory.slowMoving)}</div>
            <div style={{...styles.kpiChangeIndicator, color: '#ef4444'}}>↓ {Math.abs(kpiData.inventory.change)}%</div>
          </div>

          {/* LIABILITIES */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiTitle}>LIABILITIES</div>
            <div style={styles.kpiMainValue}>{formatCurrency(kpiData.liabilities.value)}</div>
            <div style={styles.kpiSubText}>short term: {formatCurrency(kpiData.liabilities.shortTerm)}</div>
            <div style={{...styles.kpiChangeIndicator, color: '#10b981'}}>↑ {kpiData.liabilities.change}%</div>
          </div>

          {/* ADVANCES */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiTitle}>ADVANCES</div>
            <div style={styles.kpiMainValue}>{formatCurrency(kpiData.advances.value)}</div>
            <div style={styles.kpiSubText}>pending: {formatCurrency(kpiData.advances.pending)}</div>
            <div style={{...styles.kpiChangeIndicator, color: '#10b981'}}>↑ {kpiData.advances.change}%</div>
          </div>

          {/* CURRENT RATIO */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiTitle}>CURRENT RATIO</div>
            <div style={styles.kpiMainValue}>{kpiData.currentRatio.value}</div>
            <div style={styles.kpiSubText}>healthy</div>
            <div style={{...styles.kpiChangeIndicator, color: '#10b981'}}>↑ {kpiData.currentRatio.change}</div>
          </div>
        </div>

        {/* Routes for different pages */}
        <Routes>
          <Route path="/" element={<Dashboard agingData={agingData} formatCurrency={formatCurrency} />} />
          <Route path="dashboard" element={<Dashboard agingData={agingData} formatCurrency={formatCurrency} />} />
          <Route path="receivables" element={
            <CategoryPage 
              title="Receivables"
              data={agingData.receivables}
              formatCurrency={formatCurrency}
            />
          } />
          <Route path="payables" element={
            <CategoryPage 
              title="Payables"
              data={agingData.payables}
              formatCurrency={formatCurrency}
            />
          } />
          <Route path="inventory" element={
            <CategoryPage 
              title="Inventory"
              data={agingData.inventory}
              formatCurrency={formatCurrency}
            />
          } />
          <Route path="liabilities" element={
            <CategoryPage 
              title="Liabilities"
              data={agingData.liabilities}
              formatCurrency={formatCurrency}
            />
          } />
          <Route path="advances" element={
            <CategoryPage 
              title="Advances"
              data={agingData.advances}
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
  agingData: any; 
  formatCurrency: (value: number) => string;
}> = ({ agingData, formatCurrency }) => {
  return (
    <div>
      {/* Payables Aging Section - Showing all age groups */}
      <div style={styles.analysisSection}>
        <h2 style={styles.sectionTitle}>Payables Aging</h2>
        
        {/* Charts Row */}
        <div style={styles.chartsRow}>
          {/* Bar Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Bar Chart</h3>
            <div style={styles.barChart}>
              {agingData.payables.buckets.map((bucket: any, index: number) => (
                <div key={index} style={styles.barChartItem}>
                  <div style={styles.barLabelContainer}>
                    <span style={styles.barLabel}>{bucket.name}</span>
                    <span style={styles.barPercentage}>{bucket.percentage}%</span>
                  </div>
                  <div style={styles.barContainer}>
                    <div 
                      style={{
                        ...styles.barFill,
                        width: `${bucket.percentage}%`,
                        backgroundColor: bucket.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Pie Chart</h3>
            <div style={styles.pieChart}>
              <svg viewBox="0 0 100 100" style={styles.pieSvg}>
                {agingData.payables.buckets.map((bucket: any, index: number) => {
                  let cumulativePercentage = 0;
                  for (let i = 0; i < index; i++) {
                    cumulativePercentage += agingData.payables.buckets[i].percentage;
                  }
                  const startAngle = (cumulativePercentage * 3.6) * (Math.PI / 180);
                  const endAngle = ((cumulativePercentage + bucket.percentage) * 3.6) * (Math.PI / 180);
                  
                  const x1 = 50 + 40 * Math.sin(startAngle);
                  const y1 = 50 - 40 * Math.cos(startAngle);
                  const x2 = 50 + 40 * Math.sin(endAngle);
                  const y2 = 50 - 40 * Math.cos(endAngle);
                  
                  const largeArcFlag = bucket.percentage > 50 ? 1 : 0;
                  
                  const pathData = [
                    `M 50 50`,
                    `L ${x1} ${y1}`,
                    `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={bucket.color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="20" fill="white" />
                <text x="50" y="45" textAnchor="middle" dominantBaseline="middle" style={styles.pieText}>
                  {formatCurrency(agingData.payables.total)}
                </text>
                <text x="50" y="60" textAnchor="middle" dominantBaseline="middle" style={styles.pieSubText}>
                  Total
                </text>
              </svg>
            </div>
          </div>

          {/* Donut Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Donut Chart</h3>
            <div style={styles.donutChart}>
              <svg viewBox="0 0 100 100" style={styles.donutSvg}>
                {agingData.payables.buckets.map((bucket: any, index: number) => {
                  let cumulativePercentage = 0;
                  for (let i = 0; i < index; i++) {
                    cumulativePercentage += agingData.payables.buckets[i].percentage;
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
                <text x="50" y="45" textAnchor="middle" dominantBaseline="middle" style={styles.donutText}>
                  Total
                </text>
                <text x="50" y="60" textAnchor="middle" dominantBaseline="middle" style={styles.donutSubText}>
                  {formatCurrency(agingData.payables.total)}
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Aging Details Table - All age groups */}
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>Aging Details</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Age Group</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {agingData.payables.buckets.map((bucket: any, index: number) => (
                <tr key={index}>
                  <td style={styles.td}>
                    <span style={{...styles.colorDot, backgroundColor: bucket.color}}></span>
                    {bucket.name}
                  </td>
                  <td style={styles.td}>{formatCurrency(bucket.value)}</td>
                  <td style={styles.td}>{bucket.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Category Page Component - Shows all age groups
const CategoryPage: React.FC<{ 
  title: string; 
  data: any; 
  formatCurrency: (value: number) => string;
}> = ({ title, data, formatCurrency }) => {
  return (
    <div>
      <h2 style={styles.pageSectionTitle}>{title} Aging</h2>
      
      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Bar Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Bar Chart</h3>
          <div style={styles.barChart}>
            {data.buckets.map((bucket: any, index: number) => (
              <div key={index} style={styles.barChartItem}>
                <div style={styles.barLabelContainer}>
                  <span style={styles.barLabel}>{bucket.name}</span>
                  <span style={styles.barPercentage}>{bucket.percentage}%</span>
                </div>
                <div style={styles.barContainer}>
                  <div 
                    style={{
                      ...styles.barFill,
                      width: `${bucket.percentage}%`,
                      backgroundColor: bucket.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Pie Chart</h3>
          <div style={styles.pieChart}>
            <svg viewBox="0 0 100 100" style={styles.pieSvg}>
              {data.buckets.map((bucket: any, index: number) => {
                let cumulativePercentage = 0;
                for (let i = 0; i < index; i++) {
                  cumulativePercentage += data.buckets[i].percentage;
                }
                const startAngle = (cumulativePercentage * 3.6) * (Math.PI / 180);
                const endAngle = ((cumulativePercentage + bucket.percentage) * 3.6) * (Math.PI / 180);
                
                const x1 = 50 + 40 * Math.sin(startAngle);
                const y1 = 50 - 40 * Math.cos(startAngle);
                const x2 = 50 + 40 * Math.sin(endAngle);
                const y2 = 50 - 40 * Math.cos(endAngle);
                
                const largeArcFlag = bucket.percentage > 50 ? 1 : 0;
                
                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={bucket.color}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
              <circle cx="50" cy="50" r="20" fill="white" />
              <text x="50" y="45" textAnchor="middle" dominantBaseline="middle" style={styles.pieText}>
                {formatCurrency(data.total)}
              </text>
              <text x="50" y="60" textAnchor="middle" dominantBaseline="middle" style={styles.pieSubText}>
                Total
              </text>
            </svg>
          </div>
        </div>

        {/* Donut Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Donut Chart</h3>
          <div style={styles.donutChart}>
            <svg viewBox="0 0 100 100" style={styles.donutSvg}>
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
              <text x="50" y="45" textAnchor="middle" dominantBaseline="middle" style={styles.donutText}>
                Total
              </text>
              <text x="50" y="60" textAnchor="middle" dominantBaseline="middle" style={styles.donutSubText}>
                {formatCurrency(data.total)}
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Aging Details Table - All age groups */}
      <div style={styles.tableContainer}>
        <h3 style={styles.tableTitle}>Aging Details</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Age Group</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.buckets.map((bucket: any, index: number) => (
              <tr key={index}>
                <td style={styles.td}>
                  <span style={{...styles.colorDot, backgroundColor: bucket.color}}></span>
                  {bucket.name}
                </td>
                <td style={styles.td}>{formatCurrency(bucket.value)}</td>
                <td style={styles.td}>{bucket.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles
const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    bottom: 0,
    boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    color: 'white',
  },
  sidebarHeader: {
    padding: '28px 24px',
    borderBottom: '1px solid #1e293b',
  },
  sidebarTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    letterSpacing: '-0.5px',
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  },
  sidebarNav: {
    flex: 1,
    padding: '24px 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    marginBottom: '4px',
    color: '#e2e8f0',
    position: 'relative' as const,
  },
  navIcon: {
    fontSize: '18px',
    marginRight: '12px',
    width: '24px',
  },
  navLabel: {
    fontSize: '14px',
    fontWeight: '500',
  },
  navActive: {
    position: 'absolute' as const,
    right: '20px',
    color: '#3b82f6',
    fontSize: '20px',
  },
  sidebarFooter: {
    padding: '24px',
    borderTop: '1px solid #1e293b',
    background: 'linear-gradient(135deg, #0a0f1a 0%, #0f172a 100%)',
  },
  footerLogo: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '4px',
  },
  footerEmail: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  mainContent: {
    flex: 1,
    marginLeft: '260px',
    padding: '30px',
  },
  header: {
    marginBottom: '30px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '40px',
  },
  kpiCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
  },
  kpiTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  },
  kpiMainValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4px',
  },
  kpiSubText: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  kpiChangeIndicator: {
    fontSize: '14px',
    fontWeight: '600',
  },
  analysisSection: {
    marginTop: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '20px',
  },
  pageSectionTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '24px',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '30px',
  },
  chartCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  barChart: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto' as const,
    paddingRight: '8px',
  },
  barChartItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  barLabelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#4b5563',
  },
  barPercentage: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#111827',
  },
  barContainer: {
    height: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden' as const,
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  pieChart: {
    width: '100%',
    height: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieSvg: {
    width: '180px',
    height: '180px',
  },
  pieText: {
    fontSize: '10px',
    fontWeight: '700',
    fill: '#111827',
  },
  pieSubText: {
    fontSize: '8px',
    fill: '#6b7280',
  },
  donutChart: {
    width: '100%',
    height: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutSvg: {
    width: '180px',
    height: '180px',
  },
  donutText: {
    fontSize: '10px',
    fontWeight: '700',
    fill: '#111827',
  },
  donutSubText: {
    fontSize: '8px',
    fill: '#6b7280',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px solid #f0f0f0',
    overflow: 'hidden' as const,
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    padding: '16px 24px',
    margin: 0,
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '14px 24px',
    backgroundColor: '#fafafa',
    borderBottom: '2px solid #f0f0f0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
  },
  td: {
    padding: '12px 24px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
    color: '#1f2937',
  },
  colorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '10px',
  },
};

export default AgeRoot;