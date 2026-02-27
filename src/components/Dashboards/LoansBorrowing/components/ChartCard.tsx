import React, { ReactNode } from 'react';
import './ChartCard.css';

interface ChartCardProps {
  title: string;
  icon: string;
  children: ReactNode;
  tabs?: Array<{ label: string; active: boolean }>;
  onTabChange?: (index: number) => void;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  icon,
  children,
  tabs,
  onTabChange,
}) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">
          <i className={`fas fa-${icon}`}></i>
          <h3>{title}</h3>
        </div>
        {tabs && (
          <div className="chart-tabs">
            {tabs.map((tab: { label: string; active: boolean }, index: number) => (
              <button
                key={index}
                className={`tab-btn ${tab.active ? 'active' : ''}`}
                onClick={() => onTabChange?.(index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="chart-container">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;