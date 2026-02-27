import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import { BudgetData } from '../../types';

interface BudgetVsActualChartProps {
  data: BudgetData[];
}

const BudgetVsActualChart: React.FC<BudgetVsActualChartProps> = ({ data }) => {
  const theme = useTheme();

  const formatCurrency = (value: number): string => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actual = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
      const budget = payload.find((p: any) => p.dataKey === 'budget')?.value || 0;
      const variance = ((actual - budget) / budget) * 100;

      return (
        <Box
          sx={{
            backgroundColor: 'white',
            p: 2,
            border: '1px solid #e2e8f0',
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2">Actual:</Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(actual)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2">Budget:</Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(budget)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2">Variance:</Typography>
            <Typography
              variant="body2"
              sx={{
                color: variance > 0 ? '#dc2626' : '#059669',
                fontWeight: 600,
              }}
            >
              {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          stroke="#64748b"
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
          tickFormatter={(value) => formatCurrency(value).replace('₹', '')}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="budget" name="Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" name="Actual" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BudgetVsActualChart;