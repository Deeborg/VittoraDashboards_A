import React from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext'; // Fixed path - go up 2 levels
import './CurrencyExposure.css';

// Define the type for currency data
interface CurrencyExposureRow {
  currency: string;
  amount: string;
  percentage: number;
  hedgedAmount: string;
  exposedAmount: string;
  riskLevel: string;
}

const CurrencyExposure: React.FC = () => {
  const { currencyFilter } = useDashboard();

  // Pie chart data
  const pieData = {
    labels: ['USD (45%)', 'EUR (25%)', 'GBP (12%)', 'JPY (8%)', 'AUD (5%)', 'INR (3%)', 'Other (2%)'],
    datasets: [
      {
        data: [45, 25, 12, 8, 5, 3, 2],
        backgroundColor: ['#4d4dff', '#4dffb8', '#ff8c4d', '#ff4d4d', '#b84dff', '#ffb84d', '#a0a0d0'],
        borderWidth: 0,
      },
    ],
  };

  // Line chart data
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'USD/INR',
        data: [82.5, 82.8, 83.2, 83.5, 83.1, 83.4],
        borderColor: '#4d4dff',
        backgroundColor: 'rgba(77, 77, 255, 0.1)',
        tension: 0.4,
      },
      {
        label: 'EUR/INR',
        data: [90.1, 90.5, 91.2, 91.5, 91.0, 91.3],
        borderColor: '#4dffb8',
        backgroundColor: 'rgba(77, 255, 184, 0.1)',
        tension: 0.4,
      },
      {
        label: 'GBP/INR',
        data: [105.2, 105.8, 106.5, 107.0, 106.3, 106.8],
        borderColor: '#ff8c4d',
        backgroundColor: 'rgba(255, 140, 77, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Table data
  const tableData: CurrencyExposureRow[] = [
    { currency: 'USD', amount: '$1,912.5', percentage: 45, hedgedAmount: '$1,600.0', exposedAmount: '$312.5', riskLevel: 'Medium' },
    { currency: 'EUR', amount: '€1,062.5', percentage: 25, hedgedAmount: '€850.0', exposedAmount: '€212.5', riskLevel: 'Low' },
    { currency: 'GBP', amount: '£510.0', percentage: 12, hedgedAmount: '£400.0', exposedAmount: '£110.0', riskLevel: 'Medium' },
    { currency: 'JPY', amount: '¥340.0', percentage: 8, hedgedAmount: '¥272.0', exposedAmount: '¥68.0', riskLevel: 'High' },
    { currency: 'AUD', amount: 'A$212.5', percentage: 5, hedgedAmount: 'A$170.0', exposedAmount: 'A$42.5', riskLevel: 'Medium' },
    { currency: 'INR', amount: '₹4,520.0', percentage: 3, hedgedAmount: '₹3,200.0', exposedAmount: '₹1,320.0', riskLevel: 'Medium' },
  ];

  return (
    <div className="currency-exposure-container">
      <div className="section-header">
        <h2>Currency Exposure</h2>
        <p className="subtitle">Detailed analysis of currency exposure across all ECB loans</p>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Currency Distribution</h3>
          <div className="chart-container">
            <Pie data={pieData} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Exchange Rate Trends</h3>
          <div className="chart-container">
            <Line data={lineData} />
          </div>
        </div>
      </div>

      <div className="table-section">
        <h3>Exposure by Currency</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Currency</th>
              <th>Amount</th>
              <th>Percentage</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.currency}</td>
                <td>{row.amount}</td>
                <td>{row.percentage}%</td>
                <td>{row.riskLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencyExposure;