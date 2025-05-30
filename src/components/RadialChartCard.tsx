import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css'; // Import default styles
import { IconBaseProps } from 'react-icons';

interface RadialChartCardProps {
  percentage: number;
  label: string;
  icon?: React.ComponentType<IconBaseProps>; // Optional icon for the center
  pathColor?: string;
  textColor?: string;
  trailColor?: string;
}

const RadialChartCard: React.FC<RadialChartCardProps> = ({
  percentage,
  label,
  icon: Icon,
  pathColor = '#6366f1', // Default primary accent
  textColor = '#ffffff',
  trailColor = '#3b3e5e'
}) => {
  return (
    <div className="radial-chart-card">
      <div className="radial-chart-container">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: pathColor,
            textColor: textColor,
            trailColor: trailColor,
            pathTransitionDuration: 0.7,
          })}
        />
        {Icon && <Icon className="radial-chart-icon-center" style={{ color: pathColor }}/>}
      </div>
      <div className="radial-chart-label">{label}</div>
    </div>
  );
};

export default RadialChartCard;