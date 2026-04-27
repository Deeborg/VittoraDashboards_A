import React, { useRef, useState, useEffect } from 'react';
import './ModulePage.Module.css';
import { FaHome } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

import SixPhaseInfographic from './modules/FinanceDetails';
import CommercialDetails from './modules/CommercialDetails';
import AuTmDetails from './modules/AutmDetails';
import ScmDetails from './modules/ScmDetails';
import { motion } from 'framer-motion';

export interface ModuleDetail {
  id: string;
  displayText: string;
  abbreviation: string;
  description: string;
  detailsComponent: React.FC<any>;
}

interface ModulePillProps {
  module: ModuleDetail;
  onClick: () => void;
  index: number;
  isActive: boolean;
}

const ModulePill: React.FC<ModulePillProps> = ({ module, onClick, isActive }) => {
  return (
    <div
      className={`box ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={`Learn more about ${module.displayText}`}
    >
      <div className="floating-square top-square"></div>
      <div className="floating-square bottom-square"></div>

      <div className="content">
        <h2>{`${module.displayText} (${module.abbreviation})`}</h2>
        <p>{module.description}</p>
      </div>
    </div>
  );
};

const KeyModulesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  const moduleDataList: ModuleDetail[] = [
    {
      id: 'finance',
      displayText: 'Finance Planning and Analysis',
      description: 'Strategic budgeting, forecasting, and financial performance optimization.',
      abbreviation: 'FP&A',
      detailsComponent: SixPhaseInfographic,
    },
    {
      id: 'autm',
      displayText: 'Autonomous Treasury Management',
      description: 'Automated treasury operations for cash and risk management.',
      abbreviation: 'AuTM',
      detailsComponent: AuTmDetails,
    },
    {
      id: 'scm',
      displayText: 'Supply Chain Management',
      description: 'Streamlined supply chain, logistics, and inventory management.',
      abbreviation: 'SCM',
      detailsComponent: ScmDetails,
    },
    {
      id: 'commercial',
      displayText: 'Commercial and Pricing Excellence',
      description: 'Data-driven pricing and commercial strategy enhancement.',
      abbreviation: 'CPX',
      detailsComponent: CommercialDetails,
    },
  ];

  useEffect(() => {
    if (location.state?.scrollToModule) {
      handleModuleClick(location.state.scrollToModule);
    }
  }, [location.state]);

  useEffect(() => {
    const scrollWrapper = scrollWrapperRef.current;
    const handleScroll = () => {
      if (scrollWrapper) {
        // Show button if scrolled down OR if viewing a specific module
        setShowBackToTop(scrollWrapper.scrollTop > 200 || activeModule !== null);
      }
    };

    scrollWrapper?.addEventListener('scroll', handleScroll);
    handleScroll(); 

    return () => scrollWrapper?.removeEventListener('scroll', handleScroll);
  }, [activeModule]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
    // Reset scroll to top instantly when switching views
    setTimeout(() => setActiveModule(moduleId), 100);
    if (scrollWrapperRef.current) {
      scrollWrapperRef.current.scrollTop = 0;
    }
  };

  const handleBackToTop = () => {
    setActiveModule(null);
    // Reset scroll back to the top of the cards
    if (scrollWrapperRef.current) {
      scrollWrapperRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="key-modules-container">
      <header className="key-modules-header">
        <button className="home-button" onClick={handleGoHome} title="Go to Home">
          <FaHome size={28} />
        </button>
        <h1>
          {activeModule
            ? moduleDataList.find((m) => m.id === activeModule)?.displayText || 'Finance Modules'
            : 'Finance Modules'}
        </h1>
        <img src="./asset/vittora_grey.png" alt="Vittora Logo" style={{ height: 40 }} />
      </header>

      <div className="key-modules-scroll-wrapper" ref={scrollWrapperRef}>
        
        {/* 🌟 CRITICAL FIX: The 'hidden' class hides the cards entirely when a module is active */}
        <div className={`modules-main-view ${activeModule !== null ? 'hidden' : ''}`}>
  <ul className="circles">
    {Array.from({ length: 10 }).map((_, i) => <li key={i}></li>)}
  </ul>
  
  {/* The Bubble Container */}
  <div className="bubble-navigation-wrapper">
    {moduleDataList.map((module) => (
      <motion.div
        layout
        key={module.id}
        onClick={() => handleModuleClick(module.id)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="professional-bubble"
        style={{ background: `linear-gradient(135deg, #4dabf7, #2c3e50)` }}
        transition={{ 
    type: "spring", 
    stiffness: 300, 
    damping: 20 
  }} // You can map colors here
      >
          <div className="bubble-content">
    <motion.h2 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {`${module.displayText} (${module.abbreviation})`}
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {module.description}
    </motion.p>
  </div>
</motion.div>
    ))}
  </div>
</div>

        {/* Detail Sections */}
        {moduleDataList.map((module) => {
          const DetailComponent = module.detailsComponent;
          return (
            <div
              key={`${module.id}-details`}
              className={`module-details-section ${activeModule === module.id ? 'active' : ''}`}
            >
              <ul className="circles">
                {Array.from({ length: 15 }).map((_, i) => (
                  <li key={i}></li>
                ))}
              </ul>
              <DetailComponent />
            </div>
          );
        })}
      </div>

      <button
        className={`back-to-top-button ${showBackToTop ? 'visible' : ''}`}
        onClick={handleBackToTop}
        title={activeModule ? "Back to Modules" : "Back to top"}
      >
        <span className="back-text">{activeModule ? "Back to Modules" : "Back to top"}</span>
        <span className="back-icon">{activeModule ? "←" : "▲"}</span>
      </button>
    </div>
  );
};

export default KeyModulesPage;