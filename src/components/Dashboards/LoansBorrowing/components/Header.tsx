import React from 'react';
import './Header.css';

interface HeaderProps {
  title: string;
  subtitle: string;
  onSettingsClick: () => void;
  onRefreshClick: () => void;
  lastUpdated: Date;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onSettingsClick,
  onRefreshClick,
  lastUpdated,
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      <div className="header-right">
        <div className="date-picker">
          <i className="fas fa-calendar-day"></i>
          <span>{formatDate(lastUpdated)}</span>
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="header-actions">
          <button className="btn-notification">
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
          <button className="btn-settings" onClick={onSettingsClick}>
            <i className="fas fa-cog"></i>
          </button>
          <button className="btn-refresh" onClick={onRefreshClick}>
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;