import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export interface AgeingBarChartProps {
  data: {
    days30: number;
    days60: number;
    days90: number;
    days120: number;
    days180: number;
    days360: number;
    total?: number;
  };
  title: string;
  type: 'receivables' | 'payables' | 'inventory' | 'liabilities' | 'advances';
}

const AgeingBarChart: React.FC<AgeingBarChartProps> = ({ data, title, type }) => {
  // Transform data for chart
  const chartData = [
    { name: '1-30 Days', value: data.days30 },
    { name: '31-60 Days', value: data.days60 },
    { name: '61-90 Days', value: data.days90 },
    { name: '91-120 Days', value: data.days120 },
    { name: '121-180 Days', value: data.days180 },
    { name: '181-360 Days', value: data.days360 },
  ];

  // Colors for each bar
  const colors = ['#4cc9f0', '#f39c12', '#e67e22', '#e74c3c', '#c0392b', '#8b0000'];

  // Calculate total if not provided
  const total = data.total || chartData.reduce((sum, item) => sum + item.value, 0);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0.0';
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-bold text-gray-900">{label}</p>
          <p className="text-gray-700">
            <span className="font-semibold">Amount: </span>
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Percentage: </span>
            {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 card-hover">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                return `₹${value}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Amount"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total {type.charAt(0).toUpperCase() + type.slice(1)}:</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
            return (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: colors[index] }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-600">
                    {formatCurrency(item.value)} ({percentage}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgeingBarChart;