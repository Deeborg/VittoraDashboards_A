import React from 'react';

interface DateFilterProps {
  minDate: Date | null;
  maxDate: Date | null;
  dateRange: [Date, Date];
  sliderRange: [number, number];
  handleSliderChange: (range: [number, number]) => void;
  formatDate: (date: Date) => string;
}

const DateFilter: React.FC<DateFilterProps> = ({
  minDate,
  maxDate,
  dateRange,
  sliderRange,
  handleSliderChange,
  formatDate
}) => {
  if (!minDate || !maxDate) return null;

  return (
    <div style={styles.container}>
        <h1 style={{ color: 'black', textAlign: 'center',fontSize:'16px' }}>Date </h1>
      <div style={styles.label}>
        {formatDate(dateRange[0])} &nbsp;–&nbsp; {formatDate(dateRange[1])}
      </div>

      <div style={styles.sliderWrapper}>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderRange[0]}
          onChange={(e) =>
            handleSliderChange([Number(e.target.value), sliderRange[1]])
          }
          style={{ ...styles.slider, zIndex: 3 }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={sliderRange[1]}
          onChange={(e) =>
            handleSliderChange([sliderRange[0], Number(e.target.value)])
          }
          style={{ ...styles.slider, zIndex: 2 }}
        />

        <div style={styles.track}>
          <div
            style={{
              ...styles.range,
              left: `${sliderRange[0]}%`,
              width: `${sliderRange[1] - sliderRange[0]}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: 'rgb(255, 255, 255)',
    padding: '16px',
    borderRadius: '10px',
    // boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    margin: '20px 0',
    // color: '#fff',
    fontFamily: 'Segoe UI, sans-serif',
    cursor: 'pointer',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '12px',
    textAlign: 'center',
    color: 'black',
  },
  sliderWrapper: {
    position: 'relative',
    height: '36px',
  },
  slider: {
    position: 'absolute',
    width: '100%',
    height: '8px',
    background: 'transparent',
    pointerEvents: 'none',
    appearance: 'none',
  },
  track: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '100%',
    height: '6px',
    backgroundColor: ' #444',
    borderRadius: '5px',
    zIndex: 1,
  },
  range: {
    position: 'absolute',
    height: '6px',
    backgroundColor: ' #00aaff',
    borderRadius: '5px',
    top: 0,
  }
};

// Thumb styles using global CSS overrides
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  background-color: #00aaff;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 0 5px rgba(0, 170, 255, 0.7);
}
input[type="range"]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  background-color: #00aaff;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 0 5px rgba(0, 170, 255, 0.7);
}
input[type="range"]::-webkit-slider-thumb:hover,
input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.2);
}
`;
document.head.appendChild(styleSheet);

export default DateFilter;
