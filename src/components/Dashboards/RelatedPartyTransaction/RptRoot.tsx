import React, { useState } from 'react';

import KpiCard from './components/KpiCard';
import TransactionChart from './components/TransactionChart';
import BalanceChart from './components/BalanceChart';
import ComplianceChart from './components/ComplianceChart';
import RPTTable from './components/RPTTable';
import {
  transactions,
  balanceData,
  monthlyData,
  complianceData,
  kpiData,
  getQuarterlySummary,
  getYearlySummary,
  summaryStats,
} from './data/mockData';
import './styles/dashboard.css';
import { color } from '@amcharts/amcharts4/core';

interface TransactionData {
  period: string;
  sales: number;
  purchases: number;
  services: number;
  loans: number;
  total: number;
}

const App: React.FC = () => {
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [tableFilterType, setTableFilterType] = useState<string>('all');
  const [tableFilterStatus, setTableFilterStatus] = useState<string>('all');
  const [tableFilterParty, setTableFilterParty] = useState<string>('all');
  const [balanceZoom, setBalanceZoom] = useState<boolean>(false);

  // Get unique parties for dropdown
  const uniqueParties = Array.from(new Set(transactions.map(t => t.relatedParty)));

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(t => {
    if (tableFilterType !== 'all' && t.transactionType !== tableFilterType) return false;
    if (tableFilterStatus !== 'all' && t.approvalStatus !== tableFilterStatus) return false;
    if (tableFilterParty !== 'all' && t.relatedParty !== tableFilterParty) return false;
    return true;
  });

  // Prepare chart data based on period
  const getChartData = (): TransactionData[] => {
    const mapItem = (item: any, period: string) => ({
      period,
      sales: item.sales,
      purchases: item.purchases,
      services: item.services,
      loans: item.loans,
      total: item.total
    });

    switch (chartPeriod) {
      case 'monthly':
        return monthlyData.map(item => mapItem(item, item.month));
      case 'quarterly':
        return getQuarterlySummary().map(item => mapItem(item, item.quarter));
      case 'yearly':
        return getYearlySummary().map(item => mapItem(item, item.year));
      default:
        return monthlyData.map(item => mapItem(item, item.month));
    }
  };

  const chartData = getChartData();

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 100000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)} M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)} K`;
    return `₹${value}`;
  };

  return (
    <div className="app-layout">
     
      <div className="main-wrapper">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div className="dashboard-title">
              <h1>RPT Transaction Insights</h1>
              <p>Regulatory compliance monitoring and exposure analysis</p>
            </div>
            <div className="text-muted" style={{ fontSize: '13px', fontWeight: 500 }}>
              Updated: {new Date().toLocaleDateString('en-IN')}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            <KpiCard
              title="Total RPT Value"
              value={formatCurrency(kpiData.totalValue)}
              change="+12.5% vs last period"
              color="var(--primary)"
            />
            <KpiCard
              title="Total Transactions"
              value={kpiData.totalTransactions}
              change="+8 this month"
              color="var(--success)"
            />
            <KpiCard
              title="Pending Approvals"
              value={kpiData.pendingApprovals}
              change="Requires attention"
              color="var(--warning)"
            />
            <KpiCard
              title="Non-Compliant"
              value={kpiData.nonCompliant}
              change="High Risk"
              color="var(--danger)"
            />
          </div>

          {/* Financial Exposure Summary */}
          <div className="financial-summary">
            <div className="financial-summary-title">Financial Exposure & Risk</div>
            <div className="financial-metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Total Receivables</div>
                <div className="metric-value" style={{ color: 'var(--success)' }}>
                  {formatCurrency(kpiData.outstandingReceivables)}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Total Payables</div>
                <div className="metric-value" style={{ color: 'var(--danger)' }}>
                  {formatCurrency(kpiData.outstandingPayables)}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Net Exposure</div>
                <div className="metric-value">
                  {formatCurrency(kpiData.outstandingReceivables - kpiData.outstandingPayables)}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Avg Days Outstanding</div>
                <div className="metric-value" style={{ color: 'var(--warning)' }}>
                  {Math.round(balanceData.reduce((sum, b) => sum + b.daysOutstanding, 0) / balanceData.length)} days
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* Transaction Analysis */}
            <div className="chart-container">
              <div className="chart-title">
                <span><h1 style={{ color: 'white' }}>Transaction Trends</h1></span>
                <div className="chart-period-selector">
                  <button
                    className={`chart-period-button ${chartPeriod === 'monthly' ? 'active' : ''}`}
                    onClick={() => setChartPeriod('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`chart-period-button ${chartPeriod === 'quarterly' ? 'active' : ''}`}
                    onClick={() => setChartPeriod('quarterly')}
                  >
                    Quarterly
                  </button>
                  <button
                    className={`chart-period-button ${chartPeriod === 'yearly' ? 'active' : ''}`}
                    onClick={() => setChartPeriod('yearly')}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <TransactionChart data={chartData} period={chartPeriod} />
            </div>

            {/* Compliance Tracking */}
            <div className="chart-container">
              <div className="chart-title">
                <span><h1 style={{ color: 'white' }}>Compliance Health</h1></span>
                <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
                  Rate: {summaryStats.complianceRate}%
                </span>
              </div>
              <ComplianceChart data={complianceData} />
            </div>

            {/* Outstanding Balances */}
            <div className="chart-container" style={{ gridColumn: balanceZoom ? '1 / -1' : 'span 2' }}>
              <div className="chart-title">
                <span><h1 style={{ color: 'white' }}>Party-wise Exposure</h1></span>
                <button
                  className="chart-period-button"
                  onClick={() => setBalanceZoom(!balanceZoom)}
                  style={{ fontSize: '11px' }}
                >
                  {balanceZoom ? 'Restore View' : 'Maximize'}
                </button>
              </div>
              <BalanceChart data={balanceData} zoomMode={balanceZoom} />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="table-container">
            <div className="table-title">Recent Transactions</div>

            <div className="table-filters">
              <select
                className="filter-select"
                value={tableFilterParty}
                onChange={(e) => setTableFilterParty(e.target.value)}
              >
                <option value="all">All Parties</option>
                {uniqueParties.map(party => (
                  <option key={party} value={party}>{party}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={tableFilterType}
                onChange={(e) => setTableFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Sale">Sales</option>
                <option value="Purchase">Purchases</option>
                <option value="Service">Services</option>
                <option value="Loan">Loans</option>
              </select>

              <select
                className="filter-select"
                value={tableFilterStatus}
                onChange={(e) => setTableFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="not_approved">Not Approved</option>
              </select>
            </div>

            <RPTTable transactions={filteredTransactions} />
          </div>

          {/* Footer */}
          <div className="dashboard-footer">
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              © 2024 Corporate RPT Dashboard • Confidential • Regulatory Data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;