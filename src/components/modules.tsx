import React, { useRef, useState, useEffect } from 'react';
import './ModulePage.Module.css';
import { FaHome, FaArrowUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Import your module detail components
import SixPhaseInfographic from './modules/FinanceDetails';
import CommercialDetails from './modules/CommercialDetails';
import AuTmDetails from './modules/AutmDetails';
import ScmDetails from './modules/ScmDetails';

import { useLocation } from 'react-router-dom';


const modulesDiagram = './asset/modules.png';



export interface ModuleDetail {
  id: string;
  displayText: string;
  abbreviation: string;
  color: string;
  pillPositionClass: string;
  detailsComponent: React.FC<any>;
}

interface ModulePillProps {
  module: ModuleDetail;
  isActive: boolean;
  onClick: () => void;
}

const ModulePill: React.FC<ModulePillProps> = ({ module, isActive, onClick }) => {
  return (
    <div
      className={`module-pill ${module.pillPositionClass} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ backgroundColor: !isActive ? module.color : undefined }}
      title={`Learn more about ${module.displayText}`}
      role="button"
      aria-pressed={isActive}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span className="module-text">{module.displayText} ({module.abbreviation})</span>
    </div>
  );
};

const KeyModulesPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const fpaRef = useRef<HTMLDivElement>(null);
    const cpxRef = useRef<HTMLDivElement>(null);
    const scmRef = useRef<HTMLDivElement>(null);
    const autmRef = useRef<HTMLDivElement>(null);
    const topContentRef = useRef<HTMLDivElement>(null);
    const scrollWrapperRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    useEffect(() => {
    if (location.state && location.state.scrollToModule) {
        const moduleId = location.state.scrollToModule;
        setActiveModule(moduleId);
        setTimeout(() => {
        const targetRef = moduleRefsMap[moduleId];
        if (targetRef && targetRef.current) {
            scrollToSection(targetRef);
        }
        }, 100);
    }
    }, [location.state]);    

    const moduleDataList: ModuleDetail[] = [
      {
        id: 'finance',
        displayText: 'Finance Planning and Analysis',
        abbreviation: 'FP&A',
        color: '#FFA726',
        pillPositionClass: 'finance-pill-pos',
        detailsComponent: SixPhaseInfographic,
      },
      {
        id: 'commercial',
        displayText: 'Commercial and Pricing Excellence',
        abbreviation: 'CPX',
        color: '#8BC34A',
        pillPositionClass: 'commercial-pill-pos',
        detailsComponent: CommercialDetails,
      },
      {
        id: 'scm',
        displayText: 'Supply Chain Management',
        abbreviation: 'SCM',
        color: '#EF5350',
        pillPositionClass: 'scm-pill-pos',
        detailsComponent: ScmDetails,
      },
      {
        id: 'autm',
        displayText: 'Autonomous Treasury Management',
        abbreviation: 'AuTM',
        color: '#29B6F6',
        pillPositionClass: 'autm-pill-pos',
        detailsComponent: AuTmDetails,
      },
    ];

    const moduleRefsMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      finance: fpaRef,
      commercial: cpxRef,
      scm: scmRef,
      autm: autmRef,
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const scrollToSection = (targetRef: React.RefObject<HTMLDivElement | null>) => {
        if (targetRef.current && scrollWrapperRef.current) {
            targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleModuleClick = (moduleId: string) => {
        if (activeModule === moduleId) {
            setActiveModule(null);
            if (topContentRef.current) {
                scrollToSection(topContentRef);
            }
        } else {
            setActiveModule(moduleId);
            setTimeout(() => {
                const targetRef = moduleRefsMap[moduleId];
                if (targetRef && targetRef.current) {
                    scrollToSection(targetRef);
                }
            }, 100);
        }
    };

    const handleBackToTop = () => {
        setActiveModule(null);
        if (topContentRef.current) {
            scrollToSection(topContentRef);
        }
    };

    useEffect(() => {
        const scrollWrapper = scrollWrapperRef.current;
        const handleScroll = () => {
            if (scrollWrapper) {
                // Show button when scrolled down 200px or when a module is active
                setShowBackToTop(scrollWrapper.scrollTop > 200 || activeModule !== null);
            }
        };
        
        scrollWrapper?.addEventListener('scroll', handleScroll);
        
        // Initial check
        handleScroll();
        
        return () => {
            scrollWrapper?.removeEventListener('scroll', handleScroll);
        };
    }, [activeModule]);

    return (
        <div className="key-modules-container">
            <header className="key-modules-header">
                <button className="home-button" onClick={handleGoHome} title="Go to Home">
                    <FaHome size={28} />
                </button>
                <h1>
                        {activeModule
                            ? moduleDataList.find(m => m.id === activeModule)?.displayText || "Finance Modules"
                            : "Finance Modules"}
                </h1>                
                <img
                    src="./asset/vittora_grey.png"
                    alt="Vittora Logo"
                    style={{ height: 40 }}
                />
            </header>
            
            
            <div className="key-modules-scroll-wrapper" ref={scrollWrapperRef}>
                <div className="modules-main-view" ref={topContentRef}>
                    <div className="circular-diagram-wrapper">
                        <img src={modulesDiagram} alt="Key Modules Diagram" className="circular-diagram-image" />
                        {moduleDataList.map((module) => (
                            <ModulePill
                                key={module.id}
                                module={module}
                                isActive={activeModule === module.id}
                                onClick={() => handleModuleClick(module.id)}
                            />
                        ))}
                    </div>
                </div>

                {moduleDataList.map((module) => {
                    const DetailComponent = module.detailsComponent;
                    return (
                        <div
                            key={`${module.id}-details`}
                            className={`module-details-section ${activeModule === module.id ? 'active' : ''}`}
                            ref={moduleRefsMap[module.id]}
                        >
                            <DetailComponent />
                        </div>
                    );
                })}
            </div>

            <button
                className={`back-to-top-button ${showBackToTop ? 'visible' : ''}`}
                onClick={handleBackToTop}
                title="Back to Modules"
                aria-label="Back to Modules"
            >
                <FaArrowUp size={50} />
            </button>
        </div>
    );
};

export default KeyModulesPage;