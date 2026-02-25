import React, { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard/StatCard';
import ChartCard from '../../components/ChartCard/ChartCard';
import { dashboardService } from '../../services/api';
import { DashboardSummary, ChartData } from '../../types';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesByChannel, setSalesByChannel] = useState<ChartData[]>([]);
  const [salesTrend, setSalesTrend] = useState<ChartData[]>([]);
  const [topCustomers, setTopCustomers] = useState<ChartData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        summaryData,
        channelData,
        trendData,
        customerData,
        productData,
      ] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getSalesByChannel(),
        dashboardService.getSalesTrend('last30Days'),
        dashboardService.getTopCustomers(5),
        dashboardService.getProductPerformance(),
      ]);

      setSummary(summaryData);
      setSalesByChannel(channelData);
      setSalesTrend(trendData);
      setTopCustomers(customerData);
      setProductPerformance(productData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">!</div>
          <h3 className="error-title">Failed to load dashboard data</h3>
          <p className="error-message">Please check your connection and try again</p>
          <button className="error-retry-btn" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your business today.</p>
        </div>
        {/* <div className="header-actions">
          <button className="action-btn refresh-btn" onClick={fetchDashboardData}>
            <span className="btn-icon">↻</span>
            Refresh Data
          </button>
          <button className="action-btn export-btn">
            <span className="btn-icon">↓</span>
            Export Report
          </button>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card-wrapper">
          <StatCard
            title="Total Sales"
            value={summary.totalSales}
            change={summary.revenueGrowth}
            color="#3b82f6"
            format="currency"
            titlePosition="top"
          />
        </div>
        <div className="stat-card-wrapper">
          <StatCard
            title="Total Orders"
            value={summary.totalOrders}
            change={8.2}
            color="#10b981"
            titlePosition="top"
          />
        </div>
        <div className="stat-card-wrapper">
          <StatCard
            title="Active Customers"
            value={summary.totalCustomers}
            change={5.7}
            color="#8b5cf6"
            titlePosition="top"
          />
        </div>
        <div className="stat-card-wrapper">
          <StatCard
            title="Pending Orders"
            value={summary.pendingOrders}
            change={-2.4}
            color="#f59e0b"
            titlePosition="top"
          />
        </div>
        <div className="stat-card-wrapper">
          <StatCard
            title="Avg Order Value"
            value={summary.avgOrderValue}
            change={12.1}
            color="#06b6d4"
            format="currency"
            titlePosition="top"
          />
        </div>
        <div className="stat-card-wrapper">
          <StatCard
            title="Conversion Rate"
            value={summary.conversionRate}
            change={3.2}
            color="#ec4899"
            format="percent"
            titlePosition="top"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card-wrapper full-width">
          <ChartCard
            title="Sales Trend (Last 12 Months)"
            type="area"
            data={salesTrend}
            height={350}
          />
        </div>
        
        <div className="chart-card-wrapper half-width">
          <ChartCard
            title="Sales by Channel"
            type="donut"
            data={salesByChannel}
            height={350}
          />
        </div>
        
        <div className="chart-card-wrapper half-width">
          <ChartCard
            title="Top 5 Customers by Sales"
            type="bar"
            data={topCustomers}
            height={350}
          />
        </div>
        {/* <div className="chart-card-wrapper">
          <ChartCard
            title="Product Performance"
            type="composed"
            data={productPerformance}
            height={300}
          />
        </div> */}
      </div>

      {/* Recent Activity */}
      {/* <div className="recent-activity">
        <div className="activity-header">
          <h3>Recent Orders</h3>
          <a href="/orders" className="view-all">View All →</a>
        </div>
        <div className="activity-list">
          {[
            { id: 'ORD-001', customer: 'Global Motors', amount: '$25,000', status: 'Completed' },
            { id: 'ORD-002', customer: 'TechNova Solutions', amount: '$18,500', status: 'Processing' },
            { id: 'ORD-003', customer: 'MediCare Group', amount: '$42,000', status: 'Pending' },
            { id: 'ORD-004', customer: 'Green Energy Corp', amount: '$12,300', status: 'Completed' },
            { id: 'ORD-005', customer: 'Urban Builders', amount: '$31,500', status: 'Shipped' },
          ].map((order) => (
            <div key={order.id} className="activity-item">
              <div className="activity-icon">📦</div>
              <div className="activity-content">
                <div className="activity-title">
                  <span className="order-id">{order.id}</span>
                  <span className="order-customer">{order.customer}</span>
                </div>
                <div className="activity-details">
                  <span className="order-amount">{order.amount}</span>
                  <span className={`order-status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="activity-time">2h ago</div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;