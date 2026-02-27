import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComplianceData } from '../types';

interface ComplianceChartProps {
  data: ComplianceData[];
}

// Define proper types for the tooltip
type TooltipItem = {
  name: 'Compliant' | 'Non-Compliant' | 'Pending';
  value: number;
  color: string;
};

const ComplianceChart: React.FC<ComplianceChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    ...item,
    compliant: item.compliant,
    nonCompliant: -item.nonCompliant, // Negative for left side
    pending: item.pending
  }));

  // Colors for the corporate theme
  const colors = {
    compliant: '#10b981',    // Success Green
    nonCompliant: '#ef4444', // Danger Red
    pending: '#f59e0b'       // Warning Amber
  };

  return (
    <div style={{ height: '350px', animation: 'fadeIn 0.8s ease-out both' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          barSize={20}
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => Math.abs(value).toString()}
          />
          <YAxis
            type="category"
            dataKey="category"
            stroke="#94a3b8"
            tick={{
              fill: '#0f172a',
              fontSize: 12,
              fontWeight: 600
            }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const absValue = Math.abs(value);
              const formattedName = name === 'compliant' ? 'Compliant' :
                name === 'nonCompliant' ? 'Non-Compliant' : 'Pending';
              return [`${absValue} transactions`, formattedName];
            }}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px'
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 500 }}
            formatter={(value) => {
              const formattedName = value === 'compliant' ? 'Compliant' :
                value === 'nonCompliant' ? 'Non-Compliant' : 'Pending';
              return <span style={{ color: '#64748b' }}>{formattedName}</span>;
            }}
          />
          <Bar
            dataKey="compliant"
            name="compliant"
            fill={colors.compliant}
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="nonCompliant"
            name="nonCompliant"
            fill={colors.nonCompliant}
            radius={[4, 0, 0, 4]}
          />
          <Bar
            dataKey="pending"
            name="pending"
            fill={colors.pending}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplianceChart;