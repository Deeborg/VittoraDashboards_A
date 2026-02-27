import React from 'react';
import './Covenants.css';

const Covenants: React.FC = () => {
  const covenantData = [
    { covenant: 'Debt Service Coverage Ratio (DSCR)', metric: '1.8x', threshold: '≥ 1.5x', status: 'Compliant', facility: 'ECB-2023-001', nextTest: '2024-06-30', headroom: '+0.3x' },
    { covenant: 'Loan to Value (LTV)', metric: '65%', threshold: '≤ 70%', status: 'Compliant', facility: 'ECB-2023-001', nextTest: '2024-06-30', headroom: '+5%' },
    { covenant: 'Interest Coverage Ratio (ICR)', metric: '4.2x', threshold: '≥ 3.5x', status: 'Compliant', facility: 'ECB-2023-002', nextTest: '2024-07-15', headroom: '+0.7x' },
    { covenant: 'Liquidity Coverage Ratio (LCR)', metric: '115%', threshold: '≥ 100%', status: 'Compliant', facility: 'ECB-2023-003', nextTest: '2024-08-01', headroom: '+15%' },
    { covenant: 'Net Stable Funding Ratio (NSFR)', metric: '108%', threshold: '≥ 100%', status: 'Compliant', facility: 'ECB-2022-001', nextTest: '2024-05-20', headroom: '+8%' },
    { covenant: 'Leverage Ratio', metric: '4.2x', threshold: '≤ 4.0x', status: 'At Risk', facility: 'ECB-2021-001', nextTest: '2024-04-15', headroom: '-0.2x' },
    { covenant: 'Debt/EBITDA', metric: '3.8x', threshold: '≤ 3.5x', status: 'Breached', facility: 'ECB-2020-001', nextTest: '2024-03-31', headroom: '-0.3x' },
  ];

  const statusCounts = {
    compliant: 5,
    atRisk: 1,
    breached: 1
  };

  return (
    <div className="covenants-container">
      <div className="page-header">
        <h2>Covenant Compliance</h2>
        <p className="subtitle">Monitoring of all financial and operational covenants</p>
      </div>

      {/* Status Cards */}
      <div className="status-grid">
        <div className="status-card compliant">
          <span className="status-icon">✅</span>
          <div>
            <div className="status-label">Compliant</div>
            <div className="status-value">{statusCounts.compliant}</div>
          </div>
        </div>
        <div className="status-card at-risk">
          <span className="status-icon">⚠️</span>
          <div>
            <div className="status-label">At Risk</div>
            <div className="status-value">{statusCounts.atRisk}</div>
          </div>
        </div>
        <div className="status-card breached">
          <span className="status-icon">❌</span>
          <div>
            <div className="status-label">Breached</div>
            <div className="status-value">{statusCounts.breached}</div>
          </div>
        </div>
      </div>

      {/* Covenant Table */}
      <div className="table-card">
        <h3>Covenant Details</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Covenant</th>
              <th>Current Metric</th>
              <th>Threshold</th>
              <th>Headroom</th>
              <th>Status</th>
              <th>Facility ID</th>
              <th>Next Test Date</th>
            </tr>
          </thead>
          <tbody>
            {covenantData.map((item, index) => (
              <tr key={index} className={item.status.toLowerCase().replace(' ', '-')}>
                <td className="covenant-name">{item.covenant}</td>
                <td className="metric">{item.metric}</td>
                <td>{item.threshold}</td>
                <td className={item.headroom.startsWith('+') ? 'headroom-positive' : 'headroom-negative'}>
                  {item.headroom}
                </td>
                <td>
                  <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                    {item.status}
                  </span>
                </td>
                <td className="facility">{item.facility}</td>
                <td>{item.nextTest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts Section */}
      <div className="alerts-section">
        <h3>Action Required</h3>
        <div className="alert-list">
          <div className="alert-item high">
            <span className="alert-icon">🔴</span>
            <div className="alert-content">
              <strong>Breached Covenant: Debt/EBITDA</strong>
              <p>Facility ECB-2020-001 requires immediate attention. Current ratio 3.8x exceeds threshold 3.5x.</p>
            </div>
          </div>
          <div className="alert-item medium">
            <span className="alert-icon">🟡</span>
            <div className="alert-content">
              <strong>At Risk: Leverage Ratio</strong>
              <p>Facility ECB-2021-001 approaching threshold. Current 4.2x, threshold 4.0x.</p>
            </div>
          </div>
          <div className="alert-item low">
            <span className="alert-icon">🔵</span>
            <div className="alert-content">
              <strong>Upcoming Test: DSCR</strong>
              <p>Next test for ECB-2023-001 scheduled on 2024-06-30</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Covenants;