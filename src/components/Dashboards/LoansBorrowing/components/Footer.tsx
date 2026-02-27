import React from 'react';
import './Footer.css';

interface FooterProps {
  lastUpdated: Date;
}

const Footer: React.FC<FooterProps> = ({ lastUpdated }) => {
  const formatLastUpdated = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <footer className="dashboard-footer">
      <div className="footer-left">
        <p>
          <i className="fas fa-info-circle"></i> Last Updated:{' '}
          <span>{formatLastUpdated(lastUpdated)}</span>
        </p>
        <p>
          <i className="fas fa-database"></i> Data Source: Treasury Management
          System v3.2
        </p>
      </div>
      <div className="footer-right">
        <button className="btn-export">
          <i className="fas fa-file-export"></i> Export Report
        </button>
        <button className="btn-print">
          <i className="fas fa-print"></i> Print
        </button>
        <div className="connection-status">
          <i className="fas fa-wifi"></i>
          <span>Live Data</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;