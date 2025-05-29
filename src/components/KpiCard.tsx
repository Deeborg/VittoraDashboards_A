import React from 'react';
import { IconType } from 'react-icons';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  sparklineData?: { name: string; value: number }[];
  trend?: 'up' | 'down' | 'neutral'; // For coloring sparkline
  iconBgColor?: string; // Optional custom icon background
  iconColor?: string;   // Optional custom icon color
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  sparklineData,
  trend = 'neutral',
  iconBgColor = 'rgba(99, 102, 241, 0.15)', // Default accent
  iconColor = '#6366f1' // Default accent
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return '#34d399'; // Greenish
    if (trend === 'down') return '#f87171'; // Reddish
    return '#60a5fa'; // Neutral blue
  };

  return (
    <div className="kpi-card">
      <div> {/* Top content wrapper */}
        <div className="kpi-card-header">
          <span className="kpi-card-title">{title}</span>
          <div className="kpi-card-icon" style={{ backgroundColor: iconBgColor }}>
            <Icon style={{ color: iconColor }} />
          </div>
        </div>
        <div className="kpi-card-value">{value}</div>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="kpi-card-sparkline">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2f3349',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem'
                }}
                itemStyle={{ color: '#e0e0e0' }}
                labelStyle={{ display: 'none' }} // Hide default label if not needed
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={getTrendColor()}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default KpiCard;