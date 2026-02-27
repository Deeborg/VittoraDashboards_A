import React from 'react';
import './../styles/dashboard.css';

interface PeriodSelectorProps {
  period: 'monthly' | 'quarterly' | 'yearly';
  onPeriodChange: (period: 'monthly' | 'quarterly' | 'yearly') => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ period, onPeriodChange }) => {
  return (
    <div className="period-selector">
      <button
        className={`period-button ${period === 'monthly' ? 'active' : ''}`}
        onClick={() => onPeriodChange('monthly')}
      >
        Monthly
      </button>
      <button
        className={`period-button ${period === 'quarterly' ? 'active' : ''}`}
        onClick={() => onPeriodChange('quarterly')}
      >
        Quarterly
      </button>
      <button
        className={`period-button ${period === 'yearly' ? 'active' : ''}`}
        onClick={() => onPeriodChange('yearly')}
      >
        Yearly
      </button>
    </div>
  );
};

export default PeriodSelector;