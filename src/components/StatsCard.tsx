import React from "react";
import "../Style/StatsCard.css"
import AreaChart from "./AreaChart"

interface KPIProps {
  data: Record<string, any>[]; 
  graphdata: Record<string, any>[]; 
  type: "liquidity" | "workingcapital";

}

const StatsCards: React.FC<KPIProps> = ({ data, graphdata, type }) => {
  if (data.length === 0) {
    return <p>No data available for KPIs.</p>;
  }

  // Calculate unique counts and totals dynamically


  function formatAmount(amount: number): string {
    if (Math.abs(amount) >= 1e9) {
      return `${(amount / 1e9).toFixed(0)} B`; // Billion
    } else if (Math.abs(amount) >= 1e6) {
      return `${(amount / 1e6).toFixed(0)} M`; // Million
    } else if (Math.abs(amount) >= 1e3) {
      return `${(amount / 1e3).toFixed(0)} K`; // Thousand
    } else if (Math.abs(amount) < 1 && amount !== 0) {
      return amount.toFixed(2); // Show up to 2 decimal places for small non-zero values
    } else {
      return Number(amount.toFixed(2)).toString(); // For values < 1000 but >= 1
    }
  }
  // Check if data contains liquidity-related columns
  
  // const hasLiquidityData = ["Total liquidity", "Quick ratio", "CCC", "Cash And Cash Equivalents", "Current ratio "]
  // .every(key => key in data[0]);

  const getLatestValue = (key: string): number | null => {
    if (data.length > 0 && data[0] && data[0][key] !== undefined) {
      return Number(data[0][key]);
    }
    return null;
  };

  const renderStatCard = (title: string, yKey: string, color: string, format?: (value: number) => string | number) => {
    const latestValue = getLatestValue(yKey);
    const formattedValue = latestValue !== null ? (format ? format(latestValue) : latestValue) : "N/A";

    return (
      <div className="stats-card">
        <h4>{title}</h4>
        <div className="area-chart-background">
          <AreaChart
            data={graphdata.map((row) => ({
              category: row["Fiscal Year"],
              value: Number(row[yKey]),
            }))}
            xKey="category"
            yKey="value"
            areacolor={color}
          />
        </div>
        <p className="kpi-value-center">{formattedValue}</p>
      </div>
    );
  };


  if (type === "liquidity") {
    // Display Liquidity KPIs
    const kpi6 = Math.round(data.reduce((sum, row) => sum + (row["Total liquidity"] || 0), 0 ));
    const kpi7 = (data.reduce((sum, row) => sum + (row["Quick ratio"] || 0), 0 ));
    const kpi8 = Math.round(data.reduce((sum, row) => sum + (row["Cash And Cash Equivalents"] || 0), 0 ));
    const kpi9 = parseFloat(data.reduce((sum, row) => sum + (row["Current ratio"] ?? row["Current ratio "] ?? 0), 0).toFixed(2));
    const kpi0 = Math.round(data.reduce((sum, row) => sum + (row["CCC"] || 0), 0 ));
    const kpi11 = parseFloat(data.reduce((sum, row) => sum + (row["ROCE"] || 0), 0).toFixed(2));

    return (
        <div className="stats-cards">
            <div className="stats-card">
              <div className="area-chart-background">
                <h4>Cash in Bank</h4>
                <AreaChart  data={graphdata.map((row) => ({category: row["Fiscal Year"],
                value: Number(row["Cash And Cash Equivalents"]),}))}  
                xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
                <p className="kpi-value-center">{formatAmount(kpi8)}</p>
              </div>
            </div>

            <div className="stats-card">
              <div className="area-chart-background">
                <h4>Total Liquidity</h4>
                <AreaChart  data={graphdata.map((row) => ({category: row["Fiscal Year"],
                value: Number(row["Total liquidity"]),}))}  
                xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
                <p className="kpi-value-center">{formatAmount(kpi6)}</p>
              </div>
            </div>

            <div className="stats-card">
              <div className="area-chart-background">
                <h4>ROCE</h4>
                <AreaChart  data={graphdata.map((row) => ({category: row["Fiscal Year"],
                value: Number(row["ROCE"]),}))}  
                xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
                <p className="kpi-value-center">{formatAmount(kpi11)}</p>
              </div>
            </div>

            <div className="stats-card">
              <div className="area-chart-background">
                <h4>Quick Ratio</h4>
                <AreaChart  data={graphdata.map((row) => ({category: row["Fiscal Year"],
                value: Number(row["Quick ratio"]),}))}  
                xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
                <p className="kpi-value-center">{kpi7.toFixed(2)}</p>
              </div>
            </div>
            <div className="stats-card">
              <div className="area-chart-background">
                <h4>Current Asset Ratio</h4>
                <AreaChart  data={graphdata.map((row) => ({category: row["Fiscal Year"],
                value: Number(row["Current ratio "]),}))}  
                xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
                <p className="kpi-value-center">{kpi9}</p>
              </div>
            </div>

            <div className="stats-card">
              <div className="area-chart-background">
                <h4>Cash Conversion Cycle</h4>
                <AreaChart  data={graphdata.map((row) => ({category: row["Fiscal Year"],
                value: Number(row["CCC"]),}))}  
                xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
                <p className="kpi-value-center">{kpi0}</p>
              </div>  
            </div>
        </div>
    );
  }
  else {
    const kpi1 = Math.round(data.reduce((sum, row) => sum + (row["Working capital"] || 0), 0 ));
    const kpi2 = Math.round(data.reduce((sum, row) => sum + (row["DPO"] || 0), 0 ));
    const kpi3 = Math.round(data.reduce((sum, row) => sum + (row["DSO"] || 0), 0 ));
    const kpi4 = Math.round(data.reduce((sum, row) => sum + (row["DIO"] || 0), 0 ));
    const kpi5 = Math.round(data.reduce((sum, row) => sum + (row["CCC"] || 0), 0 ));
    return (
    <div >
      <div className="stats-cards">
        <div className="stats-card">
          <div className="area-chart-background">
            <h4>Net Working Capital</h4>
            <AreaChart  data={graphdata.map((row) => ({category: row["Fiscal Year"],
            value: Number(row["Working capital"]),
            }))}  xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
            <p className="kpi-value-center">{formatAmount(kpi1)}</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="area-chart-background">
          {/* <h4>Days Payables Outstanding</h4>
          <p>{formatAmount(kpi2)}</p>
        </div> 
        <div className="stats-card">
          <h4>Days Sales Outstanding</h4>
          <p>{formatAmount(kpi3)}</p>   
        </div>
        <div className="stats-card">  
          <h4>Days Inventory Outstanding</h4>
          <p>{formatAmount(kpi4)}</p>
        </div>
        <div className="stats-card">
          <h4>Cash Conversion Cycle</h4>
          <p>{formatAmount(kpi5)}</p>
        </div> */}
        
            <h4>Days Payables Outstanding</h4>
            <AreaChart  data={graphdata.map((row) => ({    category: row["Fiscal Year"],  
            value: Number(row["DPO"]), 
            }))}  xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
            <p className="kpi-value-center">{kpi2}</p>
          </div>
        </div>

        <div className="stats-card">
          <div className="area-chart-background">
            <h4>Days Sales Outsanding</h4>
            <AreaChart  data={graphdata.map((row) => ({    category: row["Fiscal Year"],  
            value: Number(row["DSO"]), 
            }))}  xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
            <p className="kpi-value-center">{kpi3}</p>
          </div>
        </div>

        <div className="stats-card">
          <div className="area-chart-background">
            <h4>Days Inventory Outsanding</h4>
            <AreaChart  data={graphdata.map((row) => ({    category: row["Fiscal Year"],  
            value: Number(row["DIO"]), 
            }))}  xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
            <p className="kpi-value-center">{kpi4}</p>
          </div>
        </div>

        <div className="stats-card">
          <div className="area-chart-background">
            <h4>Cash Conversion Cycle</h4>
            <AreaChart  data={graphdata.map((row) => ({    category: row["Fiscal Year"],  
            value: Number(row["CCC"]), 
            }))}  xKey="category" yKey="value" areacolor="rgba(164, 190, 218, 0.6)" />
            <p className="kpi-value-center">{kpi5}</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};
  }
export default StatsCards;
