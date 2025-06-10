import React, { useState } from 'react';

// --- SVG Icons (as functional components for reusability and cleanliness) ---
const UserGroupIcon: React.FC<{ fill?: string; size?: string | number }> = ({ fill = 'currentColor', size = '24px' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 13C16 14.6569 14.6569 16 13 16C11.3431 16 10 14.6569 10 13C10 11.3431 11.3431 10 13 10C14.6569 10 16 11.3431 16 13Z" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 16V21" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 10H4C3.44772 10 3 10.4477 3 11V13C3 13.5523 3.44772 14 4 14H10" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 10H20C20.5523 10 21 10.4477 21 11V13C21 13.5523 20.5523 14 20 14H18" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10V7C7 5.34315 8.34315 4 10 4H13C14.6569 4 16 5.34315 16 7V10" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PriceTagIcon: React.FC<{ fill?: string; size?: string | number }> = ({ fill = 'currentColor', size = '24px' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.586 11.001L12.999 3.414C12.609 3.024 12.076 2.811 11.517 2.827L4.528 3.009C3.402 3.032 2.711 4.208 3.292 5.076L8.999 14.586C9.389 15.176 10.022 15.589 10.781 15.605L17.77 15.787C18.896 15.81 20.087 14.634 19.506 13.766L20.586 11.001Z" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8" cy="8" r="1" fill={fill}/>
    <path d="M15 9L17 7" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 6L18 8" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DiscountIcon: React.FC<{ fill?: string; size?: string | number }> = ({ fill = 'currentColor', size = '24px' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 8L19 12L15 16" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 8L5 12L9 16" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="7" r="1.5" stroke={fill} strokeWidth="1.5"/>
    <circle cx="17" cy="17" r="1.5" stroke={fill} strokeWidth="1.5"/>
    <path d="M8.29289 8.29289L15.7071 15.7071" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AnalyticsIcon: React.FC<{ fill?: string; size?: string | number }> = ({ fill = 'currentColor', size = '24px' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17L3 12M3 12L3 7M3 12H8M3 12H-2" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 0)"/>
    <path d="M12 17V14M12 14V11M12 14H17M12 14H7" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 0)"/>
    <path d="M21 17V10M21 10V3M21 10H26M21 10H16" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2 0)"/>
  </svg>
);
// --- End SVG Icons ---

interface ColumnData {
  number: string;
  title: string;
  items: string[];
  circleColor: string;
  bgColor: string;
  icon: React.ReactElement;
}

const infographicData: ColumnData[] = [
  {
    number: '01',
    title: 'Working Capital Optimization',
    items: [
      'Liquidity and Cash Flow Management','Receivables and Payables Management','Borrowings and Credit Facility Management',
      'Inventory Management and Optimization',
      'Financial Performance Analysis',

    ],
    circleColor: '#C0392B',
    bgColor: '#E74C3C',
    icon: <UserGroupIcon fill="#fff" size="30px" />,
  },
  {
    number: '02',
    title: 'Forex and Risk',
    items: [
      'Forex Risk Exposure Analysis',
      'Hedging Strategy Development',
      'Market and Economic Risk Assessment',
      'Scenario Analysis and Stress Testing',
      
    ],
    circleColor: 'rgb(245, 154, 8)',
    bgColor: '#F39C12',
    icon: <PriceTagIcon fill="#fff" size="30px" />,
  },
  {
    number: '03',
    title: 'Debt and Capital Management',
    items: [
      'Debt Portfolio & Financing Management',
      'Capital Structure Analysis and Optimization',
      'Cost of Capital Analysis',
      'Investment and Funding Strategy',
      'Financial Risk Management',
    ],
    circleColor: '#27AE60',
    bgColor: '#2ECC71',
    icon: <DiscountIcon fill="#fff" size="30px" />,
  },

];

const CommercialDetails: React.FC = () => {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const handleColumnClick = () => {
    setShowMessage(true);
  };

  const handleCloseMessage = () => {
    setShowMessage(false);
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f4f7f6',
      padding: '0px 0px',
      height: '100vh',
      boxSizing: 'border-box',
    },
    mainTitle: {
      color: '#2c3e50',
      marginBottom: '60px',
      textAlign: 'center',
      letterSpacing: '0.5px',
    },
    columnsContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      gap: '25px',
      flexWrap: 'nowrap',
      maxWidth: '1200px',
      width: '100%',
    },
    column: {
      position: 'relative',
      flex: '1 1 200px',
      maxWidth: '280px',
      minWidth: '240px',
      padding: '70px 25px 35px 25px',
      borderRadius: '15px 15px 80px 80px',
      color: 'white',
      textAlign: 'left',
      boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
      minHeight: '360px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
      cursor: 'pointer',
    },
    columnHovered: {
      transform: 'translateY(-10px) scale(1.03)',
      boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
    },
    circle: {
      position: 'absolute',
      top: '-35px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '75px',
      height: '75px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '26px',
      fontWeight: 'bold',
      border: '5px solid white',
      boxSizing: 'border-box',
      zIndex: 1,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    iconContainer: {
      textAlign: 'center',
      marginBottom: '15px',
      marginTop: '-10px',
    },
    columnTitle: {
      fontSize: '20px',
      fontWeight: 600,
      marginBottom: '20px',
      textAlign: 'center',
      minHeight: '40px',
    },
    list: {
      listStyle: 'none',
      paddingLeft: '0px',
      margin: '0',
      fontSize: '14.5px',
      flexGrow: 1,
    },
    listItem: {
      marginBottom: '12px',
      lineHeight: '1.6',
      display: 'flex',
      alignItems: 'flex-start',
      opacity: 0.9,
    },
    listItemBullet: {
      marginRight: '10px',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '1.2em',
      lineHeight: '1.4',
    }
  };

  return (
    <div style={styles.container}>
      <p style={styles.mainTitle}> </p>
      <p style={styles.mainTitle}>
        The Treasury Management Module provides real-time visibility into cash, liquidity, and risk exposure while enabling accurate cash flow forecasting and optimal fund allocation. It streamlines FX management, debt planning, and investment tracking, helping reduce financial risk and improve returns. By automating treasury operations and integrating with banking systems, it ensures efficient, compliant, and data-driven financial decisions.
      </p>
      <div style={styles.columnsContainer}>
        {infographicData.map((col, index) => (
          <div
            key={index}
            style={{
              ...styles.column,
              backgroundColor: col.bgColor,
              ...(hoveredColumn === index ? styles.columnHovered : {}),
            }}
            onMouseEnter={() => setHoveredColumn(index)}
            onMouseLeave={() => setHoveredColumn(null)}
            onClick={handleColumnClick}
            tabIndex={0}
            role="button"
            aria-label={`Column: ${col.title}`}
          >
            <div
              style={{
                ...styles.circle,
                backgroundColor: col.circleColor,
              }}
            >
              {col.number}
            </div>
            <div style={styles.iconContainer}>
              {col.icon}
            </div>
            <h2 style={styles.columnTitle}>{col.title}</h2>
            <ul style={styles.list}>
              {col.items.map((item, itemIndex) => (
                <li key={itemIndex} style={styles.listItem}>
                  <span style={styles.listItemBullet}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {showMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={handleCloseMessage}
        >
          <div
            style={{
              background: '#fff',
              padding: '32px 24px',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              maxWidth: 350,
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ color: '#c0392b', fontWeight: 600, marginBottom: 12 }}>
              Not available in demo environment.
            </p>
            <p style={{ color: '#2d3a4a', marginBottom: 0 }}>
              Write to{' '}
              <a
                href="https://www.ajalabs.ai"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0072ce', textDecoration: 'underline', fontWeight: 500 }}
              >
                ajalabs
              </a>{' '}
              to discuss further.
            </p>
            <button
              onClick={handleCloseMessage}
              style={{
                marginTop: 18,
                padding: '6px 18px',
                borderRadius: 6,
                border: 'none',
                background: '#0072ce',
                color: '#fff',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialDetails;