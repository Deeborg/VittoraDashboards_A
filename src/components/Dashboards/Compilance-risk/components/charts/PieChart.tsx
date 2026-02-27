import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { theme } from '../../styles/theme';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  colors = [
    theme.colors.primary[500],
    theme.colors.secondary[500],
    theme.colors.success[500],
    theme.colors.warning[500],
    theme.colors.error[500],
    theme.colors.purple[500],
    theme.colors.info[500],
  ],
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: theme.colors.gray[400] }}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: `1px solid ${theme.colors.gray[200]}`,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.md,
            padding: theme.spacing.sm,
          }}
          formatter={(value: number) => [value, 'Count']}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;