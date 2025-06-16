import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Phase {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string; // Unicode character for icon
  // Angles in degrees, 0 is to the right, positive is counter-clockwise
  angleStart: number;
  angleEnd: number;
  // New properties for more precise text placement based on the new image
  labelXOffset: number; // Offset from the calculated radial position X
  labelYOffset: number; // Offset from the calculated radial position Y
  textAlign: 'left' | 'right' | 'center'; // Text alignment for the label block
  route: string; // Optional route for navigation
}



const phasesData: Phase[] = [
  {
    id: 'roi',
    title: 'ROI',
    description: 'Get insights on ROI on various strategic initiatives',
    color: '#1a5276', // Light Green (top-right in original image)
    icon: '👥',
    angleStart: 150,
    angleEnd: 210,
    labelXOffset: 92, // Adjusted to match image
    labelYOffset: 230, // Adjusted to match image
    textAlign: 'left', // Keep left based on image's visual spacing
    route: '/roi',
  },
  {
    id: 'scenario',
    title: 'Scenerio Analysis',
    description: 'Examine & evaluate possible events/scenarios.',
    color: '#1f618d', // Yellow (mid-left in original image)
    icon: '💡',
    angleStart: -30, // Equivalent to 330 degrees
    angleEnd: 30,
    labelXOffset: 45, // Adjusted to match image
    labelYOffset: -230, // Adjusted to match image
    textAlign: 'left',
    route: '/scenario',
  },  
  {
    id: 'sentiment',
    title: 'Sentiment Analysis',
    description: 'Evaluate the overall attitude of public on the company',
    color: '#2980b9', // Light Purple (mid-right in original image)
    icon: '🎯',
    angleStart: 30,
    angleEnd: 90,
    labelXOffset: 320, // Adjusted to match image
    labelYOffset: -120, // Adjusted to match image
    textAlign: 'left',
    route: '/sentiment',
  },
  {
    id: 'flux',
    title: 'Flux Analysis', // Changed from Sentiment Analysis to Flux Analysis based on image
    description: 'GL Analysis & Fluctuation analysis of GL & Risk Magnitude',
    color: '#2471a3', // Light Blue (bottom-right in original image)
    icon: '⚙️',
    angleStart: -90, // Equivalent to 270 degrees
    angleEnd: -30,
    labelXOffset: -220, // Adjusted to match image
    labelYOffset: -120, // Adjusted to match image
    textAlign: 'left',
    route: '/flux',
  },
  {
    id: 'esg',
    title: 'ESG',
    description: 'Evaluate the impact on the environment and society and governance',
    color: '#a9cce3', // Red (bottom-left in original image)
    icon: '🔍',
    angleStart: 210,
    angleEnd: 270,
    labelXOffset: -220, // Adjusted to match image
    labelYOffset: 120, // Adjusted to match image
    textAlign: 'left', // Keep right based on image's visual spacing
    route: '/esg',
  },

  {
    id: 'forecast',
    title: 'Forecast',
    description: 'Accurate financial forecast with machine learning',
    color: '#7fb3d5', // Light Purple (top-left in original image)
    icon: '🚀',
    angleStart: 90,
    angleEnd: 150,
    labelXOffset: 320, // Adjusted to match image
    labelYOffset: 120, // Adjusted to match image
    textAlign: 'left',
    route: '/forecast',
  },
];

// Helper function to convert polar to Cartesian coordinates
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0; // Adjust by -90 because SVG 0deg is up
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Helper function to describe an SVG arc path (pie segment)
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle); // Reversed for clockwise drawing
  const end = polarToCartesian(x, y, radius, startAngle); // Reversed for clockwise drawing

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, /* Sweep flag 0 for CCW in SVG coords, but angles reversed */ end.x, end.y,
    'Z',
  ].join(' ');

  return d;
};
const explodeDistance = 40; // How far to move the label and arc outward when active

const getExplodedLabelOffset = (phase: Phase) => {
  // Find the angle in radians for the middle of the arc
  const midAngle = ((phase.angleStart + phase.angleEnd) / 2 - 90) * Math.PI / 180;
  return {
    x: explodeDistance * Math.cos(midAngle),
    y: explodeDistance * Math.sin(midAngle),
  };
};



