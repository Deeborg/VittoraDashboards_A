import React, { useRef, useState, useEffect } from 'react';
import './ModulePage.Module.css';
import { FaHome } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

import SixPhaseInfographic from './modules/FinanceDetails';
import CommercialDetails from './modules/CommercialDetails';
import AuTmDetails from './modules/AutmDetails';
import ScmDetails from './modules/ScmDetails';

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

// NEW: Updated ModulePill with floating squares
const ModulePill: React.FC<ModulePillProps> = ({ module, onClick, index, isActive }) => {
  // We no longer need the unique gradient class for the background
  return (
    <div
      className={`box ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={`Learn more about ${module.displayText}`}
    >
      {/* These are the new floating squares */}
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

  // Refs for scrolling
  const fpaRef = useRef<HTMLDivElement>(null);
  const cpxRef = useRef<HTMLDivElement>(null);
  const scmRef = useRef<HTMLDivElement>(null);
  const autmRef = useRef<HTMLDivElement>(null);
  const topContentRef = useRef<HTMLDivElement>(null);
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

  const moduleRefsMap: Record<string, React.RefObject<HTMLDivElement>> = {
    finance: fpaRef,
    commercial: cpxRef,
    scm: scmRef,
    autm: autmRef,
  };

  useEffect(() => {
    // Handles deep-linking to a specific module from another page
    if (location.state?.scrollToModule) {
      const moduleId = location.state.scrollToModule;
      setActiveModule(moduleId);
      setTimeout(() => {
        const targetRef = moduleRefsMap[moduleId];
        if (targetRef?.current) {
          scrollToSection(targetRef);
        }
      }, 100);
    }
  }, [location.state]);

  useEffect(() => {
    // Manages the visibility of the "Back to Top" button
    const scrollWrapper = scrollWrapperRef.current;
    const handleScroll = () => {
      if (scrollWrapper) {
        setShowBackToTop(scrollWrapper.scrollTop > 200 || activeModule !== null);
      }
    };

    scrollWrapper?.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => scrollWrapper?.removeEventListener('scroll', handleScroll);
  }, [activeModule]);

  const handleGoHome = () => {
    navigate('/');
  };

  const scrollToSection = (targetRef: React.RefObject<HTMLDivElement | null>) => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleModuleClick = (moduleId: string) => {
    if (activeModule === moduleId) {
      setActiveModule(null);
      scrollToSection(topContentRef);
    } else {
      setActiveModule(moduleId);
      setTimeout(() => {
        const targetRef = moduleRefsMap[moduleId];
        if (targetRef?.current) {
          scrollToSection(targetRef);
        }
      }, 100); // Delay ensures the component is rendered before scrolling
    }
  };

  const handleBackToTop = () => {
    setActiveModule(null);
    scrollToSection(topContentRef);
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
        <div className="modules-main-view" ref={topContentRef}>
          <ul className="circles">
            {Array.from({ length: 10 }).map((_, i) => (
              <li key={i}></li>
            ))}
          </ul>

          {moduleDataList.map((module, index) => (
            <ModulePill
              key={module.id}
              module={module}
              onClick={() => handleModuleClick(module.id)}
              index={index}
              isActive={activeModule === module.id}
            />
          ))}
        </div>

        {moduleDataList.map((module) => {
          const DetailComponent = module.detailsComponent;
          return (
            <div
              key={`${module.id}-details`}
              className={`module-details-section ${activeModule === module.id ? 'active' : ''}`}
              ref={moduleRefsMap[module.id]}
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
        title="Back to top"
        aria-label="Back to top"
      >
        <span className="back-text">Back to top</span>
        <span className="back-icon">▲</span>
      </button>
    </div>
  );
};


export default KeyModulesPage;