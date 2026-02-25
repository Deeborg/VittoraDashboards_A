import React, { useState, useEffect } from 'react';
import ChartCard from '../../components/ChartCard/ChartCard';
import { dashboardService } from '../../services/api';
import { ChartData } from '../../types';
import './SalesAnalytics.scss';

const SalesAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('last30Days');
  const [salesData, setSalesData] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [channelData, setChannelData] = useState<ChartData[]>([]);
  const [regionData, setRegionData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate different data based on date range
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const baseData = months.map(month => ({
        name: month,
        sales: Math.floor(Math.random() * 500000) + 200000,
        revenue: Math.floor(Math.random() * 750000) + 300000,
        orders: Math.floor(Math.random() * 500) + 100,
        profit: Math.floor(Math.random() * 200000) + 50000,
      }));

      const channels = ['Direct', 'Partner', 'Online', 'Referral', 'Reseller'];
      const channelData = channels.map(channel => ({
        name: channel,
        value: Math.floor(Math.random() * 300000) + 100000,
        growth: Math.floor(Math.random() * 30) + 5,
      }));

      const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America'];
      const regionData = regions.map(region => ({
        name: region,
        value: Math.floor(Math.random() * 800000) + 200000,
        customers: Math.floor(Math.random() * 500) + 50,
      }));

      setSalesData(baseData.slice(0, dateRange === 'last7Days' ? 1 : dateRange === 'last30Days' ? 3 : 12).map(item => ({ ...item, value: item.sales })));
      setRevenueData(baseData.map(item => ({ ...item, value: item.revenue })));
      setChannelData(channelData);
      setRegionData(regionData.map(item => ({ ...item, value: item.value })));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="sales-analytics">
      <div className="analytics-header">
        <h2>Sales Analytics</h2>
        <div className="analytics-filters">
          <select 
            className="filter-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last7Days">Last 7 Days</option>
            <option value="last30Days">Last 30 Days</option>
            <option value="last90Days">Last 90 Days</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card large">
          <ChartCard
            title="Revenue Trend"
            type="line"
            data={revenueData}
            height={400}
          />
        </div>
        
        <div className="analytics-card">
          <ChartCard
            title="Sales by Channel"
            type="donut"
            data={channelData}
            height={300}
          />
        </div>
        
        <div className="analytics-card">
          <ChartCard
            title="Sales by Region"
            type="bar"
            data={regionData}
            height={300}
          />
        </div>
        
        <div className="analytics-card large">
          <ChartCard
            title="Sales vs Profit"
            type="composed"
            data={salesData}
            height={300}
          />
        </div>

        <div className="analytics-card">
          <ChartCard
            title="Top Products"
            type="bar"
            data={[
              { name: 'Product A', value: 450000 },
              { name: 'Product B', value: 380000 },
              { name: 'Product C', value: 320000 },
              { name: 'Product D', value: 280000 },
              { name: 'Product E', value: 240000 },
            ]}
            height={300}
          />
        </div>

        <div className="analytics-card">
          <ChartCard
            title="Customer Segments"
            type="pie"
            data={[
              { name: 'Enterprise', value: 45 },
              { name: 'Corporate', value: 30 },
              { name: 'SMB', value: 20 },
              { name: 'Startup', value: 5 },
            ]}
            height={300}
          />
        </div>
      </div>

      <div className="metrics-summary">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Revenue</span>
            <span className="metric-change positive">+12.5%</span>
          </div>
          <div className="metric-value">$2,847,500</div>
          <div className="metric-trend">
            <div className="trend-line up"></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Avg Order Value</span>
            <span className="metric-change positive">+8.2%</span>
          </div>
          <div className="metric-value">$1,248</div>
          <div className="metric-trend">
            <div className="trend-line up"></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Conversion Rate</span>
            <span className="metric-change negative">-1.3%</span>
          </div>
          <div className="metric-value">3.8%</div>
          <div className="metric-trend">
            <div className="trend-line down"></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Customer LTV</span>
            <span className="metric-change positive">+15.7%</span>
          </div>
          <div className="metric-value">$4,582</div>
          <div className="metric-trend">
            <div className="trend-line up"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;