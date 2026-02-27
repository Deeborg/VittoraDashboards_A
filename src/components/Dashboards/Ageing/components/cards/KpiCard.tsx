import React from 'react';

interface KpiCardProps {
  title: string;
  value: number;
  label: string;
  change?: number;
  status?: 'good' | 'warning' | 'danger' | 'info';
  format?: 'currency' | 'number' | 'percent';
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  label, 
  change, 
  status = 'info',
  format = 'currency'
}) => {
  // Status colors mapping
  const statusConfig = {
    good: {
      border: 'border-l-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: '✅'
    },
    warning: {
      border: 'border-l-yellow-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      icon: '⚠️'
    },
    danger: {
      border: 'border-l-red-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: '❌'
    },
    info: {
      border: 'border-l-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: '📊'
    }
  };

  const config = statusConfig[status];

  // Format the value
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('en-IN');
    }
  };

  return (
    <div className={`rounded-2xl p-6 border-l-4 shadow-lg ${config.border} ${config.bg} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
            {label}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatValue(value)}
            </h3>
            {change !== undefined && (
              <span className={`inline-flex items-center text-sm font-medium px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              </span>
            )}
          </div>
          <p className="mt-2 text-gray-700 font-medium">{title}</p>
        </div>
        <div className={`p-3 rounded-xl ${config.text} text-xl`}>
          {config.icon}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;