import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Phase {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  angleStart: number;
  angleEnd: number;
  labelXOffset: number;
  labelYOffset: number;
  textAlign: 'left' | 'right' | 'center';
  route: string;
}

const phasesData: Phase[] = [
  {
    id: 'roi',
    title: 'ROI',
    description: 'Get insights on ROI on various strategic initiatives',
    color: ' #74B9F4',
    icon: '👥',
    angleStart: 150,
    angleEnd: 210,
    labelXOffset: 75,
    labelYOffset: 230,
    textAlign: 'left',
    route: '/roi',
  },
  {
    id: 'scenario',
    title: 'Scenerio Analysis',
    description: 'Examine & evaluate possible events/scenarios.',
    color: '#ADE68A',
    icon: '💡',
    angleStart: -30,
    angleEnd: 30,
    labelXOffset: 35,
    labelYOffset: -225,
    textAlign: 'left',
    route: '/scenario',
  },
  {
    id: 'sentiment',
    title: 'Sentiment Analysis',
    description: 'Evaluate the overall attitude of public on the company',
    color: '#FFD9A1',
    icon: '🎯',
    angleStart: 30,
    angleEnd: 90,
    labelXOffset: 275,
    labelYOffset: -115,
    textAlign: 'left',
    route: '/sentiment',
  },
  {
    id: 'flux',
    title: 'Flux Analysis',
    description: 'GL Analysis & Fluctuation analysis of GL & Risk Magnitude',
    color: '#F3C1D4',
    icon: '⚙️',
    angleStart: -90,
    angleEnd: -30,
    labelXOffset: -220,
    labelYOffset: -100,
    textAlign: 'left',
    route: '/flux',
  },
  {
    id: 'esg',
    title: 'ESG',
    description: 'Evaluate the impact on the environment and society and governance',
    color: '#E64E99',
    icon: '🔍',
    angleStart: 210,
    angleEnd: 270,
    labelXOffset: -220,
    labelYOffset: 110,
    textAlign: 'left',
    route: '/esg',
  },
  {
    id: 'forecast',
    title: 'Forecast',
    description: 'Accurate financial forecast with machine learning',
    color: '#DFA569',
    icon: '🚀',
    angleStart: 90,
    angleEnd: 150,
    labelXOffset: 280,
    labelYOffset: 100,
    textAlign: 'left',
    route: '/forecast',
  },
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

  const d = [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');

  return d;
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

  const handleShowMessage = () => setShowMessage(true);
  const handleCloseMessage = () => setShowMessage(false);

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
      transition: 'transform 0.3s',
    },
    centralTextLarge: {
      fontSize: '45px',
      fontWeight: 'bold',
      color: '#2D3748',
      lineHeight: 1,
      fontFamily: "'Inter', sans-serif",
    },
    centralTextSmall: {
      fontSize: '30px',
      color: '#555',
      marginTop: '4px',
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

  const getPhaseBoxStyle = (phase: Phase): React.CSSProperties => ({
    background: isPhaseActive(phase.id) ? '#fff' : 'transparent',
    borderRadius: '16px',
    boxShadow: isPhaseActive(phase.id) ? '0 8px 24px rgba(0, 0, 0, 0.2)' : 'none',
    padding: '12px 14px',
    transition: 'all 0.3s ease',
    border: isPhaseActive(phase.id) ? `1px solid ${phase.color}` : 'none',
    minWidth: '150px',
    transform: isPhaseActive(phase.id) ? 'scale(1.02)' : 'scale(1)',
    backdropFilter: isPhaseActive(phase.id) ? 'blur(3px)' : 'none',
  });

  return (
    <div style={styles.container}>
      <div style={styles.svgContainer}>
        <svg width={svgSize} height={svgSize}>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="3" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
            </filter>
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
                style={{ cursor: 'pointer', transition: 'transform 0.3s ease-out, filter 0.3s ease-out' }}
                transform={transform}
                filter={filter}
                // onMouseEnter={() => setActivePhaseId(phase.id)}
              >
                <path d={describeArc(center, center, outerRadius, phase.angleStart, phase.angleEnd)} fill={phase.color} />
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
          <div style={getPhaseBoxStyle(phase)} onClick={() => navigate(phase.route)}>
            <div style={{ ...styles.phaseTitle, color: phase.color }}>
              {phase.title}
            </div>
            <div style={{
              ...styles.phaseDescription,
              ...(isPhaseActive(phase.id) ? styles.phaseDescriptionActive : {}),
            }}>
              {phase.description}
            </div>
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
