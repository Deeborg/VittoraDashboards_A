import React from 'react';
import ChartCard from '../../components/ChartCard/ChartCard';
import './Performance.scss';

const Performance: React.FC = () => {
  const kpiData = [
    { name: 'Jan', value: 420000, revenue: 420000, target: 450000 },
    { name: 'Feb', value: 480000, revenue: 480000, target: 450000 },
    { name: 'Mar', value: 510000, revenue: 510000, target: 500000 },
    { name: 'Apr', value: 580000, revenue: 580000, target: 550000 },
    { name: 'May', value: 620000, revenue: 620000, target: 600000 },
    { name: 'Jun', value: 680000, revenue: 680000, target: 650000 },
    { name: 'Jul', value: 720000, revenue: 720000, target: 700000 },
    { name: 'Aug', value: 750000, revenue: 750000, target: 750000 },
    { name: 'Sep', value: 780000, revenue: 780000, target: 800000 },
    { name: 'Oct', value: 820000, revenue: 820000, target: 850000 },
    { name: 'Nov', value: 880000, revenue: 880000, target: 900000 },
    { name: 'Dec', value: 950000, revenue: 950000, target: 950000 },
  ];

  const teamPerformance = [
    { name: 'Sales Team', achieved: 95, target: 100 },
    { name: 'Marketing', achieved: 88, target: 90 },
    { name: 'Customer Support', achieved: 92, target: 95 },
    { name: 'Product', achieved: 98, target: 95 },
    { name: 'Operations', achieved: 85, target: 90 },
  ];

  return (
    <div className="performance">
      <div className="performance-header">
        <h2>Performance Metrics</h2>
        <p className="performance-subtitle">Track and analyze key performance indicators</p>
      </div>

      <div className="kpi-cards">
        <div className="kpi-card">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-content">
            <h3>Revenue Target</h3>
            <div className="kpi-value">$8.2M <span className="kpi-change positive">+12%</span></div>
            <div className="kpi-progress">
              <div className="progress-bar" style={{ width: '82%' }}></div>
            </div>
            <div className="kpi-target">Target: $10M</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📈</div>
          <div className="kpi-content">
            <h3>Growth Rate</h3>
            <div className="kpi-value">24.5% <span className="kpi-change positive">+4.2%</span></div>
            <div className="kpi-progress">
              <div className="progress-bar" style={{ width: '75%', background: '#10b981' }}></div>
            </div>
            <div className="kpi-target">Industry Avg: 18%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <h3>Customer Satisfaction</h3>
            <div className="kpi-value">4.8 <span className="kpi-change positive">+0.3</span></div>
            <div className="kpi-progress">
              <div className="progress-bar" style={{ width: '96%', background: '#8b5cf6' }}></div>
            </div>
            <div className="kpi-target">Rating: 5.0</div>
          </div>
        </div>
      </div>

      <div className="performance-charts">
        {/* <div className="chart-container">
          <ChartCard
            title="Revenue vs Target"
            type="composed"
            data={kpiData}
            height={350}
          />
        </div> */}

        <div className="chart-container">
          <ChartCard
            title="Team Performance"
            type="bar"
            data={teamPerformance.map(team => ({
              name: team.name,
              value: team.achieved,
              achieved: team.achieved,
              target: team.target,
            }))}
            height={350}
          />
        </div>
      </div>

      <div className="performance-table">
        <h3>Quarterly Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Quarter</th>
              <th>Revenue</th>
              <th>Growth</th>
              <th>Profit Margin</th>
              <th>Customer Growth</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { quarter: 'Q1 2024', revenue: '$2.1M', growth: '15%', margin: '32%', customers: '+12%', status: 'Exceeded' },
              { quarter: 'Q2 2024', revenue: '$2.4M', growth: '18%', margin: '34%', customers: '+15%', status: 'Exceeded' },
              { quarter: 'Q3 2024', revenue: '$2.7M', growth: '21%', margin: '35%', customers: '+18%', status: 'On Track' },
              { quarter: 'Q4 2024', revenue: '$3.0M', growth: '25%', margin: '36%', customers: '+22%', status: 'Projected' },
            ].map((row, index) => (
              <tr key={index}>
                <td><strong>{row.quarter}</strong></td>
                <td>{row.revenue}</td>
                <td><span className="growth-positive">{row.growth}</span></td>
                <td>{row.margin}</td>
                <td>{row.customers}</td>
                <td>
                  <span className={`status-badge ${row.status.toLowerCase().replace(' ', '-')}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Performance;