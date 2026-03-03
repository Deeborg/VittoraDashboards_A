import React, { useState } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';
import './CurrencyExposure.css';

// Define the type for currency data
interface CurrencyExposureRow {
  currency: string;
  amount: string;
  inrAmount: string;
  percentage: number;
  hedgedAmount: string;
  exposedAmount: string;
  riskLevel: string;
  flag: string;
}

const CurrencyExposure: React.FC = () => {
  const { currencyFilter, setCurrencyFilter } = useDashboard();

  // State for selected currency filter
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');

  // Currency options for dropdown
  const currencyOptions = [
    { value: 'ALL', label: 'All Currencies', flag: '🌐' },
    { value: 'USD', label: 'US Dollar', flag: '🇺🇸' },
    { value: 'EUR', label: 'Euro', flag: '🇪🇺' },
    { value: 'GBP', label: 'Pound Sterling', flag: '🇬🇧' },
    { value: 'JPY', label: 'Japanese Yen', flag: '🇯🇵' },
    { value: 'AUD', label: 'Australian Dollar', flag: '🇦🇺' },
    { value: 'INR', label: 'Indian Rupee', flag: '🇮🇳' },
    { value: 'CHF', label: 'Swiss Franc', flag: '🇨🇭' },
    { value: 'CAD', label: 'Canadian Dollar', flag: '🇨🇦' },
    { value: 'SGD', label: 'Singapore Dollar', flag: '🇸🇬' },
    { value: 'CNY', label: 'Chinese Yuan', flag: '🇨🇳' }
  ];

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
      {
        label: 'JPY/INR',
        data: [0.55, 0.56, 0.57, 0.58, 0.57, 0.56],
        borderColor: '#ff4d4d',
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        tension: 0.4,
      },
      {
        label: 'AUD/INR',
        data: [54.2, 54.5, 55.1, 55.3, 55.0, 55.2],
        borderColor: '#b84dff',
        backgroundColor: 'rgba(184, 77, 255, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Table data with INR amounts and flags
  const tableData: CurrencyExposureRow[] = [
    { currency: 'USD', amount: '$1,912.5M', inrAmount: '₹16,256Cr', percentage: 45, hedgedAmount: '$1,600.0M', exposedAmount: '$312.5M', riskLevel: 'Medium', flag: '🇺🇸' },
    { currency: 'EUR', amount: '€1,062.5M', inrAmount: '₹9,562Cr', percentage: 25, hedgedAmount: '€850.0M', exposedAmount: '€212.5M', riskLevel: 'Low', flag: '🇪🇺' },
    { currency: 'GBP', amount: '£510.0M', inrAmount: '₹5,100Cr', percentage: 12, hedgedAmount: '£400.0M', exposedAmount: '£110.0M', riskLevel: 'Medium', flag: '🇬🇧' },
    { currency: 'JPY', amount: '¥340.0M', inrAmount: '₹2,040Cr', percentage: 8, hedgedAmount: '¥272.0M', exposedAmount: '¥68.0M', riskLevel: 'High', flag: '🇯🇵' },
    { currency: 'AUD', amount: 'A$212.5M', inrAmount: '₹1,062Cr', percentage: 5, hedgedAmount: 'A$170.0M', exposedAmount: 'A$42.5M', riskLevel: 'Medium', flag: '🇦🇺' },
    { currency: 'INR', amount: '₹4,520.0M', inrAmount: '₹4,520Cr', percentage: 3, hedgedAmount: '₹3,200.0M', exposedAmount: '₹1,320.0M', riskLevel: 'Medium', flag: '🇮🇳' },
    { currency: 'CHF', amount: 'CHF127.5M', inrAmount: '₹1,147Cr', percentage: 2, hedgedAmount: 'CHF100.0M', exposedAmount: 'CHF27.5M', riskLevel: 'Low', flag: '🇨🇭' },
  ];

  // Filter table data based on selected currency
  const filteredTableData = selectedCurrency === 'ALL' 
    ? tableData 
    : tableData.filter(row => row.currency === selectedCurrency);

  // Calculate summary metrics
  const totalExposure = 36130; // in Cr
  const totalHedged = tableData.reduce((sum, row) => {
    const amount = parseFloat(row.hedgedAmount.replace(/[^0-9.-]+/g, ''));
    return sum + amount;
  }, 0);

  const totalExposureAmount = tableData.reduce((sum, row) => {
    const amount = parseFloat(row.amount.replace(/[^0-9.-]+/g, ''));
    return sum + amount;
  }, 0);

  const avgHedgingRatio = (totalHedged / totalExposureAmount) * 100;
  const highRiskCount = tableData.filter(row => row.riskLevel === 'High').length;

  // Handle currency change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCurrency(value);
    setCurrencyFilter(value);
  };

  return (
    <div className="currency-exposure-container">
      {/* Header Section with Title and Subtitle */}
      <div className="page-header">
        <h1 className="page-title">Currency Exposure</h1>
        <p className="page-subtitle">Detailed analysis of currency exposure across all ECB loans</p>
      </div>

      {/* Summary Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#4d4dff' }}>💰</div>
          <div className="metric-content">
            <div className="metric-label">TOTAL EXPOSURE</div>
            <div className="metric-value">₹36,130Cr</div>
            <div className="metric-subvalue">$4.25B USD</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#10b981' }}>🛡️</div>
          <div className="metric-content">
            <div className="metric-label">HEDGING RATIO</div>
            <div className="metric-value">{avgHedgingRatio.toFixed(1)}%</div>
            <div className="metric-subvalue">${totalHedged.toFixed(1)}M hedged</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#f59e0b' }}>⚠️</div>
          <div className="metric-content">
            <div className="metric-label">HIGH RISK CURRENCIES</div>
            <div className="metric-value">{highRiskCount}</div>
            <div className="metric-subvalue">JPY needs attention</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Currency Distribution</h3>
          <div className="chart-container">
            <Pie data={pieData} />
          </div>
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Exchange Rate Trends</h3>
          <div className="chart-container">
            <Line data={lineData} />
          </div>
        </div>
      </div>

      {/* Table Section with Filter */}
      <div className="table-section">
        <div className="table-header-with-filter">
          <h3 className="table-title">Exposure by Currency</h3>
          
          {/* Filter Dropdown - Properly Aligned */}
          <div className="filter-controls">
            <div className="filter-dropdown">
              <label htmlFor="currency-filter" className="filter-label">
                <i className="fas fa-filter"></i> Filter by:
              </label>
              <select
                id="currency-filter"
                className="filter-select"
                value={selectedCurrency}
                onChange={handleCurrencyChange}
              >
                {currencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.flag} {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedCurrency !== 'ALL' && (
              <div className="active-filter">
                <span>Showing: {currencyOptions.find(c => c.value === selectedCurrency)?.flag} {selectedCurrency}</span>
                <button 
                  className="clear-filter"
                  onClick={() => handleCurrencyChange({ target: { value: 'ALL' } } as any)}
                  title="Clear filter"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Currency</th>
                <th>Amount (Foreign)</th>
                <th>Amount (INR)</th>
                <th>%</th>
                <th>Hedged</th>
                <th>Exposed</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {filteredTableData.map((row, index) => (
                <tr key={index} className={row.currency === selectedCurrency ? 'highlighted' : ''}>
                  <td>
                    <div className="currency-cell">
                      <span className="currency-flag">{row.flag}</span>
                      <span className="currency-code">{row.currency}</span>
                    </div>
                  </td>
                  <td className="amount">{row.amount}</td>
                  <td className="amount">{row.inrAmount}</td>
                  <td className="percentage">{row.percentage}%</td>
                  <td className="amount">{row.hedgedAmount}</td>
                  <td className="amount">{row.exposedAmount}</td>
                  <td className="risk-cell">
                    <span className={`risk-badge risk-${row.riskLevel.toLowerCase()}`}>
                      {row.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTableData.length === 0 && (
          <div className="no-data">
            No data available for selected currency
          </div>
        )}
        
        <div className="table-footer">
          <span>Showing {filteredTableData.length} of {tableData.length} currencies</span>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExposure;