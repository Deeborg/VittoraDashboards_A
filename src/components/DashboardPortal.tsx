import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVault } from "react-icons/fa6"
import { 
  FaChartLine, FaMoneyCheckAlt, FaBuilding, FaHourglassHalf, 
  FaUsers,FaShieldAlt,FaLandmark, 
  FaExclamationTriangle, FaBriefcase, 
  FaBalanceScale
} from "react-icons/fa";
import './DashboardPortal.css'; 
import { Typography } from '@mui/material';


const dashboardList = [
  { id: 'sales', label: 'Sales Analytics', icon: <FaChartLine />, path: '/analytics/sales', color: '#3498db' },
  { id: 'expense', label: 'Expense Analytics', icon: <FaMoneyCheckAlt />, path: '/analytics/expense', color: '#e74c3c' },
  { id: 'assets', label: 'Fixed Assets', icon: <FaBuilding />, path: '/analytics/assets', color: '#2ecc71' },
  { id: 'ageing', label: 'Ageing (AR/AP)', icon: <FaHourglassHalf />, path: '/analytics/ageing', color: '#f1c40f' },
  { id: 'rpt', label: 'Related Party (RPT)', icon: <FaUsers />, path: '/analytics/rpt', color: '#9b59b6' },
  { id: 'treasury', label: 'Treasury', icon: <FaVault />, path: '/analytics/treasury', color: '#1abc9c' },
  { id: 'risk', label: 'Compliance & Risk Management', icon: <FaShieldAlt />, path: '/analytics/risk', color: '#34495e' },
  { id: 'loans', label: 'Loans & Borrowing', icon: <FaLandmark />, path: '/analytics/loans', color: '#d35400' },
  { id: 'exceptions', label: 'Exception Reporting', icon: <FaExclamationTriangle />, path: '/analytics/exceptions', color: '#c0392b' },
  { id: 'investor', label: 'Investor Relations', icon: <FaBriefcase />, path: '/analytics/investor', color: '#7f8c8d' },
];

const DashboardPortal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="portal-wrapper">
      <div className="portal-header">
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
          Financial Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a specialized dashboard to view granular financial analytics.
        </Typography>
      </div>

      <div className="portal-container-grid">
        {dashboardList.map((item) => (
          <div 
            key={item.id} 
            className="portal-card" 
            onClick={() => navigate(item.path)}
          >
            <div className="icon-box" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
              {item.icon}
            </div>
            <div className="portal-card-content">
              <h3>{item.label}</h3>
              <p>View Details</p>
            </div>
            <div className="hover-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPortal;