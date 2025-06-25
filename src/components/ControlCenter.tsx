import React, { useState } from 'react';

// An interface to define the shape of the slider values
export interface SliderValues {
  priceChange: number;
  cpi: number;
  exchangeRate: number;
  importMerch: number;
  gdp: number;
  unemployment: number;
  exportMerch: number;
  forexReserve: number;
  retailSales: number;
  stockMarket: number;
  indProd: number;
}

interface ControlCenterProps {
  initialValues: SliderValues;
  onSimulate: (values: SliderValues) => void;
}

const ControlCenter: React.FC<ControlCenterProps> = ({ initialValues, onSimulate }) => {
  // This state is now fully contained within this lightweight component.
  // It updates instantly on slide, causing only this component to re-render.
  const [priceChange, setPriceChange] = useState(initialValues.priceChange);
  const [cpi, setCpi] = useState(initialValues.cpi);
  const [exchangeRate, setExchangeRate] = useState(initialValues.exchangeRate);
  const [importMerch, setImportMerch] = useState(initialValues.importMerch);
  const [gdp, setGdp] = useState(initialValues.gdp);
  const [unemployment, setUnemployment] = useState(initialValues.unemployment);
  const [exportMerch, setExportMerch] = useState(initialValues.exportMerch);
  const [forexReserve, setForexReserve] = useState(initialValues.forexReserve);
  const [retailSales, setRetailSales] = useState(initialValues.retailSales);
  const [stockMarket, setStockMarket] = useState(initialValues.stockMarket);
  const [indProd, setIndProd] = useState(initialValues.indProd);

  const handleSimulateClick = () => {
    // When the button is clicked, pass all the current slider values up to the parent dashboard.
    onSimulate({
      priceChange,
      cpi,
      exchangeRate,
      importMerch,
      gdp,
      unemployment,
      exportMerch,
      forexReserve,
      retailSales,
      stockMarket,
      indProd,
    });
  };

  const handleResetClick = () => {
    setPriceChange(0);
    setCpi(0);
    setExchangeRate(0);
    setImportMerch(0);
    setGdp(0);
    setUnemployment(0);
    setExportMerch(0);
    setForexReserve(0);
    setRetailSales(0);
    setStockMarket(0);
    setIndProd(0);

    onSimulate({
      priceChange,
      cpi,
      exchangeRate,
      importMerch,
      gdp,
      unemployment,
      exportMerch,
      forexReserve,
      retailSales,
      stockMarket,
      indProd,
    });
    
  };
  // This render function is cheap and fast.
  const renderSlider = (
  label: string,
  value: number,
  setValue: React.Dispatch<React.SetStateAction<number>>
) => {
  const min = -20;
  const max = 20;
  const percentage = ((value - min) / (max - min)) * 100;

  // Calculate gradient based on direction
  const bg = value < 0
    ? `linear-gradient(to left, red ${Math.abs(percentage - 50)}%, #ccc 0%)`
    : `linear-gradient(to right, green ${Math.abs(percentage - 50)}%, #ccc 0%)`;

  return (
    <div className="slider-senario" style={{ position: 'relative', marginBottom: '20px' }}>
      <label>{label}</label>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="range"
          min={-20}
          max={20}
          value={value}
          step={1}
          onChange={(e) => setValue(Number(e.target.value))}
          className="centered-zero-slider"
          style={{ background: bg, width: '100%' }}
        />       
      </div>
      <input
        type="number"
        min={-20}
        max={20}
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          if (newValue >= -20 && newValue <= 20) setValue(newValue);
        }}
        style={{ width: '100%', marginTop: '5px' }}
      />
    </div>
  );
};


  return (
    <div className="Slider-container-senario">
      <div className="Sliders-senario">
        <h3>Control Center</h3>
        <div className="Sliders1-senario">
          {renderSlider('Price Changes %', priceChange, setPriceChange)}
          {renderSlider('CPI %', cpi, setCpi)}
          {renderSlider('Exchange Rate %', exchangeRate, setExchangeRate)}
          {renderSlider('Import Merch %', importMerch, setImportMerch)}
          {renderSlider('GDP %', gdp, setGdp)}
          {renderSlider('Unemployment Rate %', unemployment, setUnemployment)}
          {renderSlider('Export Merch %', exportMerch, setExportMerch)}
          {renderSlider('Forex Reserve %', forexReserve, setForexReserve)}
          {renderSlider('Retail Sale %', retailSales, setRetailSales)}
          {renderSlider('Stock Market %', stockMarket, setStockMarket)}
          {renderSlider('Industrial Production %', indProd, setIndProd)}
        </div>
        <div className="simulate-button-container" style={{ display: 'flex', gap: '10px' }}>
          
          <button className="simulate-button" onClick={handleResetClick}>
            Reset to Zero
          </button>
          <button className="simulate-button" onClick={handleSimulateClick}>
            Run Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlCenter;