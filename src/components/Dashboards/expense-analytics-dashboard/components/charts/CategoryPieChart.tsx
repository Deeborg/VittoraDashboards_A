import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import { CategoryData } from '../../types';

interface CategoryPieChartProps {
  data: CategoryData[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const theme = useTheme();
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number): string => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / totalValue) * 100).toFixed(1);
      
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
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(item.value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share: {percentage}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Variance: {item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;