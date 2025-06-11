import React, { useState, useEffect } from "react";

import "../Style/Chart1Synario.css"
import * as XLSX from "xlsx";
import HistoricalSale from "./HistoricalSale";
import FilterComponent from "../components/FiltersSenario";
import ForcastSimulate from "./ForcastSimulate";
import DateRangeSlider from "../components/DateFilterSenario";
import AmMultiAreaChart1 from "../components/AreaChartMultiSenario";
import HorizontalBarChartSlid from "../components/BarChartHoriSlidSenario";
import WorldBubbleMapChart from "../components/WorldMapSenario";
import TableComponent from "../components/TableSenario";
import logo from "../Asset/ajalabs.png";
import back from "../Asset/back.png";




const DashBoard1: React.FC = () => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<Array<Record<string, any>>>([]);
  const [DateFiltered, setFilteredDate] = useState<Array<Record<string, any>>>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<[number, number] | null>(null); // [startTimestamp, endTimestamp]
  const [countrysummary, setCountrySummary] = useState<Array<Record<string, any>>>([]);
  const [Materialsummary, setMaterialSummary] = useState<Array<Record<string, any>>>([]);
  const [materialDateSummary, setMaterialDateSummary] = useState<any[]>([]);


  
    const [slider1, setSlider1] = useState(8);
    const [slider2, setSlider2] = useState(0);
    const [slider3, setSlider3] = useState(0);
    const [slider4, setSlider4] = useState(0);
    const [slider5, setSlider5] = useState(0);
    const [slider6, setSlider6] = useState(0);
    const [slider7, setSlider7] = useState(0);
    const [slider8, setSlider8] = useState(0);
    const [slider9, setSlider9] = useState(0);
    const [slider10, setSlider10] = useState(0);
    const [slider11, setSlider11] = useState(0);
    const [slider12, setSlider12] = useState(0);
    const [slider13, setSlider13] = useState(0);
  
    const PriceChangeFactor =1+(slider1/100)
    const CostChangeFactor =1+(slider2/100)
    const QuantityFactor =1+(slider3/100)
    const CPI_Factor =1+(slider4/100)
    const ExchangeRate_Factor =1+(slider5/100)
    const ImportMerch_Factor =1+(slider6/100)
    const GDP_Factor =1+(slider7/100)
    const Unemployment_Factor =1+(slider8/100)
    const ExportMerch_Factor =1+(slider9/100)
    const ForexReserve_Factor =1+(slider10/100)
    const RetailSales_Factor =1+(slider11/100)
    const StockMarket_Factor =1+(slider12/100)
    const IndProd_Factor =1+(slider13/100)

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/final_forecast_result.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const result: Array<Record<string, any>> =
          XLSX.utils.sheet_to_json(worksheet);

        // Transform Date and Month fields
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
        setFilteredData(transformedData);
        setFilteredDate(transformedData)
        
        // console.log("transformedData",transformedData)
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }

    };
    fetchData();    
  }, []);

  function excelDateToJSDate(serial: number): Date {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400; // seconds in a day
    return new Date(utc_value * 1000);
  }
  useEffect(() => {
    if (data.length === 0) return;
    
    const validDates = data
      .map(row => row["Date"])
      .filter(date => date instanceof Date && !isNaN(date.getTime()));

    if (validDates.length > 0) {
      const min = new Date(Math.min(...validDates.map(date => date.getTime())));
      const max = new Date(Math.max(...validDates.map(date => date.getTime())));
      setStartDate(min);
      setEndDate(max);
      
    }
  }, [data]);

  useEffect(() => {
      if (startDate && endDate) {
        setDateRange([startDate.getTime(), endDate.getTime()]);
      }
    }, [startDate, endDate]);
  
    // Filter data based on date range
  useEffect(() => {
      if (!dateRange) return;
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
        const price_computed =sales/qty
        const CostValue = !isNaN(sales) && !isNaN(cost) ? (sales * cost) / 100 : 0;
        const GrossProfit = sales - CostValue;
      
        const NewPrice = price_computed * PriceChangeFactor;
        const PriceImpact = Math.pow(PriceChangeFactor, Number(row["Price Elasticity"]));
        const Sim_Revenue_Final = qty *
        PriceImpact *
        Math.pow(CPI_Factor, Number(row["CPI_corr"]))*
        Math.pow(ExchangeRate_Factor, Number(row["Exchange Rate_corr"])) *
        Math.pow(ExportMerch_Factor, Number(row["Export Merch_corr"])) *
        Math.pow(ForexReserve_Factor, Number(row["Foreign Reserve_corr"])) *
        Math.pow(GDP_Factor, Number(row["GDP_corr"]))*
        Math.pow(ImportMerch_Factor, Number(row["Import Merch_corr"])) *
        Math.pow(IndProd_Factor, Number(row["Industrial Production_corr"])) *
        Math.pow(RetailSales_Factor, Number(row["Retail Sales_corr"])) *
        Math.pow(StockMarket_Factor, Number(row["Stock Market_corr"])) *
        Math.pow(Unemployment_Factor, Number(row["Unemployment Rate_corr"]))* NewPrice;
        

        const Simulated_Cost = Sim_Revenue_Final*((Number(row["Cost"]))/100);
        const Sim_Gross_Profit_Final =Sim_Revenue_Final*((Number(row["Operating Profit"]))/100);
        const Revenue_Impact =Sim_Revenue_Final-sales
        const Profit_Impact =Sim_Gross_Profit_Final-GrossProfit

        return {
            ...row,
            CostValue,
            GrossProfit,
            price_computed,Sim_Revenue_Final,Simulated_Cost,Sim_Gross_Profit_Final,
            Profit_Impact,Revenue_Impact
        };
        });

      setFilteredDate(transformedData1)
      setFilteredData(transformedData1)
      console.log("transformedData1",transformedData1)
    }, [data,dateRange,
    startDate,
    endDate,
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
    Unemployment_Factor]);
  

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
  const safeNumber = (val: any): number => (isNaN(Number(val)) ? 0 : Number(val));

  type GroupData = {
    Country?: string;
    Countryid?: string;
    MaterialGroup?: string;
    Date?:Date;
    MaterialGroupDate?: string;
    Sim_Revenue_Final: number;
    Simulated_Cost: number;
    Sim_Gross_Profit_Final: number;
    Sales_Value: number;
    Gross_profit: number;
    Profit_Impact: number;
    Revenue_Impact: number;
  };

  type NumericField = keyof Pick<GroupData,
    "Sim_Revenue_Final" | "Simulated_Cost" | "Sim_Gross_Profit_Final" |
    "Sales_Value" | "Gross_profit" | "Profit_Impact" | "Revenue_Impact"
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

    // Initialize country group
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

    // Initialize material group
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

    // Initialize material group + date
    if (!groupedByMaterialGroupDate.has(keyMaterialDate)) {
      groupedByMaterialGroupDate.set(keyMaterialDate, {
        MaterialGroup: keyMaterial,
        Date:keyDate,
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

  const computeSummary = (
    groupMap: Map<string, GroupData>,
    labelKey: keyof GroupData
  ) =>
    Array.from(groupMap.values()).map((group) => {
      return {
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
      };
    });

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

  console.log("Country Summary:", countrySummary);
  console.log("Material Group Summary:", materialGroupSummary);
  console.log("Material Group + Date Summary:", materialGroupDateSummary);
}, [filteredData]);



  const renderSlider = (
      label: string,
      value: number,
      setValue: React.Dispatch<React.SetStateAction<number>>
    ) => (
      <div className="slider">
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="Header-container">
        <h1>Financial Forecast and Scenario Simulator</h1>  
          <div>
            {/* <img src={back} alt="Logo" width="100px" /> */}
            <img src={logo} alt="Logo" width="100px" />
          </div>        
        
      </div>
      <div className="Kpi-container">
        <div className="Historical-Sale">
          {/* <h2>Hisory</h2> */}
          <HistoricalSale data1={filteredData} startDate={startDate!} endDate={new Date("2024-12-31")} />
        </div>
        <div className="Forcast-sale">
          {/* <h2>Hisory</h2> */}
          <ForcastSimulate data1={filteredData}  startDate={new Date("2025-01-01")} endDate={endDate!}/>
        </div>
      </div>
      <div className="Filter-container">
        <div className="filters1">
        <FilterComponent data={data} onFilterChange={handleChartFilterChange} />
        </div>
        <div className="filters2">
          <div className="Date-Filter">
          <div className="Date-Filter1 main">
          {dateRange && (
            <DateRangeSlider heading=""
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



      <div className="Chart-container">
        
        <div className="chart-row">
        <h3>Sales Direct Cost and Gross Profit Trend</h3>
        <AmMultiAreaChart1 data={filteredData} xField="Date" yFields={["Sales Value","GrossProfit","CostValue"]} displayNames={{"Sales Value": "Sales Value","GrossProfit": "Gross Profit","CostValue": "Cost Value" }} colors={["#335eff",  "#36ff33","#fe0000"]}/>

        </div>
      </div>




      <div className="Slider-container">

        <div className="Sliders">
          <h3>Control Center</h3>
        <div className="Sliders1">
        {renderSlider("Price Changes %", slider1, setSlider1)}
        {/* {renderSlider("Cost Changes %", slider2, setSlider2)}
        {renderSlider("Quantity Changes %", slider3, setSlider3)} */}
        {renderSlider("CPI %", slider4, setSlider4)}
        {renderSlider("Exchange Rate %", slider5, setSlider5)}
        {renderSlider("Import Merch %", slider6, setSlider6)}
        {renderSlider("GDP %", slider7, setSlider7)}
        {renderSlider("Unemployment Rate %", slider8, setSlider8)}
        {renderSlider("Export Merch %", slider9, setSlider9)}
        {renderSlider("Forex Reserve %", slider10, setSlider10)}
        {renderSlider("Retail Sale %", slider11, setSlider11)}
        {renderSlider("Stock Market %", slider12, setSlider12)}
        {renderSlider("Industrial Production %", slider13, setSlider13)}
        </div>
        </div>

      </div>

      

      <div className="Chart-container">
        
        <div className="chart-row">
          <h3>Simulated Revenue vs Base Revenue</h3>
        <AmMultiAreaChart1 data={filteredData} xField="Date" yFields={["Sim_Revenue_Final","Sales Value"]} displayNames={{"Sales Value": "Sales Value","Sim_Revenue_Final": "Simulated Revenue"}} colors={["#36ff33","#335eff"]}/>
        </div>
      </div>

      <div className="Chart-container">
        
        <div className="chart-row">
          <h3>Simulated Gross Profit vs Base Gross Profit</h3>
        <AmMultiAreaChart1 data={filteredData} xField="Date" yFields={["Sim_Gross_Profit_Final","GrossProfit"]} displayNames={{"GrossProfit": "Gross Profit", "Sim_Gross_Profit_Final": "Simulated Gross Profit"}}  colors={["#36ff33","#335eff"]}/>
        </div>
      </div>

      <div className="Chart-container">
        
        <div className="chart-row">
          <h3>Sim Revenue Final, Simulated Cost and Sim Gross Profit Final by Material Group Desc</h3>
          <HorizontalBarChartSlid data={Materialsummary} xLabel="Value" yLabel='Material Group Desc' CategoryColumn="MaterialGroup" ValueColumns={[ 'Simulated_Cost','Sim_Gross_Profit_Final','Sim_Revenue_Final']} displayNames={{'Simulated_Cost':"Simulated Cost",'Sim_Gross_Profit_Final':"Simulated Gross Profit",'Sim_Revenue_Final':"Simulated Revenue"}} />  
                </div>
      </div>

      <div className="Chart-container">
        
        <div className="chart-row">
          <h3>Sim Revenue , Simulated Cost and Sim Gross Profit Final by Country</h3>
          <HorizontalBarChartSlid data={countrysummary} xLabel='Value' yLabel="Country" CategoryColumn="Country" ValueColumns={[ 'Simulated_Cost','Sim_Gross_Profit_Final','Sim_Revenue_Final',]} displayNames={{'Simulated_Cost':"Simulated Cost",'Sim_Gross_Profit_Final':"Simulated Gross Profit",'Sim_Revenue_Final':"Simulated Revenue"}}/>        </div>
      </div>
      <div className="Chart-container">
       
        <div className="chart-row">
          <h3>Sim Revenue Country</h3>
          <WorldBubbleMapChart  data={countrysummary} CategoryColumn1="Country" CategoryColumn="Countryid"  ValueColumn="Sim_Revenue_Final" />
      </div>
      </div>

      <div className="Chart-container">
        
        <div className="chart-row">
          <h3>Summary Table</h3>
          <TableComponent data={materialDateSummary} visibleColumns={['MaterialGroup','Date','Sales_Value','Sim_Revenue_Final','Revenue_Impact','Gross_profit','Sim_Gross_Profit_Final','Profit_Impact']}/>
      </div>
      </div>

    </div>
  );
};

export default DashBoard1;