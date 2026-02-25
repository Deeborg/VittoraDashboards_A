import React from 'react';
import './StatCard.scss';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon?: string;
  color?: string;
  format?: 'currency' | 'percent' | 'number';
  titlePosition?: 'top' | 'bottom';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change = 0,
  icon,
  color = '#3b82f6',
  format = 'number',
  titlePosition = 'top',
}) => {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const isPositive = change >= 0;

  return (
    <div className="stat-card">
      {titlePosition === 'top' && (
        <div className="stat-header">
          <h3 className="stat-title">{title}</h3>
          {icon && <span className="stat-icon" style={{ color }}>{icon}</span>}
        </div>
      )}
      
      <div className="stat-content">
        <div className="stat-value">{formatValue()}</div>
        {change !== 0 && (
          <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
            <span className="change-arrow">
              {isPositive ? '↑' : '↓'}
            </span>
            <span className="change-value">
              {Math.abs(change)}%
            </span>
            <span className="change-label">from last month</span>
          </div>
        )}
      </div>
      
      {titlePosition === 'bottom' && (
        <div className="stat-footer">
          <h3 className="stat-title">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default StatCard;