import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { theme } from '../../styles/theme_cr';

interface BarChartProps {
  data: any[];
  xAxisKey: string;
  series: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  height?: number;
  stacked?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  xAxisKey,
  series,
  height = 300,
  stacked = false,
}) => {
  // Filter out empty data
  const validData = data.filter(item => 
    item && 
    item[xAxisKey] && 
    series.some(s => typeof item[s.key] === 'number')
  );
  
  if (validData.length === 0) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        color: theme.colors.text.primary,
   
        fontSize: theme.typography.fontSize.sm,
        
        background: theme.colors.background.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={theme.colors.gray[400]} strokeWidth="1.5">
          <rect x="3" y="10" width="4" height="11" rx="1" />
          <rect x="10" y="6" width="4" height="15" rx="1" />
          <rect x="17" y="2" width="4" height="19" rx="1" />
        </svg>
        <p style={{ marginTop: theme.spacing.md }}>No data available</p>
      </div>
    );
  }

  // Determine if labels need rotation
  const shouldRotateLabels = validData.length > 6;
  const maxLabelLength = Math.max(...validData.map(item => 
    String(item[xAxisKey] || '').length
  ));
  
  const bottomMargin = shouldRotateLabels ? 
    Math.min(80, 40 + maxLabelLength * 2) : 30;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart 
        data={validData} 
        margin={{ 
          top: 20, 
          right: 30, 
          left: 20, 
          bottom: bottomMargin
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={theme.colors.gray[200]} 
          vertical={false}
        />
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
          interval={shouldRotateLabels ? 0 : 'preserveStartEnd'}
          height={shouldRotateLabels ? 70 : 30}
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
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color || theme.colors.primary[500]}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;