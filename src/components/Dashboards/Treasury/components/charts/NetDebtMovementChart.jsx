import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { netDebtMovement } from '../../data/financialData';

const NetDebtMovementChart = () => {
  const chartData = netDebtMovement.map(item => ({
    month: item.month,
    amount: item.closingBalance() / 10000000, // Convert to Cr for chart
    rawAmount: item.closingBalance(),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis 
          tickFormatter={(value) => `${value} Cr`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [formatCurrency(value * 10000000), 'Net Debt']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#1a237e"
          strokeWidth={2}
          dot={{ stroke: '#1a237e', strokeWidth: 2, r: 3 }}
          activeDot={{ r: 6 }}
          name="Net Debt"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default NetDebtMovementChart;