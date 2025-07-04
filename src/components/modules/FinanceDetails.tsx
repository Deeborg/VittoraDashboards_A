import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp, FiTarget, FiBarChart2, FiShuffle, FiGlobe, FiGitMerge
} from 'react-icons/fi';

interface Phase {
  id: string;
  title: string;
  description: string;
  color: string; // Refers to an SVG gradient ID
  cssGradient: string; // Holds the CSS gradient for the info box
  icon: React.ReactElement;
  angleStart: number;
  angleEnd: number;
  labelXOffset: number;
  labelYOffset: number;
  textAlign: 'left' | 'right' | 'center';
  route: string;
}

const phasesData: Phase[] = [
  { id: 'roi', title: 'ROI', description: 'Get insights on ROI on various strategic initiatives', color: 'gradient-roi', cssGradient: 'linear-gradient(135deg, #4dabf7, #1971c2)', icon: <FiBarChart2 size={26} />, angleStart: 150, angleEnd: 210, labelXOffset: 99, labelYOffset: 220, textAlign: 'center', route: '/roi' },
  { id: 'scenario', title: 'Scenerio Analysis', description: 'Examine & evaluate possible events/scenarios.', color: 'gradient-scenario',cssGradient: 'linear-gradient(135deg, #63e6be, #20c997)', icon: <FiGitMerge size={26} />, angleStart: -30, angleEnd: 30, labelXOffset: 98, labelYOffset: -220, textAlign: 'center', route: '/scenario' },
  { id: 'sentiment', title: 'Sentiment Analysis', description: 'Evaluate the overall attitude of public on the company', color: 'gradient-sentiment',cssGradient: 'linear-gradient(135deg, #845ef7, #5f3dc4)', icon: <FiTarget size={26} />, angleStart: 30, angleEnd: 90, labelXOffset: 350, labelYOffset: -90, textAlign: 'center', route: '/sentiment' },
  { id: 'flux', title: 'Flux Analysis', description: 'GL Analysis & Fluctuation analysis of GL & Risk Magnitude', color: 'gradient-flux', cssGradient: 'linear-gradient(135deg, #4c6ef5, #364fc7)', icon: <FiShuffle size={26} />,  angleStart: -90, angleEnd: -30, labelXOffset: -145, labelYOffset: -90, textAlign: 'center', route: '/flux' },
  { id: 'esg', title: 'ESG', description: 'Evaluate the impact on the environment and society and governance', color: 'gradient-esg', cssGradient: 'linear-gradient(135deg, #22b8cf, #0b7285)', icon: <FiGlobe size={26} />, angleStart: 210, angleEnd: 270, labelXOffset: -135, labelYOffset: 105, textAlign: 'center', route: '/esg' },
  { id: 'forecast', title: 'Forecast', description: 'Accurate financial forecast with machine learning', color: 'gradient-forecast', cssGradient: 'linear-gradient(135deg, #748ffc, #4c6ef5)', icon: <FiTrendingUp size={26} />, angleStart: 90, angleEnd: 150, labelXOffset: 330, labelYOffset: 105, textAlign: 'center', route: '/forecast' },
];

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
};

const explodeDistance = 40;

