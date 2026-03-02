import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BalanceData } from '../types';

interface BalanceChartProps {
  data: BalanceData[];
  zoomMode?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      fullName: string;
      relationship: string;
      daysOutstanding: number;
    };
    value: number;
    name: string;
  }>;
  label?: string;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ data, zoomMode = false }) => {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  // Truncate party names for better display
  const chartData = data.map(item => ({
    name: item.party.length > (zoomMode ? 20 : 15) ? item.party.substring(0, zoomMode ? 20 : 15) + '...' : item.party,
    receivables: item.receivables,
    payables: item.payables,
    netBalance: item.netBalance,
    fullName: item.party,
    relationship: item.relationship,
    daysOutstanding: item.daysOutstanding
  }));

  // Sort by total exposure for better visualization
  const sortedData = [...chartData].sort((a, b) =>
    (b.receivables + b.payables) - (a.receivables + a.payables)
  );

  // Colors
  const colors = {
    receivables: '#14b8a6', // Teal
    payables: '#8b5cf6'    // Purple
  };

  // Calculate max value for better bar visibility
  const maxValue = Math.max(
    ...sortedData.map(d => d.receivables),
    ...sortedData.map(d => d.payables)
  );

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          fontSize: '12px',
          maxWidth: zoomMode ? '400px' : '300px'
        }}>
          <div style={{
            color: '#0f172a',
            fontWeight: '600',
            marginBottom: '8px',
            fontSize: '13px'
          }}>
            {data.fullName}
            <div style={{
              fontSize: '11px',
              color: '#64748b',
              marginTop: '2px',
              fontWeight: 400
            }}>
              {data.relationship}
            </div>
          </div>
          {payload.map((entry, index) => (
            <div key={index} style={{
              color: entry.name === 'receivables' ? colors.receivables : colors.payables,
              fontSize: '12px',
              marginTop: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <span>{entry.name === 'receivables' ? 'Receivables' : 'Payables'}</span>
              <span style={{ fontWeight: '600' }}>
                ₹{entry.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #f1f5f9',
            fontSize: '11px',
            color: '#f59e0b',
            fontWeight: '600'
          }}>
            {data.daysOutstanding} days outstanding
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate appropriate rotation angle based on zoom mode and data length
  const getRotationAngle = () => {
    if (zoomMode) return -45;
    return sortedData.length > 8 ? -45 : 0;
  };

  const rotationAngle = getRotationAngle();
  const xAxisHeight = rotationAngle === -45 ? (zoomMode ? 100 : 80) : 40;

  return (
    <div style={{
      height: zoomMode ? '500px' : '400px',
      width: '100%',
      position: 'relative',
      animation: 'fadeIn 0.8s ease-out both'
    }}>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={sortedData}
          margin={zoomMode ? { top: 10, right: 10, left: 0, bottom: 100 } : { top: 10, right: 10, left: 0, bottom: 80 }}
          barSize={zoomMode ? 32 : Math.max(16, 240 / sortedData.length)}
          barGap={6}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            tick={{
              fill: '#64748b',
              fontSize: zoomMode ? 12 : 11,
              fontWeight: 500
            }}
            tickLine={false}
            axisLine={false}
            textAnchor="end"
            height={xAxisHeight}
            interval={0}
            angle={rotationAngle}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{
              fill: '#64748b',
              fontSize: zoomMode ? 12 : 11,
              fontWeight: 500
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
            domain={[0, maxValue * 1.1]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 500 }}
          />
          <Bar
            dataKey="receivables"
            name="Receivables"
            fill={colors.receivables}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="payables"
            name="Payables"
            fill={colors.payables}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceChart;
