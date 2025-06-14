import React, { useState } from 'react';
import styles from './SupplyChainProcess.module.css';

// Define the structure for each step's data
interface StepData {
  id: number;
  title: string;
  items: string[];
  color: string;
  textColorInCircle: string;
  position: 'top' | 'bottom';
}

// Data extracted from the image
const stepsData: StepData[] = [
  {
    id: 1,
    title: 'Demand Forecasting',
    items: ['Demand Prediction', 'Scenario Analysis', 'Sentiment Analysis'],
    color: '#8A63D2',
    textColorInCircle: '#8A63D2',
    position: 'top',
  },
  {
    id: 2,
    title: 'Production Planning',
    items: ['Capacity Optimization', 'Bottleneck Analysis', 'Manufacturing Cycle Analysis'],
    color: '#0095DA',
    textColorInCircle: '#0095DA',
    position: 'bottom',
  },
  {
    id: 3,
    title: 'Procurement Planning',
    items: ['Lead Time Analysis', 'Cost Optimization', 'Supplier Performance'],
    color: '#0095DA',
    textColorInCircle: '#0095DA',
    position: 'top',
  },
  {
    id: 4,
    title: 'Inventory Management',
    items: ['Stock Optimization', 'Auto Replenishment', 'Stockout Risk Analytics'],
    color: '#00A98F',
    textColorInCircle: '#00A98F',
    position: 'bottom',
  },
  {
    id: 5,
    title: 'Finance',
    items: ['Cash Flow Forecast', 'Budget Allocation', 'Credit Optimization'],
    color: '#84C441',
    textColorInCircle: '#84C441',
    position: 'top',
  },
];

const SupplyChainProcess: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const handleMouseEnter = (id: number) => {
    setActiveStep(id);
  };

  const handleMouseLeave = () => {
    setActiveStep(null);
  };

  const handleStepClick = () => {
    setShowMessage(true);
  };

  const handleCloseMessage = () => {
    setShowMessage(false);
  };

  return (
    <div className={styles.container}>
      <p style={{ color: '#2d3a4a', marginBottom: '104px' }}>
        Delve into the full spectrum of supply chain management — from forecasting demand to optimizing financial performance.
      </p>
      <div className={styles.timeline} onMouseLeave={handleMouseLeave}>
        {stepsData.map((step) => (
          <div
            key={step.id}
            className={`${styles.stepNode} ${
              activeStep !== null && activeStep !== step.id ? styles.inactive : ''
            }`}
            onMouseEnter={() => handleMouseEnter(step.id)}
            onClick={handleStepClick}
            style={{ '--step-color': step.color } as React.CSSProperties}
            tabIndex={0}
            role="button"
            aria-label={`Step: ${step.title}`}
          >
            {/* Info Bubble */}
            <div
              className={`${styles.infoBubble} ${
                step.position === 'top' ? styles.bubbleTop : styles.bubbleBottom
              }`}
            >
              <h4 className={styles.bubbleTitle}>{step.title}</h4>
              <ul className={styles.bubbleList}>
                {step.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Timeline Arrow and Circle */}
            <div className={styles.timelineArrow}>
              <div
                className={styles.timelineCircle}
                style={{
                  borderColor: step.color,
                  color: step.textColorInCircle,
                }}
              >
                {step.id}
              </div>
            </div>
          </div>
        ))}
      </div>
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

export default SupplyChainProcess;