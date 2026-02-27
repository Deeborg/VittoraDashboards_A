import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './InterestRates.css';

// Rest of your component code...



const InterestRates: React.FC = () => {
  // Chart data
  const rateTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'SOFR',
        data: [5.3, 5.4, 5.5, 5.6, 5.5, 5.4],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
      },
      {
        label: 'EURIBOR',
        data: [4.0, 4.1, 4.2, 4.3, 4.2, 4.1],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'SONIA',
        data: [5.5, 5.6, 5.7, 5.8, 5.7, 5.6],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const rateDistributionData = {
    labels: ['USD', 'EUR', 'GBP', 'JPY', 'CHF'],
    datasets: [
      {
        label: 'Interest Rate (%)',
        data: [5.25, 4.15, 5.75, 2.85, 5.15],
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderRadius: 8,
      },
    ],
  };

  const facilitiesData = [
    { id: 'ECB-2023-001', currency: 'USD', amount: '$500M', rate: '5.25%', benchmark: 'SOFR', spread: '+2.75%', nextReset: '2024-03-15', status: 'active' },
    { id: 'ECB-2023-002', currency: 'EUR', amount: '€300M', rate: '4.15%', benchmark: 'EURIBOR', spread: '+2.15%', nextReset: '2024-04-20', status: 'active' },
    { id: 'ECB-2023-003', currency: 'GBP', amount: '£200M', rate: '5.75%', benchmark: 'SONIA', spread: '+3.25%', nextReset: '2024-05-10', status: 'active' },
    { id: 'ECB-2022-001', currency: 'USD', amount: '$300M', rate: '4.95%', benchmark: 'SOFR', spread: '+2.45%', nextReset: '2024-06-30', status: 'active' },
    { id: 'ECB-2022-002', currency: 'JPY', amount: '¥150M', rate: '2.85%', benchmark: 'TIBOR', spread: '+1.85%', nextReset: '2024-06-01', status: 'active' },
  ];

  return (
    <div className="interest-rates-container">
      <div className="page-header">
        <h2>Interest Rates</h2>
        <p className="subtitle">Analysis of interest rates across all ECB facilities</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card-small">
          <span className="stat-icon">📊</span>
          <div>
            <div className="stat-label">Average Rate</div>
            <div className="stat-value">4.85%</div>
          </div>
        </div>
        <div className="stat-card-small">
          <span className="stat-icon">📉</span>
          <div>
            <div className="stat-label">Lowest Rate</div>
            <div className="stat-value">2.85% (JPY)</div>
          </div>
        </div>
        <div className="stat-card-small">
          <span className="stat-icon">📈</span>
          <div>
            <div className="stat-label">Highest Rate</div>
            <div className="stat-value">5.75% (GBP)</div>
          </div>
        </div>
        <div className="stat-card-small">
          <span className="stat-icon">🔄</span>
          <div>
            <div className="stat-label">Next Reset</div>
            <div className="stat-value">15 Mar 2024</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Interest Rate Distribution</h3>
          <div className="chart-container">
            <Bar 
              data={rateDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: { 
                    callbacks: {
                      label: (ctx) => `Rate: ${ctx.raw}%`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 7,
                    grid: { color: '#e2e8f0' },
                    ticks: { callback: (value) => value + '%' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Benchmark Rate Trends</h3>
          <div className="chart-container">
            <Line 
              data={rateTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: { 
                    callbacks: {
                      label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`
                    }
                  }
                },
                scales: {
                  y: {
                    grid: { color: '#e2e8f0' },
                    ticks: { callback: (value) => value + '%' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Facilities Table */}
      <div className="table-card">
        <h3>Interest Rate Details by Facility</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Facility ID</th>
              <th>Currency</th>
              <th>Principal</th>
              <th>Interest Rate</th>
              <th>Benchmark</th>
              <th>Spread</th>
              <th>Next Reset</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {facilitiesData.map((facility) => (
              <tr key={facility.id}>
                <td className="facility-id">{facility.id}</td>
                <td className="currency">{facility.currency}</td>
                <td>{facility.amount}</td>
                <td className="rate">{facility.rate}</td>
                <td>{facility.benchmark}</td>
                <td>{facility.spread}</td>
                <td>{facility.nextReset}</td>
                <td><span className="badge-active">{facility.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rate Alerts */}
      <div className="alerts-section">
        <h3>Rate Alerts</h3>
        <div className="alerts-grid">
          <div className="alert-item warning">
            <span>⚠️</span>
            <span>SOFR expected to increase by 25bps next month</span>
          </div>
          <div className="alert-item info">
            <span>ℹ️</span>
            <span>JPY facility (ECB-2022-002) resetting on 2024-06-01</span>
          </div>
          <div className="alert-item success">
            <span>✅</span>
            <span>All interest payments processed for February</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestRates;