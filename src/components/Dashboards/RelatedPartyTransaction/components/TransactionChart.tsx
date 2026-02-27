import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TransactionData {
  period: string;
  sales: number;
  purchases: number;
  services: number;
  loans: number;
  total: number;
}

interface TransactionChartProps {
  data: TransactionData[];
  period: 'monthly' | 'quarterly' | 'yearly';
}

const TransactionChart: React.FC<TransactionChartProps> = ({ data, period }) => {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  // Colors for the corporate theme
  const colors = {
    sales: '#3b82f6',     // Blue
    purchases: '#8b5cf6', // Purple
    services: '#14b8a6',  // Teal
    loans: '#f59e0b'      // Orange/Amber
  };

  return (
    <div style={{ height: '350px', animation: 'fadeIn 0.8s ease-out both' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="period"
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const formattedValue = `₹${value.toLocaleString('en-IN')}`;
              const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
              return [formattedValue, formattedName];
            }}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px'
            }}
            cursor={{ stroke: '#cbd5e0', strokeWidth: 1 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 500 }}
            formatter={(value) => <span style={{ color: '#64748b' }}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke={colors.sales}
            strokeWidth={3}
            name="sales"
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="purchases"
            stroke={colors.purchases}
            strokeWidth={3}
            name="purchases"
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="services"
            stroke={colors.services}
            strokeWidth={3}
            name="services"
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="loans"
            stroke={colors.loans}
            strokeWidth={3}
            name="loans"
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionChart;
