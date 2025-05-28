import React, { useState } from 'react';

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
}

const phasesData: Phase[] = [
  {
    id: 'roi',
    title: 'ROI',
    description: 'Get insights on ROI on various strategic initiatives',
    color: '#81C784', // Light Green (top-right in original image)
    icon: '👥',
    angleStart: 30,
    angleEnd: 90,
    labelXOffset: 320, // Adjusted to match image
    labelYOffset: -6, // Adjusted to match image
    textAlign: 'left', // Keep left based on image's visual spacing
  },
  {
    id: 'sentiment',
    title: 'Sentiment Analysis',
    description: 'Evaluate the overall attitude of public on the company',
    color: '#9575CD', // Light Purple (mid-right in original image)
    icon: '🎯',
    angleStart: -30, // Equivalent to 330 degrees
    angleEnd: 30,
    labelXOffset: 70, // Adjusted to match image
    labelYOffset: -120, // Adjusted to match image
    textAlign: 'left',
  },
  {
    id: 'flux',
    title: 'Flux Analysis', // Changed from Sentiment Analysis to Flux Analysis based on image
    description: 'GL Analysis & Fluctuation analysis of GL & Risk Magnitude',
    color: '#64B5F6', // Light Blue (bottom-right in original image)
    icon: '⚙️',
    angleStart: -90, // Equivalent to 270 degrees
    angleEnd: -30,
    labelXOffset: -120, // Adjusted to match image
    labelYOffset: 0, // Adjusted to match image
    textAlign: 'left',
  },
  {
    id: 'esg',
    title: 'ESG',
    description: 'Evaluate the impact on the environment and society and governance',
    color: '#EF5350', // Red (bottom-left in original image)
    icon: '🔍',
    angleStart: 210,
    angleEnd: 270,
    labelXOffset: -25, // Adjusted to match image
    labelYOffset: 180, // Adjusted to match image
    textAlign: 'right', // Keep right based on image's visual spacing
  },
  {
    id: 'scenario',
    title: 'Scenerio Analysis',
    description: 'Examine & evaluate possible events/scenarios.',
    color: '#FFD54F', // Yellow (mid-left in original image)
    icon: '💡',
    angleStart: 150,
    angleEnd: 210,
    labelXOffset: 210, // Adjusted to match image
    labelYOffset: 290, // Adjusted to match image
    textAlign: 'right',
  },
  {
    id: 'forecast',
    title: 'FORECAST',
    description: 'Accurate financial forecast with machine learning',
    color: '#CE93D8', // Light Purple (top-left in original image)
    icon: '🚀',
    angleStart: 90,
    angleEnd: 150,
    labelXOffset: 400, // Adjusted to match image
    labelYOffset: 180, // Adjusted to match image
    textAlign: 'right',
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


const SixPhaseInfographic: React.FC = () => {
  const svgSize = 400; // SVG canvas size
  const center = svgSize / 2;
  const outerRadius = svgSize / 2 - 20; // Radius of the pie segments
  const iconRadius = outerRadius * 0.65; // Radius for icon positioning
  const pullDistance = 15; // How much the segment "pulls in"

  const [activePhaseId, setActivePhaseId] = useState<string | null>(null); // State to hold the active phase ID

  // CSS directly in the component
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      position: 'relative',
      width: '100%',
      maxWidth: '700px', // Max width for the whole component including text
      margin: '20px auto',
      fontFamily: 'Arial, sans-serif',
      display: 'flex', // Use flexbox for centering
      flexDirection: 'column',
      alignItems: 'center', // Center content horizontally
    },
    svgContainer: {
      position: 'relative',
      width: `${svgSize}px`,
      height: `${svgSize}px`,
      margin: '0 auto',
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
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      lineHeight: 1,
    },
    centralTextSmall: {
      fontSize: '12px',
      color: '#555',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginTop: '4px',
    },
    phaseLabel: { // Base style for all labels (titles)
      position: 'absolute',
      width: '150px', // Adjust as needed to fit the text
      zIndex: 5,
    },
    phaseTitle: {
      fontSize: '14px', // Slightly smaller for better fit
      fontWeight: 'bold',
      marginBottom: '4px',
      cursor: 'pointer', // Make title clickable
    },
    phaseDescription: {
      fontSize: '11px',
      color: '#666',
      lineHeight: 1.3,
      transition: 'opacity 0.3s ease-in-out, max-height 0.3s ease-in-out', // Smooth transition for visibility
      maxHeight: '0px', // Start hidden
      overflow: 'hidden',
      opacity: 0,
    },
    phaseDescriptionActive: { // Style for active description
      maxHeight: '100px', // Enough height to show content
      opacity: 1,
    }
  };

  const getLabelStyle = (phase: Phase): React.CSSProperties => {
    const baseStyle = { ...styles.phaseLabel };

    // Calculate position based on offsets relative to the SVG center
    const labelX = center + phase.labelXOffset;
    const labelY = center + phase.labelYOffset;

    baseStyle.left = `${labelX}px`;
    baseStyle.top = `${labelY}px`;

    // Adjust transform based on textAlign
    if (phase.textAlign === 'right') {
      baseStyle.transform = 'translate(-100%, -50%)'; // Move left by 100% of its width
    } else if (phase.textAlign === 'center') {
      baseStyle.transform = 'translate(-50%, -50%)';
    } else { // left
      baseStyle.transform = 'translate(0%, -50%)'; // No horizontal transform for left
    }

    baseStyle.textAlign = phase.textAlign;

    return baseStyle;
  };


  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', marginTop: '3px', color: 'rgb(204, 145, 19)' }}>
        Financial Planning & Analysis
      </h1>
      <div style={styles.svgContainer}>
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          {/* Define filter for shadow effect */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="3" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
            </filter>
          </defs>

          {phasesData.map((phase) => {
            const midAngle = (phase.angleStart + phase.angleEnd) / 2;
            const iconPos = polarToCartesian(center, center, iconRadius, midAngle);

            // Calculate translation for active phase
            let transform = '';
            let filter = '';
            if (activePhaseId === phase.id) {
              const translateAngle = ((midAngle - 90) * Math.PI) / 180.0;
              const translateX = -pullDistance * Math.cos(translateAngle);
              const translateY = -pullDistance * Math.sin(translateAngle);
              transform = `translate(${translateX}, ${translateY})`;
              filter = 'url(#shadow)';
            }

            return (
              <g
                key={phase.id}
                onClick={() => setActivePhaseId(activePhaseId === phase.id ? null : phase.id)}
                style={{ cursor: 'pointer', transition: 'transform 0.3s ease-out, filter 0.3s ease-out' }}
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
                  style={{ pointerEvents: 'none' }} // Prevent text from interfering with segment click
                >
                  {phase.icon}
                </text>
              </g>
            );
          })}
        </svg>
        <div
          style={styles.centralCircle}
          onClick={() => setActivePhaseId(null)}
        >
          <span style={styles.centralTextLarge}>FP&A</span>
        </div>
      </div>

      {phasesData.map((phase) => (
        <div key={`${phase.id}-label`} style={getLabelStyle(phase)}>
          {/* Make the title clickable to activate the phase */}
          <div
            style={{ ...styles.phaseTitle, color: phase.color }}
            onClick={() => setActivePhaseId(activePhaseId === phase.id ? null : phase.id)}
          >
            {phase.title}
          </div>
          <div
            style={{
              ...styles.phaseDescription,
              ...(activePhaseId === phase.id ? styles.phaseDescriptionActive : {}),
            }}
          >
            {phase.description}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SixPhaseInfographic;