const SixPhaseInfographic: React.FC = () => {
  const svgSize = 500;
  const center = svgSize / 2;
  const outerRadius = svgSize / 2 - 40;
  const iconRadius = outerRadius * 0.65;
  const pullDistance = 15;

  const navigate = useNavigate();
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isCentralCirclePressed, setIsCentralCirclePressed] = useState(false);
  const handleShowMessage = () => setShowMessage(true);
  const handleCloseMessage = () => setShowMessage(false);

  // --- CHANGED SECTION 1: Updated styles object ---
  // I have removed the 'centralCircle' and 'centralTextLarge' styles
  // as they are no longer used by the new button.
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      position: 'relative',
      width: '100%',
      maxWidth: '700px',
      height: '700px',
      margin: '35px auto',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    },
    svgContainer: {
      position: 'relative',
      width: `${svgSize}px`,
      height: `${svgSize}px`,
    },
    phaseLabel: {
      position: 'absolute',
      width: '150px',
      zIndex: 5,
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    phaseTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '4px',
      color: '#4A5568',
      lineHeight: 1.4,
      cursor: 'pointer',
    },
    phaseDescription: {
      fontSize: '11px',
      color: '#666',
      lineHeight: 1.3,
      transition: 'opacity 0.3s, max-height 0.3s',
      maxHeight: '0px',
      overflow: 'hidden',
      opacity: 0,
    },
    phaseDescriptionActive: {
      maxHeight: '100px',
      opacity: 1,
    }
  };

  const getExplodedLabelOffset = (phase: Phase) => {
    const midAngle = ((phase.angleStart + phase.angleEnd) / 2 - 90) * Math.PI / 180;
    return {
      x: explodeDistance * Math.cos(midAngle),
      y: explodeDistance * Math.sin(midAngle),
    };
  };

  const svgMarginTop = 100;

  const isPhaseActive = (id: string) => activePhaseId === id || activePhaseId === 'all';

  const getLabelStyle = (phase: Phase): React.CSSProperties => {
    const baseStyle = { ...styles.phaseLabel };
    let labelX = center + phase.labelXOffset;
    let labelY = center + phase.labelYOffset + svgMarginTop;

    if (isPhaseActive(phase.id)) {
      const exploded = getExplodedLabelOffset(phase);
      labelX += exploded.x;
      labelY += exploded.y;
    }

    baseStyle.left = `${labelX}px`;
    baseStyle.top = `${labelY}px`;

    if (phase.textAlign === 'right') baseStyle.transform = 'translate(-100%, -50%)';
    else if (phase.textAlign === 'center') baseStyle.transform = 'translate(-50%, -50%)';
    else baseStyle.transform = 'translate(0%, -50%)';

    baseStyle.textAlign = phase.textAlign;
    return baseStyle;
  };

  const getPhaseBoxStyle = (phase: Phase): React.CSSProperties => {
    const isActive = isPhaseActive(phase.id);
    return {
      background: isActive ? phase.cssGradient : 'transparent',
      borderRadius: '16px',
      boxShadow: isActive ? '0 8px 24px rgba(0, 0, 0, 0.2)' : 'none',
      padding: '12px 14px',
      border: 'none',
      transform: isActive ? 'scale(1.02)' : 'scale(1)',
    };
  };

  // --- CHANGED SECTION 2: Updated central element style function ---
  // This function now generates the styles for the new button,
  // incorporating the styles you provided and the component's state logic.
  const getCentralButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      // Styles from your provided CSS
      backgroundColor: 'rgb(242, 245, 247)',
      color: ' #48abe0',
      border: 'none',
      height: '130px',
      width: '130px',
      boxShadow: '0 2px 4px darkslategray',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderRadius: '50%', // To make it a circle
      
      // Styles for content and positioning
      fontSize: '28px', // Better size for text
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      fontFamily: "'Inter', sans-serif", 
      fontWeight: 'bold', // Make it stand out
      lineHeight: 1,
      
      // Positioning from the original component
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };

    // Style for the pressed state (:active)
    if (isCentralCirclePressed) {
      return {
        ...baseStyle,
        boxShadow: '0 0 2px darkslategray',
        transform: 'translate(-50%, calc(-50% + 2px))', // Replicates the translateY(2px) effect
      };
    }
    
    // Style for when all phases are active
    if (activePhaseId === 'all') {
        return {
           ...baseStyle,
           transform: 'translate(-50%, -50%) scale(0.95)',
           boxShadow: '0 1px 2px darkslategray',
       };
   }

    return baseStyle;
  };

  return (
    <div style={styles.container}>
      <div style={styles.svgContainer}>
        <svg width={svgSize} height={svgSize}>
          <defs>
              <linearGradient id="gradient-roi" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4dabf7" /><stop offset="100%" stopColor="#1971c2" /></linearGradient>
              <linearGradient id="gradient-scenario" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#63e6be" /><stop offset="100%" stopColor="#20c997" /></linearGradient>
              <linearGradient id="gradient-sentiment" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#845ef7" /><stop offset="100%" stopColor="#5f3dc4" /></linearGradient>
              <linearGradient id="gradient-flux" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4c6ef5" /><stop offset="100%" stopColor="#364fc7" /></linearGradient>
              <linearGradient id="gradient-esg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22b8cf" /><stop offset="100%" stopColor="#0b7285" /></linearGradient>
              <linearGradient id="gradient-forecast" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#748ffc" /><stop offset="100%" stopColor="#4c6ef5" /></linearGradient>
          </defs>

          {phasesData.map((phase) => {
            const midAngle = (phase.angleStart + phase.angleEnd) / 2;
            const iconPos = polarToCartesian(center, center, iconRadius, midAngle);

            let transform = '';
            let filter = '';
            if (isPhaseActive(phase.id)) {
              const translateAngle = ((midAngle - 90) * Math.PI) / 180.0;
              const translateX = -pullDistance * Math.cos(translateAngle);
              const translateY = -pullDistance * Math.sin(translateAngle);
              transform = `translate(${translateX}, ${translateY})`;
              filter = 'url(#shadow)';
            }

            const isDemoPhase = ["esg", "forecast", "roi"].includes(phase.id);

            return (
              <g
                key={phase.id}
                onClick={isDemoPhase ? handleShowMessage : () => navigate(phase.route)}
                transform={transform}
                filter={filter}
                style={{ cursor: 'pointer' }}
              >
                <path d={describeArc(center, center, outerRadius, phase.angleStart, phase.angleEnd)} fill={`url(#${phase.color})`} />
                <foreignObject x={iconPos.x - 20} y={iconPos.y - 20} width="40" height="40">
                <div style={{ color: 'rgba(255, 255, 255, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                  {phase.icon}
                </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

      {/* --- CHANGED SECTION 3: Replaced central div with a button --- */}
      {/* The old div has been replaced with this button element, */}
      {/* which uses the new style function and contains the sun icon. */}
      {/* All event handlers have been preserved. */}
      <button
          style={getCentralButtonStyle()}
          onClick={() => setActivePhaseId(activePhaseId === 'all' ? null : 'all')}
          onMouseDown={() => setIsCentralCirclePressed(true)}
          onMouseUp={() => setIsCentralCirclePressed(false)}
          onMouseLeave={() => setIsCentralCirclePressed(false)}
          onTouchStart={() => setIsCentralCirclePressed(true)}
          onTouchEnd={() => setIsCentralCirclePressed(false)}
        >
          FP&A
        </button>
      </div>
      
      {phasesData.map((phase) => {
        const isActive = isPhaseActive(phase.id);
        return (
          <div key={`${phase.id}-label`} style={getLabelStyle(phase)}>
            <div style={getPhaseBoxStyle(phase)} onClick={() => navigate(phase.route)}>
              <div style={{
                ...styles.phaseTitle,
                color: isActive ? '#fff' : '#555',
                textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.25)' : 'none'
              }}>
                {phase.title}
              </div>
              <div style={{
                ...styles.phaseDescription,
                ...(isActive ? styles.phaseDescriptionActive : {}),
                color: isActive ? 'rgba(255, 255, 255, 0.9)' : '#666',
                textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
              }}>
                {phase.description}
              </div>
            </div>
          </div>
        );
      })}

      {showMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={handleCloseMessage}>
          <div style={{ background: '#fff', padding: '32px 24px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', maxWidth: 350, textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <p style={{ color: '#c0392b', fontWeight: 600, marginBottom: 12 }}>Not available in demo environment.</p>
            <p style={{ color: '#2d3a4a' }}>
              Write to{' '}
              <a href="https://www.ajalabs.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#0072ce', textDecoration: 'underline', fontWeight: 500 }}>
                ajalabs
              </a>{' '}
              to discuss further.
            </p>
            <button onClick={handleCloseMessage} style={{ marginTop: 18, padding: '6px 18px', borderRadius: 6, border: 'none', background: '#0072ce', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SixPhaseInfographic;