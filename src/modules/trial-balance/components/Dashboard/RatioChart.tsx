// RatioChart.tsx

import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, Tooltip, IconButton, Stack, Paper } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { TooltipProps } from 'recharts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { CalculatedRatio } from '../Financials/types';
import { RatioInfo } from './RatioDescriptions';

// Helper functions (unchanged)
const getYear = (period: string): number => {
  const match = period.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 0;
};
// --- ✅ THIS IS THE FIX ---
// This function now uses a regular expression to handle multiple abbreviations (FYE, QE, YTD, CYE).
const formatPeriodForDisplay = (period: string): string => {

  const regex = /\(([A-Z]+)\)\s*(\d{4}-\d{2}-\d{2})/;

  // We try to find a match for this pattern in the input string.
  const match = period.match(regex);

  if (match && match[1] && match[2]) {
    // We build the desired string "FYE 2023-03-31" and return it.
    return `${match[1]} ${match[2]}`;
  }

  return period;
};
const formatValueForDisplay = (value: any, decimals = 2): string => {
  const num = Number(value);
  if (isNaN(num)) return 'N/A';
  if (Math.abs(num) > 0 && Math.abs(num) < 0.01) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

// ChangeIndicator component (unchanged)
const ChangeIndicator: React.FC<{
  current: number;
  previous: number;
  interpretation: RatioInfo['interpretation'];
}> = ({ current, previous, interpretation }) => {
    if (previous === 0) {
        if (current !== 0) {
            return <Typography variant="body2" color="text.secondary">New: {formatValueForDisplay(current)}</Typography>;
        }
        return <Typography variant="body2" color="text.secondary">No Change</Typography>;
    }
    const change = current - previous;
    const percentageChange = (change / Math.abs(previous)) * 100;
    
    if (!isFinite(percentageChange)) {
        return null;
    }

    const isPositive = change > 0;
    let color: string;
    if (interpretation === 'neutral' || change === 0) {
        color = 'text.secondary';
    } else if (interpretation === 'higher-is-better') {
        color = isPositive ? 'success.main' : 'error.main';
    } else {
        color = isPositive ? 'error.main' : 'success.main';
    }
    return (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color }}>
        {isPositive ? <ArrowUpwardIcon sx={{ fontSize: '1rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />}
        <Typography variant="subtitle2" component="span" fontWeight="600">
            {`${Math.abs(percentageChange).toFixed(1)}%`}
        </Typography>
        </Stack>
    );
};




const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length && payload[0] && payload[0].value !== undefined) {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="600" color="text.primary">
          {formatValueForDisplay(payload[0].value)}
        </Typography>
      </Paper>
    );
  }
  return null;
};


// Main Chart Component
interface RatioChartProps {
  ratio: CalculatedRatio;
  periodHeaders: {
    currentPeriod: string;
    previousPeriod: string;
  };
  info: RatioInfo;
}

export const RatioChart: React.FC<RatioChartProps> = ({ ratio, periodHeaders, info }) => {
  const theme = useTheme();
  const { ratioMeasure, valueCurrent, valuePrevious } = ratio;
  const isNumeric = typeof valueCurrent === 'number' && typeof valuePrevious === 'number';

  const absoluteChange = isNumeric ? valueCurrent - valuePrevious : 0;
  let kviColor = 'text.primary';
  if (isNumeric && absoluteChange !== 0) {
      const isPositiveChange = absoluteChange > 0;
      if (info.interpretation === 'neutral') {
          kviColor = 'text.primary';
      } else if (info.interpretation === 'higher-is-better') {
          kviColor = isPositiveChange ? 'success.main' : 'error.main';
      } else {
          kviColor = isPositiveChange ? 'error.main' : 'success.main';
      }
  }

  const chartData = [
    { name: periodHeaders.previousPeriod, value: Number(valuePrevious) || 0 },
    { name: periodHeaders.currentPeriod, value: Number(valueCurrent) || 0 },
  ]
  .sort((a, b) => getYear(a.name) - getYear(b.name))
  .map(d => ({ ...d, name: formatPeriodForDisplay(d.name) }));

  const values = [Number(valueCurrent), Number(valuePrevious)];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.4 || Math.abs(max) * 0.4 || 1;

  return (
    <Card sx={{
      height: '100%',
      borderRadius: 4,
      boxShadow: '0 8px 32px -12px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px -12px rgba(0,0,0,0.15)',
      },
    }}>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="h3" fontWeight="600" color="text.primary" sx={{ flexGrow: 1 }}>
            {ratioMeasure}
          </Typography>
          <Tooltip
            title={info.description}
            placement="top"
            arrow
            componentsProps={{
              tooltip: { sx: { fontSize: '0.9rem', lineHeight: 1.6 } },
            }}
          >
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {isNumeric ? (
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, mt: 2 }}>
            <Stack justifyContent="center" alignItems="flex-start" sx={{ minWidth: '120px' }}>
              <Typography variant="h4" fontWeight="700" color={kviColor}>
                {absoluteChange > 0 ? '+' : ''}{formatValueForDisplay(absoluteChange)}
              </Typography>
              <ChangeIndicator
                current={valueCurrent}
                previous={valuePrevious}
                interpretation={info.interpretation}
              />
            </Stack>
            <Box sx={{ flexGrow: 1, minHeight: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 5 }} // Adjusted margins
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  
                  {/* --- ✅ THIS IS THE FIX --- */}
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    interval={0}
                    // Apply a smaller font size to the axis labels (ticks)
                    tick={{ fontSize: '0.75rem', fill: theme.palette.text.secondary }}
                  />

                  <YAxis domain={[min - padding, max + padding]} hide />
                  
                  <RechartsTooltip
                    content={CustomTooltip}
                    cursor={{ stroke: theme.palette.grey[300], strokeDasharray: '3 3' }}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    activeDot={{ r: 6, strokeWidth: 2, fill: theme.palette.background.paper }}
                  />
                  <LabelList
                    dataKey="value"
                    position="top"
                    offset={10}
                    formatter={formatValueForDisplay}
                    style={{ fill: theme.palette.text.primary, fontWeight: 500 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        ) : (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'text.secondary' }}>
            <Typography>Data not available</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};