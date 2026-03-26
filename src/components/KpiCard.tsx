import React from 'react';
import { IconBaseProps } from 'react-icons';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<IconBaseProps>;
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
    <div 
      className="kpi-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        height: '100%', 
        minHeight: '160px',
        overflow: 'hidden' /* Keeps the chart inside the rounded corners safely */
      }}
    >
      {/* Top Content: Title, Icon, Value */}
      <div style={{ padding: '20px 20px 5px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <span style={{ 
            fontSize: '0.85rem', 
            color: '#cbd5e1', 
            fontWeight: 600, 
            lineHeight: '1.4',
            maxWidth: '70%' /* Prevents text from smashing into the icon */
          }}>
            {title}
          </span>
          <div style={{ 
            backgroundColor: iconBgColor, 
            padding: '8px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0, /* CRITICAL: Prevents icon from squishing */
            width: '36px',
            height: '36px'
          }}>
            {Icon && <Icon color={iconColor} size={18} />}
          </div>
        </div>
        <div style={{ 
          fontSize: '1.8rem', 
          fontWeight: '700', 
          color: '#ffffff',
          textAlign: 'left' 
        }}>
          {value}
        </div>
      </div>

      {/* Bottom Content: Sparkline Chart */}
      {sparklineData && sparklineData.length > 0 && (
        <div style={{ 
          width: '100%', 
          height: '50px', /* CRITICAL: Exact height for Recharts */
          marginTop: 'auto' /* Pushes chart to the absolute bottom */
        }}>
          <ResponsiveContainer width="100%" height="100%">
            {/* margin handles the padding of the line inside the container */}
            <LineChart data={sparklineData} margin={{ top: 5, right: 15, left: 15, bottom: 15 }}>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#f8fafc'
                }}
                itemStyle={{ color: '#e2e8f0' }}
                labelStyle={{ display: 'none' }}
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