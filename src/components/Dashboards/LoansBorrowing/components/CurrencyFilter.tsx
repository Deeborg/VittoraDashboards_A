import React from 'react';
import { useDashboard } from '../context/DashboardContext';

const CurrencyFilter: React.FC = () => {
  const { currencyFilter, setCurrencyFilter } = useDashboard();

  return (
    <div className="currency-filter-wrapper">
      <span className="filter-label">
        <i className="fas fa-filter"></i> Filter by Currency:
      </span>
      <select
        className="currency-filter-select"
        value={currencyFilter}
        onChange={(e) => setCurrencyFilter(e.target.value)}
      >
        <option value="ALL">All Currencies</option>
        <option value="USD">🇺🇸 USD – US Dollar</option>
        <option value="EUR">🇪🇺 EUR – Euro</option>
        <option value="GBP">🇬🇧 GBP – Pound Sterling</option>
        <option value="JPY">🇯🇵 JPY – Japanese Yen</option>
        <option value="AUD">🇦🇺 AUD – Australian Dollar</option>
        <option value="INR">🇮🇳 INR – Indian Rupee</option>
      </select>
      <span className="filter-hint">
        <i className="fas fa-info-circle"></i> Highlight matching rows
      </span>
    </div>
  );
};

export default CurrencyFilter;