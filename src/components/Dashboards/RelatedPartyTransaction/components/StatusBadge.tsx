import React from 'react';
import './../styles/dashboard.css';

interface StatusBadgeProps {
  status: 'approved' | 'pending' | 'not_approved';
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          className: 'status-badge status-approved',
          text: label || 'Approved'
        };
      case 'pending':
        return {
          className: 'status-badge status-pending',
          text: label || 'Pending'
        };
      case 'not_approved':
        return {
          className: 'status-badge status-not-approved',
          text: label || 'Not Approved'
        };
      default:
        return {
          className: 'status-badge status-pending',
          text: label || 'Pending'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={config.className}>
      {config.text}
    </span>
  );
};

export default StatusBadge;