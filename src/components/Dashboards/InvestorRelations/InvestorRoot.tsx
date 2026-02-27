import React, { useEffect } from 'react';
import AppLogic from './app'; 
import './main.css';
import { Box, Typography } from '@mui/material';

const InvestorRoot: React.FC = () => {
  useEffect(() => {
    if (AppLogic && typeof AppLogic.init === 'function') {
      const timer = setTimeout(() => {
        AppLogic.init();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="investor-scope">
      {/* 1. INTERNAL SIDEBAR - Locked Full Height */}
      <aside className="sidebar" id="navigation-container">
        <div className="sidebar-header">AC</div>
        <nav className="sidebar-nav">
          <div className="nav-item active" data-section="business-overview" title="Overview">📊</div>
          <div className="nav-item" data-section="financial-summary" title="Financials">💰</div>
          <div className="nav-item" data-section="balance-sheet" title="Balance Sheet">📉</div>
          <div className="nav-item" data-section="operational-kpis" title="KPIs">⚙️</div>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA - Locked Full Height */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#00d4ff', letterSpacing: '1px' }}>ACME CORP</Typography>
          </div>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Investor Relations Dashboard</Typography>
          <div className="header-right">
            <button className="export-btn">Export Report</button>
          </div>
        </header>

        {/* Fixed Filter Bar */}
        <section className="filter-bar" id="filters-container">
          <div className="filter-group">
            <label className="filter-label">Year</label>
            <select id="year-filter"><option value="2024">2024</option></select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Quarter</label>
            <select id="quarter-filter"><option value="Q4">Q4</option></select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Industry</label>
            <select id="industry-filter"><option value="all">All Industries</option></select>
          </div>
          <input type="text" id="global-search" placeholder="Search clients, products..." style={{ marginLeft: 'auto', width: '280px' }} />
        </section>

        {/* This container alone handles the scrolling of charts/tables */}
        <main className="content-area" id="content-container">
            {/* Charts injected here */}
        </main>
      </div>
    </div>
  );
};

export default InvestorRoot;