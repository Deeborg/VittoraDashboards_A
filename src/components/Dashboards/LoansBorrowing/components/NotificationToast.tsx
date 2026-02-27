import React from 'react';
import './NotificationToast.css';

interface NotificationToastProps {
  show: boolean;
  message: string;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ show, message }) => {
  return (
    <div className={`notification-toast ${show ? 'show' : ''}`}>
      <div className="toast-content">
        <i className="fas fa-sync-alt spin"></i>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default NotificationToast;