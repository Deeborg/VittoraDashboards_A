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
    title: 'Customer Profiling',
    items: [
      'Group customers based on purchase behavior, preferences, and profitability to create targeted sales strategies.',
      'Churn Prediction: Identify at-risk customers proactively.',
    ],
    circleColor: '#C0392B',
    bgColor: '#E74C3C',
    icon: <UserGroupIcon fill="#fff" size="30px" />,
  },
  {
    number: '02',
    title: 'Price Optimization',
    items: [
      'Analyze historical sales data, demand patterns, and competitor pricing to suggest optimal pricing strategies.',
      'Product / Channel / Customer profitability analysis.',
    ],
    circleColor: 'rgb(245, 154, 8)',
    bgColor: '#F39C12',
    icon: <PriceTagIcon fill="#fff" size="30px" />,
  },
  {
    number: '03',
    title: 'Discount Effectiveness',
    items: [
      'Evaluate the impact of discounts on sales and profit margins, identifying the most effective discount thresholds.',
    ],
    circleColor: '#27AE60',
    bgColor: '#2ECC71',
    icon: <DiscountIcon fill="#fff" size="30px" />,
  },
  {
    number: '04',
    title: 'Promotion Analytics',
    items: [
      'ROI of marketing campaigns.',
      'Cross-sell and Upsell Opportunities by using basket analysis.',
      'Customer Lifetime Value assessment.',
    ],
    circleColor: '#2980B9',
    bgColor: '#3498DB',
    icon: <AnalyticsIcon fill="#fff" size="30px" />,
  },
];

const CommercialDetails: React.FC = () => {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f4f7f6', // Softer background
      padding: '50px 20px',
      minHeight: '90vh',
      boxSizing: 'border-box',
    },
    mainTitle: {
      fontSize: 'clamp(28px, 5vw, 40px)', // Responsive font size
      fontWeight: 700,
      color: '#2c3e50', // Darker, more modern blue-gray
      marginBottom: '60px',
      textAlign: 'center',
      letterSpacing: '0.5px',
    },
    columnsContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch', // Make columns equal height if content differs
      gap: '25px',
      flexWrap: 'nowrap',
      maxWidth: '1200px', // Max width for larger screens
      width: '100%',
    },
    column: {
      position: 'relative',
      flex: '1 1 200px', // Flex properties for responsiveness
      maxWidth: '280px',
      minWidth: '240px',
      padding: '70px 25px 35px 25px',
      borderRadius: '15px 15px 80px 80px', // Slightly adjusted border radius
      color: 'white',
      textAlign: 'left',
      boxShadow: '0 6px 12px rgba(0,0,0,0.08)', // Softer shadow
      minHeight: '360px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out', // Smooth transition for hover
      cursor: 'pointer',
    },
    columnHovered: { // Styles to apply on hover
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
      marginTop: '-10px', // Pull icon up a bit
    },
    columnTitle: {
      fontSize: '20px',
      fontWeight: 600, // Semi-bold
      marginBottom: '20px',
      textAlign: 'center',
      minHeight: '40px', // Ensure space for two-line titles
    },
    list: {
      listStyle: 'none', // Remove default bullets
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
      opacity: 0.9, // Slightly transparent text for modern feel
    },
    listItemBullet: {
      marginRight: '10px',
      color: 'rgba(255, 255, 255, 0.7)', // Softer bullet color
      fontSize: '1.2em',
      lineHeight: '1.4', // Align with text
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>Commercial and Pricing eXcellence</h1>
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
    </div>
  );
};

export default CommercialDetails;

// To use this component in your App.tsx or another page:
// 1. Save this code as CommercialDetails.tsx in your components folder.
// 2. Import it: import CommercialDetails from './components/CommercialDetails';
// 3. Use it: <CommercialDetails />