// components/KPICard.tsx
import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, color = '#1f2937' }) => {
  return (
    <div
      style={{
        flex: 1,
        minWidth: '200px',
        backgroundColor: '#f9fafb',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        margin: '10px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${color}55`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }}
    >
      <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</p>
    </div>
  );
};

export default KPICard;
