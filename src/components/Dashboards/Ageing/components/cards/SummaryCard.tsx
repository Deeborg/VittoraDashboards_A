import React from 'react';

interface SummaryCardProps {
  title: string;
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  total: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, data, total }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div>
        <div className="amount" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          {total.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          })}
        </div>
        <div className="ageing-bar">
          {data.map((item, index) => (
            <div
              key={index}
              className={`ageing-bar-fill ${item.color}`}
              style={{ width: `${(item.value / total) * 100}%`, display: 'inline-block' }}
              title={`${item.label}: ${item.value.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              })}`}
            />
          ))}
        </div>
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {data.map((item, index) => (
            <div key={index} style={{ fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: item.color, marginRight: '0.5rem', borderRadius: '2px' }} />
                <span style={{ color: 'var(--gray-600)' }}>{item.label}</span>
              </div>
              <div className="amount" style={{ fontWeight: '600' }}>
                {item.value.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;