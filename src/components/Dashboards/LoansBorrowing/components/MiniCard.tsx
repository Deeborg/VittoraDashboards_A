import React from 'react';
import { MiniCardProps } from './types'; // Changed from '../types' to './types'
import './MiniCard.css';

const MiniCard: React.FC<MiniCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="mini-card" style={{ borderTopColor: color || '#4d4dff' }}>
      <div className="mini-card-header">
        <span className="mini-card-icon" style={{ color: color || '#4d4dff' }}>{icon}</span>
        <span className="mini-card-title">{title}</span>
      </div>
      <div className="mini-card-value">{value}</div>
    </div>
  );
};

export default MiniCard;