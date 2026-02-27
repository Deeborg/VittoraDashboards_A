import React from 'react';

interface AgeingBarChartProps {
  data: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120: number;
    daysOver120: number;
  };
  title: string;
  type: 'receivables' | 'payables';
}

const AgeingBarChart: React.FC<AgeingBarChartProps> = ({ data, title, type }) => {
  const chartData = [
    { name: 'Current', value: data.current, color: '#22c55e' },
    { name: '1-30 Days', value: data.days30, color: '#fbbf24' },
    { name: '31-60 Days', value: data.days60, color: '#f59e0b' },
    { name: '61-90 Days', value: data.days90, color: '#ef4444' },
    { name: '91-120 Days', value: data.days120, color: '#dc2626' },
    { name: '120+ Days', value: data.daysOver120, color: '#991b1b' },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.name}</span>
              <div className="text-right">
                <span className="font-bold">
                  {item.value.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
                <span className="ml-2 text-gray-500">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(item.value / total) * 100}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total {type === 'receivables' ? 'Receivables' : 'Payables'}</span>
          <span className="text-xl font-bold">
            {total.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AgeingBarChart;