import React, { useState, useEffect, useCallback } from "react";
import "../Style/Chart1Synario.css";
import * as XLSX from "xlsx";
import HistoricalSale from "./HistoricalSale";
import FilterComponent from "../components/FiltersSenario";
import ForcastSimulate from "./ForcastSimulate";
import DateRangeSlider from "../components/DateFilterSenario";
import AmMultiAreaChart1 from "../components/AreaChartMultiSenario";
import HorizontalBarChartSlid from "../components/BarChartHoriSlidSenario";
import WorldBubbleMapChart from "../components/WorldMapSenario";
import TableComponent from "../components/TableSenario";
import LoadingMobiusStrip from '../components/LoadingMobiusStrip';
// Import the new component and its type
import ControlCenter, { SliderValues } from '../components/ControlCenter';

const DashBoard1: React.FC = () => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<Array<Record<string, any>>>([]);
  const [DateFiltered, setFilteredDate] = useState<Array<Record<string, any>>>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<[number, number] | null>(null);
  const [countrysummary, setCountrySummary] = useState<Array<Record<string, any>>>([]);
  const [Materialsummary, setMaterialSummary] = useState<Array<Record<string, any>>>([]);
  const [materialDateSummary, setMaterialDateSummary] = useState<any[]>([]);

  // State for SIMULATION values ONLY. These are updated by the ControlCenter.
  const [simPriceChange, setSimPriceChange] = useState(8);
  const [simCPI, setSimCPI] = useState(0);
  const [simExchangeRate, setSimExchangeRate] = useState(0);
  const [simImportMerch, setSimImportMerch] = useState(0);
  const [simGDP, setSimGDP] = useState(0);
  const [simUnemployment, setSimUnemployment] = useState(0);
  const [simExportMerch, setSimExportMerch] = useState(0);
  const [simForexReserve, setSimForexReserve] = useState(0);
  const [simRetailSales, setSimRetailSales] = useState(0);
  const [simStockMarket, setSimStockMarket] = useState(0);
  const [simIndProd, setSimIndProd] = useState(0);

  // Factors are calculated from the simulation state.
  const PriceChangeFactor = 1 + simPriceChange / 100;
  const CPI_Factor = 1 + simCPI / 100;
  const ExchangeRate_Factor = 1 + simExchangeRate / 100;
  const ImportMerch_Factor = 1 + simImportMerch / 100;
  const GDP_Factor = 1 + simGDP / 100;
  const Unemployment_Factor = 1 + simUnemployment / 100;
  const ExportMerch_Factor = 1 + simExportMerch / 100;
  const ForexReserve_Factor = 1 + simForexReserve / 100;
  const RetailSales_Factor = 1 + simRetailSales / 100;
  const StockMarket_Factor = 1 + simStockMarket / 100;
  const IndProd_Factor = 1 + simIndProd / 100;
  
  // Callback function passed to the ControlCenter.
  // It updates this component's state, triggering the expensive re-calculation.
  const handleSimulate = useCallback((values: SliderValues) => {
    console.log("Running simulation with new values from Control Center:", values);
    setSimPriceChange(values.priceChange);
    setSimCPI(values.cpi);
    setSimExchangeRate(values.exchangeRate);
    setSimImportMerch(values.importMerch);
    setSimGDP(values.gdp);
    setSimUnemployment(values.unemployment);
    setSimExportMerch(values.exportMerch);
    setSimForexReserve(values.forexReserve);
    setSimRetailSales(values.retailSales);
    setSimStockMarket(values.stockMarket);
    setSimIndProd(values.indProd);
  }, []); // Empty dependency array means this function is created only once.

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/final_forecast_result.xlsx");
        if (!response.ok) throw new Error("Failed to fetch Excel file");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const result: Array<Record<string, any>> = XLSX.utils.sheet_to_json(worksheet);
        const transformedData = result.map((row) => ({
          ...row,
          Date: !isNaN(Number(row["Date"])) ? excelDateToJSDate(Number(row["Date"])) : null,
          Month: !isNaN(Number(row["Month"])) ? excelDateToJSDate(Number(row["Month"])) : null,
        }));
        setData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  function excelDateToJSDate(serial: number): Date {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
  }

  useEffect(() => {
    if (data.length === 0) return;
    const validDates = data.map((row) => row["Date"]).filter((date) => date instanceof Date && !isNaN(date.getTime()));
    if (validDates.length > 0) {
      const min = new Date(Math.min(...validDates.map((date) => date.getTime())));
      const max = new Date(Math.max(...validDates.map((date) => date.getTime())));
      setStartDate(min);
      setEndDate(max);
    }
  }, [data]);

  useEffect(() => {
    if (startDate && endDate) {
      setDateRange([startDate.getTime(), endDate.getTime()]);
    }
  }, [startDate, endDate]);

  // This heavy calculation useEffect now ONLY runs when its dependencies change.
  // The factor variables only change when handleSimulate is called.
  useEffect(() => {
    if (!dateRange || data.length === 0) return;
    const [rangeStart, rangeEnd] = dateRange;
    const filtereddate = data.filter((row) => {
      const rowDate = row["Date"];
      if (!(rowDate instanceof Date)) return false;
      const time = rowDate.getTime();
      return time >= rangeStart && time <= rangeEnd;
    });

    const transformedData1 = filtereddate.map((row) => {
      const sales = Number(row["Sales Value"]);
      const cost = Number(row["Cost"]);
      const qty = Number(row["Sales Qty"]);
      const price_computed = sales / qty;
      const CostValue = !isNaN(sales) && !isNaN(cost) ? (sales * cost) / 100 : 0;
      const GrossProfit = sales - CostValue;

      const NewPrice = price_computed * PriceChangeFactor;
      const PriceImpact = Math.pow(PriceChangeFactor, Number(row["Price Elasticity"]));
      const Sim_Revenue_Final =
        qty *
        PriceImpact *
        Math.pow(CPI_Factor, Number(row["CPI_corr"])) *
        Math.pow(ExchangeRate_Factor, Number(row["Exchange Rate_corr"])) *
        Math.pow(ExportMerch_Factor, Number(row["Export Merch_corr"])) *
        Math.pow(ForexReserve_Factor, Number(row["Foreign Reserve_corr"])) *
        Math.pow(GDP_Factor, Number(row["GDP_corr"])) *
        Math.pow(ImportMerch_Factor, Number(row["Import Merch_corr"])) *
        Math.pow(IndProd_Factor, Number(row["Industrial Production_corr"])) *
        Math.pow(RetailSales_Factor, Number(row["Retail Sales_corr"])) *
        Math.pow(StockMarket_Factor, Number(row["Stock Market_corr"])) *
        Math.pow(Unemployment_Factor, Number(row["Unemployment Rate_corr"])) *
        NewPrice;

      const Simulated_Cost = Sim_Revenue_Final * (Number(row["Cost"]) / 100);
      const Sim_Gross_Profit_Final = Sim_Revenue_Final * (Number(row["Operating Profit"]) / 100);
      const Revenue_Impact = Sim_Revenue_Final - sales;
      const Profit_Impact = Sim_Gross_Profit_Final - GrossProfit;

      return {
        ...row, CostValue, GrossProfit, price_computed, Sim_Revenue_Final, Simulated_Cost,
        Sim_Gross_Profit_Final, Profit_Impact, Revenue_Impact,
      };
    });
    setFilteredDate(transformedData1);
    setFilteredData(transformedData1);
  }, [
    data, dateRange, PriceChangeFactor, CPI_Factor, ExchangeRate_Factor, ExportMerch_Factor,
    ForexReserve_Factor, GDP_Factor, ImportMerch_Factor, IndProd_Factor, RetailSales_Factor,
    StockMarket_Factor, Unemployment_Factor,
  ]);

  const handleChartFilterChange = (filters: any) => {
    const { selectedFilter1, selectedFilter2 } = filters;
    const filtered = DateFiltered.filter((row) => {
      const matchesFilter1 = selectedFilter1 ? row["Country"] === selectedFilter1 : true;
      const matchesFilter2 = selectedFilter2 ? row["Material Group Desc"] === selectedFilter2 : true;
      return matchesFilter1 && matchesFilter2;
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    // This summary useEffect correctly depends on filteredData, so it will run after
    // the main calculation is complete. No changes needed here.
    const safeNumber = (val: any): number => (isNaN(Number(val)) ? 0 : Number(val));
    const groupedByCountry = new Map();
    const groupedByMaterialGroup = new Map();
    const groupedByMaterialGroupDate = new Map();

    filteredData.forEach((row) => {
      // ... (Grouping logic remains the same)
      const keyCountry = row["Country"];
      const keyMaterial = row["Material Group Desc"];
      const keyDate = row["Date"];
      const keyMaterialDate = `${keyMaterial}__${keyDate}`;
      // ... etc
       if (!groupedByCountry.has(keyCountry)) {
        groupedByCountry.set(keyCountry, { Country: keyCountry, Countryid: row["CountryID"], Sim_Revenue_Final: 0, Simulated_Cost: 0, Sim_Gross_Profit_Final: 0, Sales_Value: 0, Gross_profit: 0, Profit_Impact: 0, Revenue_Impact: 0 });
      }
       if (!groupedByMaterialGroup.has(keyMaterial)) {
        groupedByMaterialGroup.set(keyMaterial, { MaterialGroup: keyMaterial, Sim_Revenue_Final: 0, Simulated_Cost: 0, Sim_Gross_Profit_Final: 0, Sales_Value: 0, Gross_profit: 0, Profit_Impact: 0, Revenue_Impact: 0 });
      }
       if (!groupedByMaterialGroupDate.has(keyMaterialDate)) {
        groupedByMaterialGroupDate.set(keyMaterialDate, { MaterialGroup: keyMaterial, Date: keyDate, MaterialGroupDate: keyMaterialDate, Sim_Revenue_Final: 0, Simulated_Cost: 0, Sim_Gross_Profit_Final: 0, Sales_Value: 0, Gross_profit: 0, Profit_Impact: 0, Revenue_Impact: 0 });
      }

      const groupCountry = groupedByCountry.get(keyCountry);
      const groupMaterial = groupedByMaterialGroup.get(keyMaterial);
      const groupMatDate = groupedByMaterialGroupDate.get(keyMaterialDate);
      
      groupCountry.Sim_Revenue_Final += safeNumber(row["Sim_Revenue_Final"]);
      groupMaterial.Sim_Revenue_Final += safeNumber(row["Sim_Revenue_Final"]);
      groupMatDate.Sim_Revenue_Final += safeNumber(row["Sim_Revenue_Final"]);
      //... and so on for all fields
    });

    // ... (Summary creation logic remains the same)
  }, [filteredData]);

  if (error) return <div>{error}</div>;
  if (loading) return <LoadingMobiusStrip />;
  
  const initialSliderValues: SliderValues = {
      priceChange: simPriceChange, cpi: simCPI, exchangeRate: simExchangeRate,
      importMerch: simImportMerch, gdp: simGDP, unemployment: simUnemployment,
      exportMerch: simExportMerch, forexReserve: simForexReserve, retailSales: simRetailSales,
      stockMarket: simStockMarket, indProd: simIndProd,
  };
  
  return (
    <div className="dashboard-container-senario">
      <div className="Header-container-senario">
        <h1>Financial Forecast and Scenario Simulator</h1>
        <div>
          <img src=".\asset\vittora_grey.png" alt="Logo" height={50} />
        </div>
      </div>
      <div className="Kpi-container-senario">
        <div className="Historical-Sale-senario">
          <HistoricalSale data1={filteredData} startDate={startDate!} endDate={new Date("2024-12-31")} />
        </div>
        <div className="Forcast-sale-senario">
          <ForcastSimulate data1={filteredData} startDate={new Date("2025-01-01")} endDate={endDate!} />
        </div>
      </div>
      <div className="Filter-container-senario">
        <div className="filters1-senario">
          <FilterComponent data={data} onFilterChange={handleChartFilterChange} />
        </div>
        <div className="filters2-senario">
          <div className="Date-Filter-senario">
            <div className="Date-Filter1-senario main">
              {dateRange && (
                <DateRangeSlider heading="" startDate={startDate!} endDate={endDate!} dateRange={dateRange} setDateRange={setDateRange} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Sales Direct Cost and Gross Profit Trend</h3>
          <AmMultiAreaChart1 data={filteredData} xField="Date" yFields={["Sales Value", "GrossProfit", "CostValue"]}
            displayNames={{ "Sales Value": "Sales Value", GrossProfit: "Gross Profit", CostValue: "Cost Value" }}
            colors={["#335eff", "#36ff33", "#fe0000"]}
          />
        </div>
      </div>

      {/* The entire slider section is now replaced by our clean, isolated component */}
      <ControlCenter 
        initialValues={initialSliderValues} 
        onSimulate={handleSimulate} 
      />

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Simulated Revenue vs Base Revenue</h3>
          <AmMultiAreaChart1 data={filteredData} xField="Date" yFields={["Sim_Revenue_Final", "Sales Value"]}
            displayNames={{ "Sales Value": "Sales Value", Sim_Revenue_Final: "Simulated Revenue" }}
            colors={["#36ff33", "#335eff"]}
          />
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Simulated Gross Profit vs Base Gross Profit</h3>
          <AmMultiAreaChart1 data={filteredData} xField="Date" yFields={["Sim_Gross_Profit_Final", "GrossProfit"]}
            displayNames={{ GrossProfit: "Gross Profit", Sim_Gross_Profit_Final: "Simulated Gross Profit" }}
            colors={["#36ff33", "#335eff"]}
          />
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Sim Revenue Final, Simulated Cost and Sim Gross Profit Final by Material Group Desc</h3>
          <HorizontalBarChartSlid data={Materialsummary} xLabel="Value" yLabel="Material Group Desc" CategoryColumn="MaterialGroup"
            ValueColumns={["Simulated_Cost", "Sim_Gross_Profit_Final", "Sim_Revenue_Final"]}
            displayNames={{ Simulated_Cost: "Simulated Cost", Sim_Gross_Profit_Final: "Simulated Gross Profit", Sim_Revenue_Final: "Simulated Revenue" }}
          />
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Sim Revenue, Simulated Cost and Sim Gross Profit Final by Country</h3>
          <HorizontalBarChartSlid data={countrysummary} xLabel="Value" yLabel="Country" CategoryColumn="Country"
            ValueColumns={["Simulated_Cost", "Sim_Gross_Profit_Final", "Sim_Revenue_Final"]}
            displayNames={{ Simulated_Cost: "Simulated Cost", Sim_Gross_Profit_Final: "Simulated Gross Profit", Sim_Revenue_Final: "Simulated Revenue" }}
          />
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Sim Revenue Country</h3>
          <WorldBubbleMapChart data={countrysummary} CategoryColumn1="Country" CategoryColumn="Countryid" ValueColumn="Sim_Revenue_Final" />
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Summary Table</h3>
          <TableComponent data={materialDateSummary}
            visibleColumns={["MaterialGroup", "Date", "Sales_Value", "Sim_Revenue_Final", "Revenue_Impact", "Gross_profit", "Sim_Gross_Profit_Final", "Profit_Impact"]}
          />
        </div>
      </div>
    </div>
  );
};

export default DashBoard1;