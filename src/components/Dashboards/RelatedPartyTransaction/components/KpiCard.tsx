import React from 'react';
import './../styles/dashboard.css';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  color?: string;
  icon?: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, color, icon }) => {
  return (
    <div className="kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#718096', fontWeight: 500 }}>{title}</div>
          <div className="kpi-value" style={{ color: color || '#2d3748' }}>
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </div>
          {change && (
            <div className={`kpi-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>
              {change}
            </div>
          )}
        </div>
        {icon && <div style={{ fontSize: '24px' }}>{icon}</div>}
      </div>
    </div>
  );
};

export default KpiCard;