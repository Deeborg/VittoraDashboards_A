import React, { useState, useEffect, useMemo } from 'react';
import chroma from 'chroma-js';

// --- Colors (Adjusted to match the new image and style) ---
const pageColors = {
  blue: '#2BACE2',         // As per image
  green: '#3CB878',        // As per image
  yellow: '#FABB18',       // As per image
  orange: '#F1673A',       // As per image
  red: '#E63946',          // As per image
  lightPurple: '#A076D6',  // As per image
  teal: '#48C9B0',         // As per image
  mediumGray: '#808B96',   // As per image
  white: '#FFFFFF',
  textBlack: '#333333',
  textLight: '#555555',    // For labels
  background: '#F8F9FA',   // Light gray background as in image
  titleBlue: '#0E87BB',    // Specific blue for the title
  scrollTopButton: '#007BFF',// Blue for scroll to top button
  scrollTopButtonHover: '#0056b3',
};

// --- Benefit Data ---
interface Benefit {
  id: string;
  text: string;
  color: string;
}

const benefitsData: Benefit[] = [
  { id: "01", text: "Cash & Payments", color: pageColors.blue },
  { id: "02", text: "Banking", color: pageColors.green },
  { id: "03", text: "Forecasting & Liquidity", color: pageColors.yellow },
  { id: "04", text: "Investments", color: pageColors.orange },
  { id: "05", text: "Borrowings", color: pageColors.red },
  { id: "06", text: "Hedging", color: pageColors.lightPurple },
  { id: "07", text: "Risk & Compliance", color: pageColors.teal },
  { id: "08", text: "Financial Reporting", color: pageColors.mediumGray },
];

// --- Component for a single 3D block element ---
interface BlockElementProps {
  color: string;
  number?: string;
  top: number;
  zIndexValue: number;
  itemHeight: number;
  itemWidth: number;
  perspectiveOffset: number;
  isHovered?: boolean; // For hover effect
}

const BlockElement: React.FC<BlockElementProps> = ({
  color,
  number,
  top,
  zIndexValue,
  itemHeight,
  itemWidth,
  perspectiveOffset,
  isHovered,
}) => {
  const mainFaceStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    left: 0,
    width: `${itemWidth}px`,
    height: `${itemHeight}px`,
    backgroundColor: color,
    zIndex: zIndexValue * 2,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
    // boxShadow: isHovered ? '0px 4px 12px rgba(0,0,0,0.15)' : 'none', // Optional shadow on hover
  };

  const sideFaceStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${top + perspectiveOffset / 4.5}px`, // Adjusted for visual alignment based on image
    left: `${itemWidth}px`,
    width: `${perspectiveOffset}px`,
    height: `${itemHeight}px`,
    backgroundColor: chroma(color).darken(0.35).hex(), // Slightly less darkening
    transform: `skewY(-30deg) ${isHovered ? 'scaleY(1.03)' : 'scaleY(1)'}`, // Combine skew and scale
    transformOrigin: 'top left',
    zIndex: zIndexValue * 2 - 1,
    transition: 'transform 0.2s ease-out',
  };

  const numberStyle: React.CSSProperties = {
    color: color === pageColors.white ? pageColors.textBlack : pageColors.white,
    fontSize: '25px', // Adjusted size
    fontWeight: 'bold',
    marginLeft: '15px', // Adjusted margin
  };

  return (
    <>
      <div style={mainFaceStyle}>
        {number && <span style={numberStyle}>{number}</span>}
      </div>
      <div style={sideFaceStyle}></div>
    </>
  );
};

// --- ScrollToTopButton Component ---
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // useEffect(() => {
  //   window.addEventListener('scroll', toggleVisibility);
  //   return () => {
  //     window.removeEventListener('scroll', toggleVisibility);
  //   };
  // }, []);

  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    backgroundColor: isHovered ? pageColors.scrollTopButtonHover : pageColors.scrollTopButton,
    color: pageColors.white,
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out, background-color 0.2s ease',
    boxShadow: '0px 2px 10px rgba(0,0,0,0.2)',
    zIndex: 1000,
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Scroll to top"
    >
      {/* Simple SVG Arrow */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  );
};


// --- Main Page Component ---
const AuTmDetails: React.FC = () => {
  // Adjusted dimensions to better match the new image
  const itemHeight = 38;
  const itemWidth = 180;
  const perspectiveOffset = 18;
  const textBlockGap = 20;

  const totalItemsInStack = benefitsData.length * 2 + 1;

  // For hover effect, track which item is hovered
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{
      backgroundColor: pageColors.background,
      padding: '0px 80px 80px 20px', // Added more padding at the bottom for "downside gap"
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", // Modern font stack
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      overflowX: 'hidden', // Prevent horizontal scrollbar if elements slightly exceed width on scale
    }}>
      <h1 style={{
        color: pageColors.titleBlue,
        fontSize: '26px', // Adjusted size
        fontWeight: 'bold', // Semi-bold
        marginTop:'0px',
        marginBottom: '20px', // More space below title
        textAlign: 'center',
      }}>
        Autonomous Treasury Management
      </h1>

      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        // marginBottom is handled by main div's paddingBottom
      }}>
        {/* Stack of blocks and text labels */}
        <div style={{ position: 'relative' }}>
          {/* Topmost white block */}
          <BlockElement
            color={pageColors.white}
            top={0}
            zIndexValue={totalItemsInStack}
            itemHeight={itemHeight}
            itemWidth={itemWidth}
            perspectiveOffset={perspectiveOffset}
          />

          {benefitsData.map((benefit, index) => {
            const baseTopColored = (index * 2 + 1) * itemHeight;
            const baseTopWhite = (index * 2 + 2) * itemHeight;
            const zIndexColored = totalItemsInStack - (index * 2 + 1);
            const zIndexWhite = totalItemsInStack - (index * 2 + 2);

            return (
              <div
                key={benefit.id}
                onMouseEnter={() => setHoveredId(benefit.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer' }} // Indicate interactivity
              >
                <BlockElement
                  color={benefit.color}
                  number={benefit.id}
                  top={baseTopColored}
                  zIndexValue={zIndexColored}
                  itemHeight={itemHeight}
                  itemWidth={itemWidth}
                  perspectiveOffset={perspectiveOffset}
                  isHovered={hoveredId === benefit.id}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: `${baseTopColored}px`,
                    left: `${itemWidth + perspectiveOffset + textBlockGap}px`,
                    height: `${itemHeight}px`,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '20px', // Adjusted size
                    color: pageColors.textLight,
                    fontWeight: hoveredId === benefit.id ? 600 : 400,
                    transform: hoveredId === benefit.id ? 'translateX(3px)' : 'translateX(0px)',
                    transition: 'font-weight 0.2s ease-out, color 0.2s ease-out, transform 0.2s ease-out',
                    whiteSpace: 'nowrap',
                    zIndex: zIndexColored * 2 + 1, // Ensure text is above its block
                  }}
                >
                  {benefit.text}
                </div>
                {/* Separator white block (not part of hover interaction for a specific benefit) */}
                <BlockElement
                  color={pageColors.white}
                  top={baseTopWhite}
                  zIndexValue={zIndexWhite}
                  itemHeight={itemHeight}
                  itemWidth={itemWidth}
                  perspectiveOffset={perspectiveOffset}
                />
              </div>
            );
          })}
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default AuTmDetails;