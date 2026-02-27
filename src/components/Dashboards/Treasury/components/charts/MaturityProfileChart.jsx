import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { maturityProfile } from '../../data/financialData';

const MaturityProfileChart = () => {
  const chartData = Object.entries(maturityProfile).map(([bucket, amount]) => ({
    bucket,
    amount: amount / 10000000, // Convert to Cr
    rawAmount: amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="bucket" 
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={(value) => `${value} Cr`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [formatCurrency(value * 10000000), 'Amount Due']}
          labelFormatter={(label) => `Maturity: ${label}`}
        />
        <Bar
          dataKey="amount"
          fill="#1a237e"
          name="Amount Due"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MaturityProfileChart;