const SixPhaseInfographic: React.FC = () => {
  const svgSize = 500;
  const center = svgSize / 2;
  const outerRadius = svgSize / 2 - 40;
  const iconRadius = outerRadius * 0.65;
  const pullDistance = 15;
  const explodeDistance = 40;

  const navigate = useNavigate();

  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const handleShowMessage = () => setShowMessage(true);
  const handleCloseMessage = () => setShowMessage(false);  

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      position: 'relative',
      width: '100%',
      maxWidth: '700px',
      height: '700px',
      margin: '20px auto',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      
    },
    svgContainer: {
      position: 'relative',
      width: `${svgSize}px`,
      height: `${svgSize}px`,
      margin: '0 auto',
      marginTop: '0 auto',
    },
    centralCircle: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${outerRadius * 0.8}px`,
      height: `${outerRadius * 0.8}px`,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.98) 50%, rgba(255,255,255,0.85) 100%)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      zIndex: 10,
      cursor: 'pointer',
    },
    centralTextLarge: {
      fontSize: '45px',
      fontWeight: 'bold',
      color: '#000',
      lineHeight: 1,
    },
    centralTextSmall: {
      fontSize: '30px',
      color: '#555',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginTop: '4px',
    },
    phaseLabel: {
      position: 'absolute',
      width: '150px',
      zIndex: 5,
    },
    phaseTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '4px',
      cursor: 'pointer',
    },
    phaseDescription: {
      fontSize: '11px',
      color: '#666',
      lineHeight: 1.3,
      transition: 'opacity 0.3s ease-in-out, max-height 0.3s ease-in-out',
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

  const svgMarginTop = 100; // This should match your svgContainer.marginTop

  const getLabelStyle = (phase: Phase): React.CSSProperties => {
    const baseStyle = { ...styles.phaseLabel };

    let labelX = center + phase.labelXOffset;
    let labelY = center + phase.labelYOffset + svgMarginTop; // <-- Add svgMarginTop here

    // Explode if this phase is active or all are active
    if (activePhaseId === phase.id || activePhaseId === 'all') {
      const exploded = getExplodedLabelOffset(phase);
      labelX += exploded.x;
      labelY += exploded.y;
    }

    baseStyle.left = `${labelX}px`;
    baseStyle.top = `${labelY}px`;

    if (phase.textAlign === 'right') {
      baseStyle.transform = 'translate(-100%, -50%)';
    } else if (phase.textAlign === 'center') {
      baseStyle.transform = 'translate(-50%, -50%)';
    } else {
      baseStyle.transform = 'translate(0%, -50%)';
    }

    baseStyle.textAlign = phase.textAlign;
    baseStyle.transition = 'left 0.3s, top 0.3s';

    return baseStyle;
  };

  return (
    <div style={styles.container}>
      {/* <h1 style={{ textAlign: 'center', marginBottom: '30px', marginTop: '3px', color: 'rgb(204, 145, 19)' }}>
        Financial Planning & Analysis
      </h1> */}
      <div style={styles.svgContainer}>
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="3" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
            </filter>
          </defs>


          {phasesData.map((phase) => {
            const midAngle = (phase.angleStart + phase.angleEnd) / 2;
            const iconPos = polarToCartesian(center, center, iconRadius, midAngle);

            // Explode if this phase is active or all are active
            let transform = '';
            let filter = '';
            if (activePhaseId === phase.id || activePhaseId === 'all') {
              const translateAngle = ((midAngle - 90) * Math.PI) / 180.0;
              const translateX = -pullDistance * Math.cos(translateAngle);
              const translateY = -pullDistance * Math.sin(translateAngle);
              transform = `translate(${translateX}, ${translateY})`;
              filter = 'url(#shadow)';
            }

            // Conditionally set onClick and style
            const isDemoPhase = ["esg", "forecast", "roi"].includes(phase.id);

            return (
              <g
                key={phase.id}
                onClick={
                  isDemoPhase
                    ? handleShowMessage
                    : () => navigate(phase.route)
                }
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease-out, filter 0.3s ease-out'
                }}
                transform={transform}
                filter={filter}
              >
                <path
                  d={describeArc(center, center, outerRadius, phase.angleStart, phase.angleEnd)}
                  fill={phase.color}
                />
                <text
                  x={iconPos.x}
                  y={iconPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="24px"
                  fill="#333"
                  style={{ pointerEvents: 'none' }}
                >
                  {phase.icon}
                </text>
              </g>
            );
          })}

        </svg>
        <div
          style={styles.centralCircle}
          onClick={() => setActivePhaseId(activePhaseId === 'all' ? null : 'all')}
        >
          <span style={styles.centralTextLarge}>FP&A</span>
        </div>
      </div>

      {phasesData.map((phase) => (
        <div key={`${phase.id}-label`} style={getLabelStyle(phase)}>
          <div
            style={{ ...styles.phaseTitle, color: phase.color }}
            // onClick={() => setActivePhaseId(activePhaseId === phase.id ? null : phase.id)}
            onClick={() => navigate(phase.route)}
          >
            {phase.title}
          </div>
          <div
            style={{
              ...styles.phaseDescription,
              ...((activePhaseId === phase.id || activePhaseId === 'all') ? styles.phaseDescriptionActive : {}),
            }}
          >
            {phase.description}
          </div>
        </div>
      ))}

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

export default SixPhaseInfographic;