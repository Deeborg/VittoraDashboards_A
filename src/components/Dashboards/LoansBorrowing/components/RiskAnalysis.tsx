import React from 'react';
// This one is already correct:
import './loanRiskAnalysis.css';

const RiskAnalysis: React.FC = () => {
  const riskData = [
    { category: 'Interest Rate Risk', exposure: '₹174.3B', probability: 'Medium', impact: 'High', score: 85, mitigation: 'Fixed rate swaps', owner: 'Treasury', trend: 'stable' },
    { category: 'Currency Risk', exposure: '₹124.5B', probability: 'High', impact: 'Medium', score: 75, mitigation: 'Forward contracts', owner: 'FX Desk', trend: 'increasing' },
    { category: 'Liquidity Risk', exposure: '₹66.4B', probability: 'Low', impact: 'High', score: 60, mitigation: 'Credit lines', owner: 'Treasury', trend: 'stable' },
    { category: 'Credit Risk', exposure: '₹41.5B', probability: 'Low', impact: 'Medium', score: 45, mitigation: 'Diversification', owner: 'Risk Mgmt', trend: 'decreasing' },
    { category: 'Operational Risk', exposure: 'N/A', probability: 'Low', impact: 'Low', score: 30, mitigation: 'Process controls', owner: 'Operations', trend: 'stable' },
    { category: 'Market Risk', exposure: '₹99.6B', probability: 'Medium', impact: 'High', score: 65, mitigation: 'Hedging program', owner: 'Treasury', trend: 'increasing' },
  ];

  return (
    <div className="risk-analysis-container">
      <div className="page-header">
        <h2>Risk Analysis</h2>
        <p className="subtitle">Comprehensive risk assessment across all risk categories</p>
      </div>

      {/* Risk Metrics */}
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-icon">📊</span>
          <div>
            <div className="metric-label">Value at Risk (VaR)</div>
            <div className="metric-value">₹10,375M</div>
            <div className="metric-detail">95% confidence, 10-day</div>
          </div>
        </div>
        <div className="metric-card">
          <span className="metric-icon">⚠️</span>
          <div>
            <div className="metric-label">Expected Loss</div>
            <div className="metric-value">₹3,486M</div>
            <div className="metric-detail">Annual projection</div>
          </div>
        </div>
        <div className="metric-card">
          <span className="metric-icon">⚖️</span>
          <div>
            <div className="metric-label">Risk Weighted Assets</div>
            <div className="metric-value">₹232.4B</div>
            <div className="metric-detail">Under Basel III</div>
          </div>
        </div>
      </div>

      {/* Risk Matrix Table */}
      <div className="table-card">
        <h3>Risk Assessment Matrix</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Risk Category</th>
              <th>Exposure</th>
              <th>Probability</th>
              <th>Impact</th>
              <th>Risk Score</th>
              <th>Mitigation Strategy</th>
              <th>Owner</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {riskData.map((risk, index) => (
              <tr key={index}>
                <td className="risk-category">{risk.category}</td>
                <td>{risk.exposure}</td>
                <td>
                  <span className={`probability-${risk.probability.toLowerCase()}`}>
                    {risk.probability}
                  </span>
                </td>
                <td>
                  <span className={`impact-${risk.impact.toLowerCase()}`}>
                    {risk.impact}
                  </span>
                </td>
                <td>
                  <div className="score-cell">
                    <span>{risk.score}</span>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${risk.score}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>{risk.mitigation}</td>
                <td>{risk.owner}</td>
                <td>
                  <span className={`trend-${risk.trend}`}>
                    {risk.trend === 'increasing' ? '↑' : risk.trend === 'decreasing' ? '↓' : '→'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk Heat Map */}
      <div className="heatmap-section">
        <h3>Risk Heat Map</h3>
        <div className="heatmap-grid">
          <div className="heatmap-cell high-high">Interest Rate Risk</div>
          <div className="heatmap-cell high-medium">Market Risk</div>
          <div className="heatmap-cell medium-high">Currency Risk</div>
          <div className="heatmap-cell medium-medium">Liquidity Risk</div>
          <div className="heatmap-cell low-medium">Credit Risk</div>
          <div className="heatmap-cell low-low">Operational Risk</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h3>Risk Recommendations</h3>
        <ul className="recommendations-list">
          <li>Increase hedging for GBP exposure - currently at 78.4% vs target 85%</li>
          <li>Review interest rate swap portfolio before June reset dates</li>
          <li>Monitor leverage ratio closely - currently at 4.2x vs threshold 4.0x</li>
          <li>Consider additional credit lines for liquidity buffer</li>
        </ul>
      </div>
    </div>
  );
};

export default RiskAnalysis;