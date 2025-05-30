import React from 'react';
import KpiCard from './KpiCard';
import RadialChartCard from './RadialChartCard';
import '../Style/DashboardPage.css'; // Import the CSS

// Import some icons from react-icons
import {
  FiTrendingUp,
  FiDollarSign,
  FiHome,
  FiClipboard,
  FiFileText,
  FiAlertOctagon,
  FiArchive,
  FiLayers, // For the radial chart center
} from 'react-icons/fi'; // Example icons, choose what fits

import { IconBaseProps } from "react-icons";

const DashboardPage: React.FC = () => {
  // Sample data for sparklines (replace with your actual data)
  const salesSparkline = [
    { name: 'Jan', value: 10 }, { name: 'Feb', value: 12 }, { name: 'Mar', value: 9 },
    { name: 'Apr', value: 15 }, { name: 'May', value: 13 }, { name: 'Jun', value: 17 },
  ];
  const revenueSparkline = [
    { name: 'Jan', value: 300000 }, { name: 'Feb', value: 360000 }, { name: 'Mar', value: 320000 },
    { name: 'Apr', value: 400000 }, { name: 'May', value: 380000 }, { name: 'Jun', value: 450000 },
  ];
  const defaultSparkline = [
    { name: 'M1', value: 5 }, { name: 'M2', value: 6 }, { name: 'M3', value: 5 },
    { name: 'M4', value: 7 }, { name: 'M5', value: 6 }, { name: 'M6', value: 8 },
  ];


  return (
    <div className="dashboard-page">
      <h1 className="dashboard-header">Performance Overview</h1>
      <div className="dashboard-grid">
        {/* KPI Cards - Column 1 */}
        <KpiCard
          title="# Sales"
          value="12"
          icon={FiTrendingUp as React.ComponentType<IconBaseProps>}
          sparklineData={salesSparkline}
          trend="up"
        />
        <KpiCard
          title="Commission Paid ($)"
          value="491,121"
          icon={FiDollarSign as React.ComponentType<IconBaseProps>}
          sparklineData={revenueSparkline.map(d => ({...d, value: d.value / 10000}))} // Scale down for display
          trend="up"
          iconBgColor="rgba(52, 211, 153, 0.15)" // Greenish icon bg
          iconColor="#34d399"
        />

        {/* KPI Cards - Column 2 (or part of general flow) */}
        <KpiCard
          title="$ Sales"
          value="3,607,894"
          icon={FiDollarSign as React.ComponentType<IconBaseProps>}
          sparklineData={revenueSparkline}
          trend="up"
          iconBgColor="rgba(52, 211, 153, 0.15)"
          iconColor="#34d399"
        />
        <KpiCard
          title="Average Days on Market"
          value="46"
          icon={FiHome as React.ComponentType<IconBaseProps>}
          sparklineData={defaultSparkline.slice().reverse()} // Example of different trend
          trend="down" // Assuming lower is better
          iconBgColor="rgba(251, 146, 60, 0.15)" // Orange icon bg
          iconColor="#fb923c"
        />

        {/* Radial Chart - This can be placed to span more if needed via CSS */}
        <div className="radial-chart-card-wrapper radial-chart-card-wrapper-prominent">
          <RadialChartCard
            percentage={24}
            label="Sold Homes Per Available Inventory Ratio"
            icon={FiLayers as React.ComponentType<IconBaseProps>} // Example central icon
            pathColor="#38bdf8" // A nice sky blue
          />
        </div>


        {/* KPI Cards - Column 3 */}
        <KpiCard
          title="# Properties Listed"
          value="60"
          icon={FiClipboard as React.ComponentType<IconBaseProps>}
          sparklineData={defaultSparkline}
          trend="neutral"
        />
         <KpiCard
          title="# New Listings"
          value="18"
          icon={FiFileText as React.ComponentType<IconBaseProps>}
          sparklineData={defaultSparkline}
          trend="up"
        />
        <KpiCard
          title="# Expired"
          value="2"
          icon={FiAlertOctagon as React.ComponentType<IconBaseProps>}
          sparklineData={salesSparkline.slice(0,3)} // Shorter data
          trend="down" // Assuming lower is better
          iconBgColor="rgba(248, 113, 113, 0.15)" // Reddish icon bg
          iconColor="#f87171"
        />
        <KpiCard
          title="# Lost"
          value="2"
          icon={FiArchive as React.ComponentType<IconBaseProps>}
          sparklineData={defaultSparkline.slice(0,4)}
          trend="down"
          iconBgColor="rgba(248, 113, 113, 0.15)"
          iconColor="#f87171"
        />
      </div>
    </div>
  );
};

export default DashboardPage;