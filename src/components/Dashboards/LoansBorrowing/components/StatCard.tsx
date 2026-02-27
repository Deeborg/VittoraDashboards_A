import React from 'react';
import { StatCardProps } from './types'; // Changed from '../types' to './types'
import './StatCard.css';

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, color }) => {
  return (
    <div className="stat-card" style={{ background: color }}>
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-change ${trend === 'up' ? 'positive' : 'negative'}`}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;