import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi'; // Import all icons

const navData = [
  { id: 'forecast', title: 'Forecast Intelligence', image: 'https://images.unsplash.com/photo-1768055104923-a6f76e7478c7?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', desc: 'ML-driven forecasting.', subs: ['Forecast', 'Scenario Analysis', 'Flux Analysis'] },
  { id: 'profit', title: 'Profitability Intelligence', image: 'https://images.unsplash.com/photo-1767424412548-1a1ac7f4b9bc?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', desc: 'ROI and Sentiment tracking.', subs: ['ROI', 'Sentiment Analysis'] },
  { id: 'strategic', title: 'Strategic Metrics', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', desc: 'ESG and impact reporting.', subs: ['ESG'] },
  { id: 'financial', title: 'Financial Monitoring', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', desc: 'Detailed financial analytics.', subs: ['Sales Analytics', 'Expense Analytics', 'Ageing', 'Investor Relations', 'Exception Reporting'] }
];

const routeMap: Record<string, string> = {
  'Scenario Analysis': '/scenario', 'Flux Analysis': '/flux', 'Sentiment Analysis': '/sentiment',
  'Forecast': 'http://localhost:9002', 'Ageing': '/analytics/Ageing', 'Investor Relations': '/analytics/investor',
  'Exception Reporting': '/analytics/exceptions', 'Sales Analytics': '/analytics/sales', 'Expense Analytics': '/analytics/expense',
  'ROI': '/roi', 'ESG': '/esg'
};

// Helper to get icon based on string
const getIcon = (name: string) => {
  const iconMap: Record<string, any> = { 'Forecast': FiIcons.FiTrendingUp, 'Scenario Analysis': FiIcons.FiGitMerge, 'Flux Analysis': FiIcons.FiShuffle, 'ROI': FiIcons.FiBarChart2, 'Sentiment Analysis': FiIcons.FiTarget, 'ESG': FiIcons.FiGlobe, 'Sales Analytics': FiIcons.FiShoppingCart, 'Expense Analytics': FiIcons.FiCreditCard, 'Ageing': FiIcons.FiClock, 'Investor Relations': FiIcons.FiUsers, 'Exception Reporting': FiIcons.FiAlertCircle };
  const IconComponent = iconMap[name] || FiIcons.FiChevronRight;
  return <IconComponent size={18} style={{ marginRight: '10px' }} />;
};

const FlipCardNav = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', padding: '10px', perspective: '2000px', background: '#f8fafc' }}>
      {navData.map((item) => (
        <motion.div
          key={item.id}
          style={{ width: '280px', height: '420px', cursor: 'pointer', position: 'relative', transformStyle: 'preserve-3d' }}
          animate={{ rotateY: activeId === item.id ? 180 : 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
          onClick={() => setActiveId(activeId === item.id ? null : item.id)}
        >
          {/* FRONT SIDE */}
          <div style={{ 
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
            borderRadius: '24px', overflow: 'hidden', backgroundImage: `url(${item.image})`,
            backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 20px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 600, textAlign: 'center', marginBottom: '15px' }}>{item.title}</h3>
              <div style={{ width: '50px', height: '3px', background: '#3b82f6', borderRadius: '2px' }} />
            </div>
          </div>

          {/* BACK SIDE */}
          <div style={{ 
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)', borderRadius: '24px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '25px', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
          position: 'absolute', inset: 0, backgroundImage: `url(${item.image})`, 
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(15px) brightness(0.8)', transform: 'scale(1.1)'
        }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
              <p style={{ color: '#f3f3f3', fontSize: '14px', marginBottom: '25px', textAlign: 'center' }}>{item.desc}</p>
              {item.subs.map(sub => (
                <button 
                  key={sub}
                  onClick={(e) => { e.stopPropagation(); navigate(routeMap[sub] || '/'); }}
                  style={{ 
                    display: 'flex', alignItems: 'center', width: '100%', marginBottom: '10px',
                    padding: '12px 15px', border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  {getIcon(sub)} {sub}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FlipCardNav;