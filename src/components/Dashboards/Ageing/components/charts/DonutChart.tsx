import React from 'react';

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  title: string;
  total: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title, total }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      
      <div className="flex flex-col lg:flex-row items-center">
        {/* Simple donut visualization */}
        <div className="w-48 h-48 relative mb-6 lg:mb-0 lg:mr-6">
          <div className="w-full h-full rounded-full border-8 border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {total.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {((item.value / total) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.value.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;