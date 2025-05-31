import React, { useRef, useState, useEffect } from 'react';
import './ModulePage.Module.css'; // Your main CSS file
import { FaHome, FaArrowUp } from 'react-icons/fa'; // Added FaArrowUp for back-to-top
import { useNavigate } from 'react-router-dom';

// Import your module detail components
import SixPhaseInfographic from './modules/FinanceDetails';
import CommercialDetails from './modules/CommercialDetails';
import AuTmDetails from './modules/AutmDetails';
import ScmDetails from './modules/ScmDetails';

// Import your central diagram image (ensure the path is correct)
// If 'asset' is in your 'public' folder: const modulesDiagram = "/asset/modules.png";
// If 'asset' is relative to this file (e.g., src/pages/asset/):
const modulesDiagram = './asset/modules.png';

// Define ModuleDetail interface (as above, or import it)
export interface ModuleDetail {
  id: string;
  displayText: string;
  abbreviation: string;
  color: string;
  pillPositionClass: string;
  detailsComponent: React.FC<any>;
}

// --- ModulePill Sub-Component ---
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
      style={{ backgroundColor: !isActive ? module.color : undefined /* Active style via CSS */ }}
      title={`Learn more about ${module.displayText}`}
      role="button"
      aria-pressed={isActive}
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => { // Keyboard accessibility
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); // Prevent spacebar scroll
          onClick();
        }
      }}
    >
      <span className="module-text">{module.displayText} ({module.abbreviation})</span>
    </div>
  );
};


// --- KeyModulesPage Main Component ---
const KeyModulesPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeModule, setActiveModule] = useState<string | null>(null);

    // Refs for each module detail section
    const fpaRef = useRef<HTMLDivElement>(null);
    const cpxRef = useRef<HTMLDivElement>(null);
    const scmRef = useRef<HTMLDivElement>(null);
    const autmRef = useRef<HTMLDivElement>(null);

    // Ref for the scrollable content area's top (where the diagram is)
    const topContentRef = useRef<HTMLDivElement>(null);
    // Ref for the scroll wrapper itself, to control its scroll position
    const scrollWrapperRef = useRef<HTMLDivElement>(null);


    // --- Module Configuration Data ---
    const moduleDataList: ModuleDetail[] = [
      {
        id: 'finance',
        displayText: 'Finance Planning and Analysis',
        abbreviation: 'FP&A',
        color: '#FFA726', // Orange
        pillPositionClass: 'finance-pill-pos',
        detailsComponent: SixPhaseInfographic,
      },
      {
        id: 'commercial',
        displayText: 'Commercial and Pricing Excellence',
        abbreviation: 'CPX',
        color: '#8BC34A', // Green
        pillPositionClass: 'commercial-pill-pos',
        detailsComponent: CommercialDetails,
      },
      {
        id: 'scm',
        displayText: 'Supply Chain Management',
        abbreviation: 'SCM',
        color: '#EF5350', // Red
        pillPositionClass: 'scm-pill-pos',
        detailsComponent: ScmDetails,
      },
      {
        id: 'autm',
        displayText: 'Autonomous Treasury Management',
        abbreviation: 'AuTM',
        color: '#29B6F6', // Blue
        pillPositionClass: 'autm-pill-pos',
        detailsComponent: AuTmDetails,
      },
    ];

    // Map module IDs to their refs for scrolling
    const moduleRefsMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      finance: fpaRef,
      commercial: cpxRef,
      scm: scmRef,
      autm: autmRef,
    };

    const handleGoHome = () => {
        navigate('/');
    };

    // Function to scroll a specific element into view within the scrollWrapper
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
            }, 100); // Delay for DOM update
        }
    };

    const handleBackToTop = () => {
        setActiveModule(null); // Optionally deselect module
        if (topContentRef.current) {
            scrollToSection(topContentRef);
        }
    };

    // Optional: Show/hide back-to-top button based on scroll position
    const [showBackToTop, setShowBackToTop] = useState(false);
    useEffect(() => {
        const scrollWrapper = scrollWrapperRef.current;
        const handleScroll = () => {
            if (scrollWrapper) {
                setShowBackToTop(scrollWrapper.scrollTop > 200 && activeModule !== null); // Show if scrolled down & module active
            }
        };
        scrollWrapper?.addEventListener('scroll', handleScroll);
        return () => scrollWrapper?.removeEventListener('scroll', handleScroll);
    }, [activeModule]); // Re-check when activeModule changes

    return (
        <div className="key-modules-container">
            <header className="key-modules-header">
                <button className="home-button" onClick={handleGoHome} title="Go to Home">
                    <FaHome size={28} />
                </button>
                <h1>KEY MODULES</h1>
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
                            className="module-details-section"
                            ref={moduleRefsMap[module.id]}
                            style={{ display: activeModule === module.id ? 'block' : 'none' }}
                        >
                            {/* <h2>{module.displayText} Details</h2> */}
                            <DetailComponent />
                        </div>
                    );
                })}
            </div>

            {showBackToTop && (
                <button
                    className="back-to-top-button"
                    onClick={handleBackToTop}
                    title="Back to Top"
                >
                    <FaArrowUp />
                </button>
            )}
        </div>
    );
};

export default KeyModulesPage;