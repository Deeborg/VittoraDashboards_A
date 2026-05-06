import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as FiIcons from 'react-icons/fi';

interface SubItem {
  label: string;
  path?: string;
}

interface ColumnData {
  number: string;
  title: string;
  items: SubItem[];
  circleColor: string;
  bgColor: string;
  icon: React.ReactElement;
}

const infographicData: ColumnData[] = [
  {
    number: '01', title: 'Customer Intelligence', circleColor: '#C0392B', bgColor: '#E74C3C',
    icon: <FiIcons.FiUsers size={30} />,
    items: [{ label: 'Customer Profiling',path: '/analytics/customer-intelligence' },]
  },
  {
    number: '02', title: 'Pricing Optimization', circleColor: 'rgb(245, 154, 8)', bgColor: '#F39C12',
    icon: <FiIcons.FiTag size={30} />,
    items: [{ label: 'Pricing Optimization' ,path : '/analytics/pricing-optimization' }]
  },
  {
    number: '03', title: 'Discount Strategy', circleColor: '#27AE60', bgColor: '#2ECC71',
    icon: <FiIcons.FiPercent size={30} />,
    items: [{ label: 'Discount Strategy',path: '/analytics/discount-strategy' }]
  },
  {
    number: '04', title: 'Promotion Analytics', circleColor: '#2980B9', bgColor: '#3498DB',
    icon: <FiIcons.FiPieChart size={30} />,
    items: [{ label: 'Promotion Analytics',path: '/analytics/promotion-analytics' }]
  },
  {
    number: '05', title: 'Commercial Governance', circleColor: '#8E44AD', bgColor: '#9B59B6',
    icon: <FiIcons.FiShield size={30} />,
    items: [
      { label: 'Related Party Transactions', path: '/analytics/rpt' },
      { label: 'Compliance & Risk', path: '/analytics/risk' }
    ]
  }
];

const CommercialDetails: React.FC = () => {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  const styles: any = {
    container: { 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', 
      padding: '60px 20px', minHeight: '100vh' 
    },
    mainTitle: { color: '#1e293b', fontSize: '16px', marginBottom: '50px', textAlign: 'center', maxWidth: '700px', lineHeight: 1.6 },
    columnsContainer: { 
      display: 'flex', justifyContent: 'center', alignItems: 'stretch', // Forces cards to equal height
      gap: '20px', width: '100%', maxWidth: '1200px', flexWrap: 'wrap' 
    },
    column: { 
      position: 'relative', flex: '1', minWidth: '200px', maxWidth: '220px', 
      padding: '60px 20px 30px', borderRadius: '24px', color: 'white', 
      textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', 
      display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' 
    },
    circle: { 
      position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', 
      width: '60px', height: '60px', borderRadius: '50%', background: 'white', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      fontSize: '20px', fontWeight: 800, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
    },
    buttonContainer: {
       // Pushes buttons to the bottom of the card
      display: 'flex', flexDirection: 'column', gap: '10px', width: '100%'
    },
    button: { 
      width: '100%', padding: '10px', background: 'rgba(255,255,255,0.15)', 
      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', 
      color: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '13px', 
      transition: 'all 0.2s' 
    },
    columnTitle: {
    fontSize: '16px',
    marginBottom: '20px', // Space between title and line
    marginTop: '10px',
    height: '40px',       // Force equal height for all titles
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1.2'
  },
  divider: {
    width: '50px',
    height: '2px',
    background: 'rgba(255,255,255,0.5)',
    margin: '0 auto 25px auto', // Add bottom margin here to create distance
  }
  };

    return (
    <div style={styles.container}>
      <p style={styles.mainTitle}>Analyze market dynamics to optimize pricing and profitability through advanced commercial analytics.</p>
      
      <div style={styles.columnsContainer}>
        {infographicData.map((col, index) => (
          <div key={index} style={{ 
            ...styles.column, 
            backgroundColor: col.bgColor, 
            transform: hoveredColumn === index ? 'translateY(-10px)' : 'none',
            boxShadow: hoveredColumn === index ? '0 20px 30px rgba(0,0,0,0.15)' : '0 10px 20px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={() => setHoveredColumn(index)} 
          onMouseLeave={() => setHoveredColumn(null)}>
  
            <div style={{ ...styles.circle, color: col.bgColor }}>{col.number}</div>
            <div style={{ marginBottom: '15px' }}>{col.icon}</div>
            
            <h2 style={styles.columnTitle}>{col.title}</h2>
            <div style={styles.divider} />
            
            <div style={styles.buttonContainer}>
              {col.items.map((item, i) => (
                <button key={i} style={styles.button} 
                  onClick={() => item.path ? navigate(item.path) : setShowMessage(true)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = col.bgColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    
      {showMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowMessage(false)}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
            <p>Not available in demo environment.</p>
            <button onClick={() => setShowMessage(false)} style={{ padding: '8px 20px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialDetails;