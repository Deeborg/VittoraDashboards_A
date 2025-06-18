import React, { useState, useEffect } from "react";
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

  // MODIFICATION: 1. State for UI sliders (updates instantly)
  // These hold the current visual value of the sliders.
  const [priceChangeSlider, setPriceChangeSlider] = useState(8);
  const [costChangeSlider, setCostChangeSlider] = useState(0);
  const [quantitySlider, setQuantitySlider] = useState(0);
  const [cpiSlider, setCpiSlider] = useState(0);
  const [exchangeRateSlider, setExchangeRateSlider] = useState(0);
  const [importMerchSlider, setImportMerchSlider] = useState(0);
  const [gdpSlider, setGdpSlider] = useState(0);
  const [unemploymentSlider, setUnemploymentSlider] = useState(0);
  const [exportMerchSlider, setExportMerchSlider] = useState(0);
  const [forexReserveSlider, setForexReserveSlider] = useState(0);
  const [retailSalesSlider, setRetailSalesSlider] = useState(0);
  const [stockMarketSlider, setStockMarketSlider] = useState(0);
  const [indProdSlider, setIndProdSlider] = useState(0);

  // MODIFICATION: 2. State for Simulation (updates only on button click)
  // These values are used in the actual calculation.
  const [simPriceChange, setSimPriceChange] = useState(8);
  const [simCostChange, setSimCostChange] = useState(0);
  const [simQuantity, setSimQuantity] = useState(0);
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
  
  // MODIFICATION: Note that `const [rangeStart, rangeEnd] = useState()` was invalid syntax and removed.
  // You correctly deconstruct `dateRange` inside the useEffect where it's needed.

  // MODIFICATION: 3. Calculate factors based on the SIMULATION state, not the slider state.
  const PriceChangeFactor = 1 + simPriceChange / 100;
  const CostChangeFactor = 1 + simCostChange / 100;
  const QuantityFactor = 1 + simQuantity / 100;
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
  
  // MODIFICATION: 4. Create the function to run the simulation on demand.
  const handleSimulate = () => {
    console.log("Running simulation with new values...");
    setSimPriceChange(priceChangeSlider);
    setSimCostChange(costChangeSlider);
    setSimQuantity(quantitySlider);
    setSimCPI(cpiSlider);
    setSimExchangeRate(exchangeRateSlider);
    setSimImportMerch(importMerchSlider);
    setSimGDP(gdpSlider);
    setSimUnemployment(unemploymentSlider);
    setSimExportMerch(exportMerchSlider);
    setSimForexReserve(forexReserveSlider);
    setSimRetailSales(retailSalesSlider);
    setSimStockMarket(stockMarketSlider);
    setSimIndProd(indProdSlider);
  };


  useEffect(() => {
    // Your loading logic here (e.g., fetch data or simulate loading)
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
        console.log("result",result)
        const transformedData = result.map((row) => {
          const dateSerial = Number(row["Date"]);
          const monthSerial = Number(row["Month"]);
          return {
            ...row,
            Date: !isNaN(dateSerial) ? excelDateToJSDate(dateSerial) : null,
            Month: !isNaN(monthSerial) ? excelDateToJSDate(monthSerial) : null,
          };
        });

        setData(transformedData);
        // We will trigger the first calculation inside the main simulation useEffect
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
    const validDates = data
      .map((row) => row["Date"])
      .filter((date) => date instanceof Date && !isNaN(date.getTime()));

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
  
  // MODIFICATION: 5. Update the dependency array of the main calculation `useEffect`.
  // It now depends on the `Factor` variables, which only change when the simulation state changes (after a button click).
  useEffect(() => {
    if (!dateRange || data.length === 0) return;
    console.log("Recalculating dataset...");
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
        ...row,
        CostValue,
        GrossProfit,
        price_computed,
        Sim_Revenue_Final,
        Simulated_Cost,
        Sim_Gross_Profit_Final,
        Profit_Impact,
        Revenue_Impact,
      };
    });

    setFilteredDate(transformedData1);
    setFilteredData(transformedData1); // Keep this to ensure other components get the initial data
    console.log("transformedData1", transformedData1);
  }, [
    data, // still need to run when base data loads
    dateRange, // still need to run when date range changes
    // The rest of the dependencies now trace back to the simulation state, not the sliders.
    PriceChangeFactor,
    CPI_Factor,
    ExchangeRate_Factor,
    ExportMerch_Factor,
    ForexReserve_Factor,
    GDP_Factor,
    ImportMerch_Factor,
    IndProd_Factor,
    RetailSales_Factor,
    StockMarket_Factor,
    Unemployment_Factor,
  ]);
  
  // No changes needed below this line, except for the renderSlider calls and adding the button
  // ... (handleChartFilterChange and summary useEffects remain the same) ...

  useEffect(() => {
    const safeNumber = (val: any): number => (isNaN(Number(val)) ? 0 : Number(val));

    type GroupData = {
      Country?: string;
      Countryid?: string;
      MaterialGroup?: string;
      Date?: Date;
      MaterialGroupDate?: string;
      Sim_Revenue_Final: number;
      Simulated_Cost: number;
      Sim_Gross_Profit_Final: number;
      Sales_Value: number;
      Gross_profit: number;
      Profit_Impact: number;
      Revenue_Impact: number;
    };

    type NumericField = keyof Pick<
      GroupData,
      | "Sim_Revenue_Final"
      | "Simulated_Cost"
      | "Sim_Gross_Profit_Final"
      | "Sales_Value"
      | "Gross_profit"
      | "Profit_Impact"
      | "Revenue_Impact"
    >;

    const groupedByCountry = new Map<string, GroupData>();
    const groupedByMaterialGroup = new Map<string, GroupData>();
    const groupedByMaterialGroupDate = new Map<string, GroupData>();

    filteredData.forEach((row) => {
      const rowDate = row["Date"];
      if (!rowDate) return;

      const keyCountry = row["Country"];
      const keyMaterial = row["Material Group Desc"];
      const keyDate = row["Date"];
      const keyMaterialDate = `${keyMaterial}__${keyDate}`;
      const countryid = row["CountryID"];

      if (!groupedByCountry.has(keyCountry)) {
        groupedByCountry.set(keyCountry, {
          Country: keyCountry,
          Countryid: countryid,
          Sim_Revenue_Final: 0,
          Simulated_Cost: 0,
          Sim_Gross_Profit_Final: 0,
          Sales_Value: 0,
          Gross_profit: 0,
          Profit_Impact: 0,
          Revenue_Impact: 0,
        });
      }

      if (!groupedByMaterialGroup.has(keyMaterial)) {
        groupedByMaterialGroup.set(keyMaterial, {
          MaterialGroup: keyMaterial,
          Sim_Revenue_Final: 0,
          Simulated_Cost: 0,
          Sim_Gross_Profit_Final: 0,
          Sales_Value: 0,
          Gross_profit: 0,
          Profit_Impact: 0,
          Revenue_Impact: 0,
        });
      }

      if (!groupedByMaterialGroupDate.has(keyMaterialDate)) {
        groupedByMaterialGroupDate.set(keyMaterialDate, {
          MaterialGroup: keyMaterial,
          Date: keyDate,
          MaterialGroupDate: keyMaterialDate,
          Sim_Revenue_Final: 0,
          Simulated_Cost: 0,
          Sim_Gross_Profit_Final: 0,
          Sales_Value: 0,
          Gross_profit: 0,
          Profit_Impact: 0,
          Revenue_Impact: 0,
        });
      }

      const groupCountry = groupedByCountry.get(keyCountry)!;
      const groupMaterial = groupedByMaterialGroup.get(keyMaterial)!;
      const groupMatDate = groupedByMaterialGroupDate.get(keyMaterialDate)!;

      const fields: [NumericField, string][] = [
        ["Sim_Revenue_Final", "Sim_Revenue_Final"],
        ["Simulated_Cost", "Simulated_Cost"],
        ["Sim_Gross_Profit_Final", "Sim_Gross_Profit_Final"],
        ["Sales_Value", "Sales Value"],
        ["Gross_profit", "GrossProfit"],
        ["Profit_Impact", "Profit_Impact"],
        ["Revenue_Impact", "Revenue_Impact"],
      ];

      fields.forEach(([targetField, sourceField]) => {
        const val = safeNumber(row[sourceField]);
        groupCountry[targetField] += val;
        groupMaterial[targetField] += val;
        groupMatDate[targetField] += val;
      });
    });

    const computeSummary = (groupMap: Map<string, GroupData>, labelKey: keyof GroupData) =>
      Array.from(groupMap.values()).map((group) => ({
        [labelKey]: group[labelKey],
        Sim_Revenue_Final: group.Sim_Revenue_Final,
        Simulated_Cost: group.Simulated_Cost,
        Sim_Gross_Profit_Final: group.Sim_Gross_Profit_Final,
        ...(labelKey === "MaterialGroupDate" && { MaterialGroup: group.MaterialGroup }),
        ...(labelKey === "MaterialGroupDate" && { Date: group.Date }),
        ...(labelKey === "MaterialGroupDate" && { Sales_Value: group.Sales_Value }),
        ...(labelKey === "MaterialGroupDate" && { Gross_profit: group.Gross_profit }),
        ...(labelKey === "MaterialGroupDate" && { Profit_Impact: group.Profit_Impact }),
        ...(labelKey === "MaterialGroupDate" && { Revenue_Impact: group.Revenue_Impact }),
        ...(labelKey === "Country" && { Countryid: group.Countryid }),
      }));

    const countrySummary = computeSummary(groupedByCountry, "Country").sort(
      (b, a) => b.Sim_Revenue_Final - a.Sim_Revenue_Final
    );

    const materialGroupSummary = computeSummary(groupedByMaterialGroup, "MaterialGroup").sort(
      (b, a) => b.Sim_Revenue_Final - a.Sim_Revenue_Final
    );

    const materialGroupDateSummary = computeSummary(groupedByMaterialGroupDate, "MaterialGroupDate").sort(
      (b, a) => b.Sim_Revenue_Final - a.Sim_Revenue_Final
    );

    setCountrySummary(countrySummary);
    setMaterialSummary(materialGroupSummary);
    setMaterialDateSummary(materialGroupDateSummary);

  }, [filteredData]);

  const handleChartFilterChange = (filters: any) => {
    const { selectedFilter1, selectedFilter2 } = filters;
    const filtered = DateFiltered.filter((row) => {
      const matchesFilter1 = selectedFilter1 ? row["Country"] === selectedFilter1 : true;
      const matchesFilter2 = selectedFilter2 ? row["Material Group Desc"] === selectedFilter2 : true;
      return matchesFilter1 && matchesFilter2;
    });
    setFilteredData(filtered);
  };

  const renderSlider = (
    label: string,
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>
  ) => (
    <div className="slider-senario">
      <label>{label}</label>
      <input
        type="range"
        min={-20}
        max={20}
        value={value}
        step={1}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: "100%" }}
      />
      <input
        type="number"
        min={-20}
        max={20}
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          if (newValue >= -20 && newValue <= 20) setValue(newValue);
        }}
        style={{ width: "100%", marginTop: "5px" }}
      />
    </div>
  );

  if (error) return <div>{error}</div>;
  if (loading) {
    return <LoadingMobiusStrip />;
  }

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
                <DateRangeSlider
                  heading=""
                  startDate={startDate!}
                  endDate={endDate!}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Sales Direct Cost and Gross Profit Trend</h3>
          <AmMultiAreaChart1
            data={filteredData}
            xField="Date"
            yFields={["Sales Value", "GrossProfit", "CostValue"]}
            displayNames={{
              "Sales Value": "Sales Value",
              GrossProfit: "Gross Profit",
              CostValue: "Cost Value",
            }}
            colors={["#335eff", "#36ff33", "#fe0000"]}
          />
        </div>
      </div>
      
      {/* MODIFICATION: 6. Add the simulate button and update slider calls */}
      <div className="Slider-container-senario">
        <div className="Sliders-senario">
          <h3>Control Center</h3>
          <div className="Sliders1-senario">
            {renderSlider("Price Changes %", priceChangeSlider, setPriceChangeSlider)}
            {renderSlider("CPI %", cpiSlider, setCpiSlider)}
            {renderSlider("Exchange Rate %", exchangeRateSlider, setExchangeRateSlider)}
            {renderSlider("Import Merch %", importMerchSlider, setImportMerchSlider)}
            {renderSlider("GDP %", gdpSlider, setGdpSlider)}
            {renderSlider("Unemployment Rate %", unemploymentSlider, setUnemploymentSlider)}
            {renderSlider("Export Merch %", exportMerchSlider, setExportMerchSlider)}
            {renderSlider("Forex Reserve %", forexReserveSlider, setForexReserveSlider)}
            {renderSlider("Retail Sale %", retailSalesSlider, setRetailSalesSlider)}
            {renderSlider("Stock Market %", stockMarketSlider, setStockMarketSlider)}
            {renderSlider("Industrial Production %", indProdSlider, setIndProdSlider)}
          </div>
          <div className="simulate-button-container">
            <button className="simulate-button" onClick={handleSimulate}>
              Run Simulation
            </button>
          </div>
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Simulated Revenue vs Base Revenue</h3>
          <AmMultiAreaChart1
            data={filteredData}
            xField="Date"
            yFields={["Sim_Revenue_Final", "Sales Value"]}
            displayNames={{
              "Sales Value": "Sales Value",
              Sim_Revenue_Final: "Simulated Revenue",
            }}
            colors={["#36ff33", "#335eff"]}
          />
        </div>
      </div>

      {/* ... The rest of the component remains the same ... */}
       <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Simulated Gross Profit vs Base Gross Profit</h3>
          <AmMultiAreaChart1
            data={filteredData}
            xField="Date"
            yFields={["Sim_Gross_Profit_Final", "GrossProfit"]}
            displayNames={{
              GrossProfit: "Gross Profit",
              Sim_Gross_Profit_Final: "Simulated Gross Profit",
            }}
            colors={["#36ff33", "#335eff"]}
          />
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Sim Revenue Final, Simulated Cost and Sim Gross Profit Final by Material Group Desc</h3>
          <HorizontalBarChartSlid
            data={Materialsummary}
            xLabel="Value"
            yLabel="Material Group Desc"
            CategoryColumn="MaterialGroup"
            ValueColumns={["Simulated_Cost", "Sim_Gross_Profit_Final", "Sim_Revenue_Final"]}
            displayNames={{
              Simulated_Cost: "Simulated Cost",
              Sim_Gross_Profit_Final: "Simulated Gross Profit",
              Sim_Revenue_Final: "Simulated Revenue",
            }}
          />
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Sim Revenue, Simulated Cost and Sim Gross Profit Final by Country</h3>
          <HorizontalBarChartSlid
            data={countrysummary}
            xLabel="Value"
            yLabel="Country"
            CategoryColumn="Country"
            ValueColumns={["Simulated_Cost", "Sim_Gross_Profit_Final", "Sim_Revenue_Final"]}
            displayNames={{
              Simulated_Cost: "Simulated Cost",
              Sim_Gross_Profit_Final: "Simulated Gross Profit",
              Sim_Revenue_Final: "Simulated Revenue",
            }}
          />
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Sim Revenue Country</h3>
          <WorldBubbleMapChart
            data={countrysummary}
            CategoryColumn1="Country"
            CategoryColumn="Countryid"
            ValueColumn="Sim_Revenue_Final"
          />
        </div>
      </div>

      <div className="Chart-container-senario">
        <div className="chart-row-senario">
          <h3>Summary Table</h3>
          <TableComponent
            data={materialDateSummary}
            visibleColumns={[
              "MaterialGroup",
              "Date",
              "Sales_Value",
              "Sim_Revenue_Final",
              "Revenue_Impact",
              "Gross_profit",
              "Sim_Gross_Profit_Final",
              "Profit_Impact",
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default DashBoard1;