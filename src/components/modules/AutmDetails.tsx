import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as FiIcons from 'react-icons/fi';

// 1. Updated Interface to support sub-routing
interface ColumnData {
  number: string;
  title: string;
  buttons: { label: string; path: string }[];
  circleColor: string;
  bgColor: string;
  icon: React.ReactElement;
}

const infographicData: ColumnData[] = [
  {
    number: '01',
    title: 'Working Capital Optimization',
    buttons: [{ label: 'Working Capital Dashboard', path: '/dashboard' }],
    circleColor: '#C0392B',
    bgColor: '#E74C3C',
    icon: <FiIcons.FiBriefcase size={30} />,
  },
  {
    number: '02',
    title: 'Forex and Risk',
    buttons: [{ label: 'Forex Dashboard', path: '/forex' }],
    circleColor: 'rgb(245, 154, 8)',
    bgColor: '#F39C12',
    icon: <FiIcons.FiShield size={30} />,
  },
  {
    number: '03',
    title: 'Capital Strategy Intelligence',
    buttons: [
      { label: 'Treasury Operations', path: '/analytics/treasury' },
      { label: 'Loans & Borrowing', path: '/analytics/loans' }
    ],
    circleColor: '#27AE60',
    bgColor: '#2ECC71',
    icon: <FiIcons.FiPieChart size={30} />,
  },
];

const AuTmDetails: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  const styles: any = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center',justifyContent:'center', backgroundColor: 'transparent', padding: '20px',paddingTop: '1px', minHeight: '90vh',width: '100%'},
    columnsContainer: { display: 'flex', justifyContent: 'center', alignItems: 'stretch',gap: '30px', maxWidth: '1000px', width: '100%',flexWrap: 'wrap' },
    column: {
      position: 'relative',flex: '0 0 280px', padding: '40px 25px', borderRadius: '24px',
      color: 'white', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease', cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'center',margin: '10px'
    },
    mainTitle: {
color: '#2c3e50',
marginBottom: '40px',
textAlign: 'center',
letterSpacing: '0.5px',
},
    button: {
      display: 'block', width: '100%', marginBottom: '10px', padding: '12px',
      background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 600,
      transition: '0.3s', fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      <p style={styles.mainTitle}>
The Treasury Management Module provides real-time visibility into cash, liquidity, and risk exposure while enabling accurate cash flow forecasting and optimal fund allocation. It streamlines FX management, debt planning, and investment tracking, helping reduce financial risk and improve returns.
</p>
      <div style={styles.columnsContainer}>
        {infographicData.map((col, index) => (
          <div key={index} style={{
            ...styles.column, backgroundColor: col.bgColor,
            transform: hoveredColumn === index ? 'translateY(-10px)' : 'none'
          }}
          onMouseEnter={() => setHoveredColumn(index)}
          onMouseLeave={() => setHoveredColumn(null)}
          >
            {/* Circle Number */}
            <div style={{ 
        width: '60px', height: '60px', borderRadius: '50%', 
        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px', border: '1px solid rgba(255,255,255,0.3)'
      }}>
        {col.icon}
      </div>
      
      <h2 style={{ fontSize: '18px', marginBottom: '25px', fontWeight: 600, letterSpacing: '0.5px' }}>
        {col.title}
      </h2>

      {/* Buttons Container */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {col.buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => navigate(btn.path)}
            style={{
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#334155'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  ))}
</div>
    </div>
  );
};

export default AuTmDetails;