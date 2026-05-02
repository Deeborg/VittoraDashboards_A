import React, { useEffect } from 'react';
import AppLogic from './app';
import './main.css';
import { useNavigate } from 'react-router-dom';

const InvestorRoot: React.FC = () => {
  const navigate = useNavigate();

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

      {/* =========================
           INTERNAL SIDEBAR
      ========================= */}
      <aside className="sidebar" id="navigation-container">

        {/* BACK BUTTON */}
        <div className="investor-back-header">
          <button
            className="investor-back-btn"
            onClick={() =>
              navigate('/modules', {
                state: { scrollToModule: 'finance' },
              })
            }
            title="Back to Finance Planning & Analysis"
          >
            ←
          </button>
        </div>

        {/* HEADER */}
        <div className="sidebar-header">AC</div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          <div
            className="nav-item active"
            data-section="business-overview"
            title="Business Overview"
          >
            📊
          </div>

          <div
            className="nav-item"
            data-section="financial-summary"
            title="Financial Summary"
          >
            💰
          </div>

          <div
            className="nav-item"
            data-section="balance-sheet"
            title="Balance Sheet"
          >
            📈
          </div>

          <div
            className="nav-item"
            data-section="operational-kpis"
            title="Operational KPIs"
          >
            ⚙️
          </div>
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          Q4
          <br />
          2024
        </div>
      </aside>

      {/* =========================
           MAIN CONTENT
      ========================= */}
      <div className="main-content">

        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <span className="home-icon">🏠</span>
            <span className="company-name">ACME CORP</span>
          </div>

          <div className="header-center">
            <h1 className="dashboard-title">
              Investor Relations Dashboard
            </h1>
          </div>

          <div className="header-right">
            <span className="quarter-badge" id="header-period">
              Q4 2024
            </span>

            <button className="export-btn">
              Export Report
            </button>
          </div>
        </header>

        {/* FILTER BAR */}
        <section
          className="filter-bar"
          id="filters-container"
        >
          <div className="filter-group">
            <label className="filter-label">Year</label>
            <select
              id="year-filter"
              className="filter-select"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Quarter</label>
            <select
              id="quarter-filter"
              className="filter-select"
            >
              <option value="Q4">Q4</option>
              <option value="Q3">Q3</option>
            </select>
          </div>

          <div className="filter-separator"></div>

          <div className="filter-group">
            <label className="filter-label">Industry</label>
            <select
              id="industry-filter"
              className="filter-select"
            >
              <option value="all">
                All Industries
              </option>
              <option value="Automotive">
                Automotive
              </option>
            </select>
          </div>

          <input
            type="text"
            id="global-search"
            className="search-input"
            placeholder="Search clients, products..."
          />
        </section>

        {/* CONTENT AREA */}
        <main
          className="content-area"
          id="content-container"
        >
          {/* Section content injected here by app.ts */}
        </main>
      </div>
    </div>
  );
};

export default InvestorRoot;