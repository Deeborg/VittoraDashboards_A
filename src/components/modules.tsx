import React, { useRef, useState, useEffect } from 'react';
import './ModulePage.Module.css'; // Import the CSS file
import { FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SixPhaseInfographic from './modules/FinanceDetails';
import CommercialDetails from './modules/CommercialDetails';
import AuTmDetails from './modules/AutmDetails';
import ScmDetails from './modules/ScmDetails';

const KeyModulesPage: React.FC = () => {
    const navigate = useNavigate();

    // State to keep track of the currently active/selected module
    const [activeModule, setActiveModule] = useState<string | null>(null);

    // Create refs for each section you want to scroll to
    const fpaRef = useRef<HTMLDivElement>(null);
    const cpxRef = useRef<HTMLDivElement>(null);
    const scmRef = useRef<HTMLDivElement>(null);
    const autmRef = useRef<HTMLDivElement>(null);
    // Ref for the top section (circular diagram area)
    const topSectionRef = useRef<HTMLDivElement>(null);

    // Map module names to their respective refs for easier access
    const moduleRefs: { [key: string]: React.RefObject<HTMLDivElement | null> } = {
        finance: fpaRef,
        commercial: cpxRef,
        scm: scmRef,
        autm: autmRef,
    };

    const handleGoHome = () => {
        navigate('/');
    };

    // Function to scroll to a specific ref
    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Handles the click on a module button
    const handleModuleClick = (moduleName: string) => {
        // If the clicked module is already active, deactivate it (hide content)
        if (activeModule === moduleName) {
            setActiveModule(null); // Deselect the button and hide content
            // Scroll back to top when module is deselected
            if (topSectionRef.current) {
                scrollToSection(topSectionRef);
            }
        } else {
            // Otherwise, activate the new module and show its content
            setActiveModule(moduleName);
            // Scroll to the content area after a slight delay to ensure it's rendered
            setTimeout(() => {
                const ref = moduleRefs[moduleName]; // Get the correct ref from the map
                if (ref && ref.current) {
                    scrollToSection(ref);
                }
            }, 100);
        }
    };

    // Handles the click on the "Back to Top" button
    const handleBackToTop = () => {
        setActiveModule(null); // Hide the currently active module content
        if (topSectionRef.current) {
            scrollToSection(topSectionRef); // Scroll back to the top section
        }
    };

    // useEffect hook to disable/enable body scrolling
    useEffect(() => {
        // Disable scrolling when the component mounts
        document.body.style.overflow = 'hidden';

        // Re-enable scrolling when the component unmounts (cleanup function)
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []); // Empty dependency array means this effect runs once on mount and once on unmount

    return (
        // The main container is set to hide overflow to prevent manual scrolling
        <div className="key-modules-container" style={{ overflowY: 'hidden', height: '100vh', position: 'relative' }}>
            <header className="key-modules-header" ref={topSectionRef}> {/* Attach ref to the header */}
                <button className="key-modules-button" onClick={handleGoHome} title="Go to Home">
                    {/* Render the home icon */}
                    {React.createElement(FaHome as React.FC<any>, { size: 35 })}
                </button>
                <h1>KEY MODULES</h1>
            </header>

            <div className="modules-content">
                <div className="circular-diagram-wrapper">
                    {/* The main image in the center */}
                    <img src="./asset/modules.png" alt="Key Modules Diagram" className="circular-diagram-image" />

                    {/* Module Text Containers - Add onClick handlers and dynamic active class */}
                    {/* The 'active' class can be used in CSS to style the active button */}
                    <div
                        className={`module-text-container finance ${activeModule === 'finance' ? 'active' : ''}`}
                        onClick={() => handleModuleClick('finance')}
                    >
                        <span className="module-text">Finance Planning and Analysis (FP&A)</span>
                    </div>

                    <div
                        className={`module-text-container commercial ${activeModule === 'commercial' ? 'active' : ''}`}
                        onClick={() => handleModuleClick('commercial')}
                    >
                        <span className="module-text">Commercial and Pricing Excellence (CPX)</span>
                    </div>

                    <div
                        className={`module-text-container scm ${activeModule === 'scm' ? 'active' : ''}`}
                        onClick={() => handleModuleClick('scm')}
                    >
                        <span className="module-text">Supply Chain Management (SCM)</span>
                    </div>

                    <div
                        className={`module-text-container autm ${activeModule === 'autm' ? 'active' : ''}`}
                        onClick={() => handleModuleClick('autm')}
                    >
                        <span className="module-text">Autonomous Treasury Management (AuTM)</span>
                    </div>
                </div>
            </div>

            {/* Content Sections for each module */}
            {/* The 'display' style property is used to show/hide the content based on activeModule state */}
            <div
                className="module-details-section"
                ref={fpaRef}
                style={{ display: activeModule === 'finance' ? 'block' : 'none' }}
            >
                <SixPhaseInfographic />
            </div>

            <div
                className="module-details-section"
                ref={cpxRef}
                style={{ display: activeModule === 'commercial' ? 'block' : 'none' }}
            >
                <CommercialDetails />
            </div>

            <div
                className="module-details-section"
                ref={scmRef}
                style={{ display: activeModule === 'scm' ? 'block' : 'none' }}
            >
                <ScmDetails />
            </div>

            <div
                className="module-details-section"
                ref={autmRef}
                style={{ display: activeModule === 'autm' ? 'block' : 'none' }}
            >
                <AuTmDetails />
            </div>

            {/* Back to Top Button */}
            {activeModule && ( // Only render if a module is active
                <button
                    className="back-to-top-button"
                    onClick={handleBackToTop}
                    title="Back to Top"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                    }}
                >
                    &#x2191; {/* Up arrow character */}
                </button>
            )}
        </div>
    );
};

export default KeyModulesPage;
