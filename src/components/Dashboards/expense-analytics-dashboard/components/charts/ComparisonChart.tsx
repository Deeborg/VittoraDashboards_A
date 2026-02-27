import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { EntityComparisonData } from '../../types';

interface ComparisonChartProps {
  data: EntityComparisonData[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
  // Transform data for radar chart
  const metrics = ['efficiency', 'costControl', 'budgetAdherence', 'trend'];
  const chartData = metrics.map(metric => {
    const item: any = { metric: metric.replace(/([A-Z])/g, ' $1').trim() };
    data.forEach(entity => {
      item[entity.entity] = entity[metric as keyof EntityComparisonData];
    });
    return item;
  });

  const formatValue = (value: number): string => `${value}%`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
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
            {payload[0].payload.metric}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                  }}
                />
                <Typography variant="caption">{entry.name}:</Typography>
              </Box>
              <Typography variant="caption" fontWeight={600}>
                {entry.value}%
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
        {data.map((entity, index) => (
          <Radar
            key={entity.entity}
            name={entity.entity}
            dataKey={entity.entity}
            stroke={entity.color}
            fill={entity.fill}
            fillOpacity={0.6}
          />
        ))}
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;