import React from 'react';
import './Hedging.css';

const Hedging: React.FC = () => {
  const hedgingData = [
    { currency: 'USD', total: '$1,912.5M', hedged: '$1,600.0M', ratio: '83.7%', instruments: 'Forwards, Options', counterparty: 'JP Morgan', maturity: '1-12 months', trend: '+2.3%' },
    { currency: 'EUR', total: '€1,062.5M', hedged: '€850.0M', ratio: '80.0%', instruments: 'Forwards', counterparty: 'Deutsche Bank', maturity: '1-6 months', trend: '+1.5%' },
    { currency: 'GBP', total: '£510.0M', hedged: '£400.0M', ratio: '78.4%', instruments: 'Swaps', counterparty: 'Barclays', maturity: '3-9 months', trend: '-0.8%' },
    { currency: 'JPY', total: '¥340.0M', hedged: '¥272.0M', ratio: '80.0%', instruments: 'Forwards, Options', counterparty: 'MUFG', maturity: '1-3 months', trend: '+1.2%' },
    { currency: 'CHF', total: 'CHF150.0M', hedged: 'CHF120.0M', ratio: '80.0%', instruments: 'Swaps', counterparty: 'UBS', maturity: '6-12 months', trend: '+0.5%' },
  ];

  const instrumentsData = [
    { type: 'Forwards', count: 8, value: '$2.1B', percentage: 45 },
    { type: 'Options', count: 5, value: '$1.2B', percentage: 25 },
    { type: 'Swaps', count: 4, value: '$0.9B', percentage: 20 },
    { type: 'Futures', count: 3, value: '$0.5B', percentage: 10 },
  ];

  return (
    <div className="hedging-container">
      <div className="page-header">
        <h2>Hedging Position</h2>
        <p className="subtitle">Comprehensive view of hedging instruments and coverage</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card-large">
          <span className="stat-icon">🛡️</span>
          <div>
            <div className="stat-label">Overall Hedging Ratio</div>
            <div className="stat-value">68%</div>
            <div className="stat-trend positive">↑ +3% from last month</div>
          </div>
        </div>
        <div className="stat-card-large">
          <span className="stat-icon">💰</span>
          <div>
            <div className="stat-label">Total Hedged Amount</div>
            <div className="stat-value">$3.2B</div>
            <div className="stat-trend">Across all currencies</div>
          </div>
        </div>
        <div className="stat-card-large">
          <span className="stat-icon">📊</span>
          <div>
            <div className="stat-label">Active Instruments</div>
            <div className="stat-value">12</div>
            <div className="stat-trend">4 types of instruments</div>
          </div>
        </div>
      </div>

      {/* Instruments Overview */}
      <div className="instruments-section">
        <h3>Hedging Instruments Breakdown</h3>
        <div className="instruments-grid">
          {instrumentsData.map((item) => (
            <div key={item.type} className="instrument-card">
              <div className="instrument-header">
                <span className="instrument-type">{item.type}</span>
                <span className="instrument-count">{item.count}</span>
              </div>
              <div className="instrument-value">{item.value}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.percentage}%` }}></div>
              </div>
              <span className="instrument-percent">{item.percentage}% of portfolio</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hedging Table */}
      <div className="table-card">
        <h3>Hedging Details by Currency</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Currency</th>
              <th>Total Exposure</th>
              <th>Hedged Amount</th>
              <th>Hedging Ratio</th>
              <th>Instruments</th>
              <th>Counterparty</th>
              <th>Maturity</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {hedgingData.map((row) => (
              <tr key={row.currency}>
                <td className="currency-cell">{row.currency}</td>
                <td>{row.total}</td>
                <td>{row.hedged}</td>
                <td>
                  <div className="ratio-cell">
                    <span>{row.ratio}</span>
                    <div className="ratio-bar">
                      <div className="ratio-fill" style={{ width: row.ratio }}></div>
                    </div>
                  </div>
                </td>
                <td>{row.instruments}</td>
                <td>{row.counterparty}</td>
                <td>{row.maturity}</td>
                <td className={row.trend.startsWith('+') ? 'trend-up' : 'trend-down'}>{row.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Counterparty Distribution */}
      <div className="counterparty-section">
        <h3>Counterparty Distribution</h3>
        <div className="counterparty-grid">
          <div className="counterparty-item">
            <span>JP Morgan</span>
            <span className="percentage">35%</span>
          </div>
          <div className="counterparty-item">
            <span>Deutsche Bank</span>
            <span className="percentage">25%</span>
          </div>
          <div className="counterparty-item">
            <span>Barclays</span>
            <span className="percentage">20%</span>
          </div>
          <div className="counterparty-item">
            <span>MUFG</span>
            <span className="percentage">12%</span>
          </div>
          <div className="counterparty-item">
            <span>UBS</span>
            <span className="percentage">8%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hedging;