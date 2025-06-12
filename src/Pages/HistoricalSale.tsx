import React, { useEffect, useState } from "react";
import DateRangeSlider from "../components/DateFilterSenario";
import "../Style/Chart1Synario.css"
interface DataProps {
  data1: Record<string, any>[];
  startDate: Date;
  endDate: Date;
}

const HistoricalSale: React.FC<DataProps> = ({ data1, startDate, endDate }) => {
  const [dateRange, setDateRange] = useState<[number, number] | null>(null);
  const [filteredData, setFilteredData] = useState<Array<Record<string, any>>>([]);

  // Set initial date range when startDate or endDate changes
  useEffect(() => {
    if (startDate && endDate) {
      setDateRange([startDate.getTime(), endDate.getTime()]);
    }
  }, [startDate, endDate]);

  // Filter data based on date range
  useEffect(() => {
    if (!dateRange) return;
    const [rangeStart, rangeEnd] = dateRange;

    const filtered = data1.filter((row) => {
      const rowDate = row["Date"];
      if (!(rowDate instanceof Date)) return false;
      const time = rowDate.getTime();
      return time >= rangeStart && time <= rangeEnd;
    });

    setFilteredData(filtered);
  }, [dateRange, data1]);

  const kpi1 = filteredData.reduce((sum, row) => sum + (row["Sales Value"] || 0), 0);
  const kpi2 = filteredData.reduce((sum, row) => sum + (row["GrossProfit"] || 0), 0);

  function formatAmount(amount: number): string {
    if (Math.abs(amount) >= 1e9) return `${(amount / 1e9).toFixed(2)} B`;
    if (Math.abs(amount) >= 1e6) return `${(amount / 1e6).toFixed(2)} M`;
    if (Math.abs(amount) >= 1e3) return `${(amount / 1e3).toFixed(2)} K`;
    return `${amount.toFixed(0)}`;
  }

  return (
    <div>
      <h2>Historical Sales</h2>
      <div className="Date-Filter-senario">
      <div className="Date-Filter1-senario">
        {dateRange && (
          <DateRangeSlider
            heading=""
            startDate={startDate}
            endDate={endDate}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        )}
      </div>
      </div>
      
        <div className="stats-cards-senario">
          <div className="stats-card-senario hs">
          
          <h2>{formatAmount(kpi1)}</h2>
          <h4>Historical Sales Value</h4>
          </div>
          <div className="stats-card-senario hs">
          
          <h2>{formatAmount(kpi2)}</h2>
          <h4>Historical Gross Profit</h4>
          </div>
        </div>
      
    </div>
  );
};

export default HistoricalSale;
