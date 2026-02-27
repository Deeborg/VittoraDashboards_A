import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { theme } from '../../styles/theme';

interface LineChartProps {
  data: any[];
  xAxisKey: string;
  series: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxisKey,
  series,
  height = 300,
}) => {
  // Filter out empty data
  const filteredData = data.filter(item => item[xAxisKey]);
  
  if (filteredData.length === 0) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: theme.colors.gray[500],
        fontSize: theme.typography.fontSize.sm
      }}>
        No data available
      </div>
    );
  }

  // Determine if labels need rotation
  const shouldRotateLabels = filteredData.length > 8;
  const maxLabelLength = Math.max(...filteredData.map(item => 
    String(item[xAxisKey]).length
  ));
  
  // Calculate dynamic bottom margin
  const bottomMargin = shouldRotateLabels ? 
    Math.min(80, 40 + maxLabelLength * 2) : 30;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart 
        data={filteredData} 
        margin={{ 
          top: 20, 
          right: 30, 
          left: 20, 
          bottom: bottomMargin
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.gray[200]} />
        <XAxis
          dataKey={xAxisKey}
          tick={{
            fill: theme.colors.gray[600],
            fontSize: shouldRotateLabels ? 10 : 11,
          }}
          angle={shouldRotateLabels ? -35 : 0}
          textAnchor={shouldRotateLabels ? 'end' : 'middle'}
          tickLine={{ stroke: theme.colors.gray[300] }}
          axisLine={{ stroke: theme.colors.gray[300] }}
          interval={shouldRotateLabels ? 1 : 0}
          height={shouldRotateLabels ? 70 : 30}
          dx={shouldRotateLabels ? -5 : 0}
        />
        <YAxis
          tick={{ fill: theme.colors.gray[600], fontSize: 11 }}
          tickLine={{ stroke: theme.colors.gray[300] }}
          axisLine={{ stroke: theme.colors.gray[300] }}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: `1px solid ${theme.colors.gray[200]}`,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.md,
            padding: theme.spacing.sm,
          }}
        />
        <Legend 
          wrapperStyle={{ 
            fontSize: 12,
            paddingTop: theme.spacing.md 
          }} 
        />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color || theme.colors.primary[500]}
            strokeWidth={2}
            dot={{ r: 4, fill: s.color || theme.colors.primary[500] }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;