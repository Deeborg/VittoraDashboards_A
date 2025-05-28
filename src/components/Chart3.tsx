import React, { useState, useEffect } from "react";
import "../Style/Chart1.css"
import * as XLSX from "xlsx";
// import BarChart from "../Components/BarChart";
// import BarChart2 from "../Components/BarChart2";
// import BarChartLine from "../Components/BarChartLine";
import LineChart from "../components/LineChart";
import WaterfallChart from "../components/WatterfallChart";
// import AreaChart from "../Components/AreaChart";
// import AreaChartam from "../Components/AreaChartam";
import AmMultiAreaChart from "../components/AreaChartMulti";
import StackedBarWithLineChart from "../components/StackedBarWithLine";
// import StakedBar from "../Components/StackedBar";
// import logo from '../Asset/ajalabs.png';
import "../Style/StatsCard.css";
import Layout from "../components/layout";
import StatsCards from "../components/StatsCard";
// import LiquidityRatioLineChart from "../Components/LiquidityRatioLineChart";
import CashFlowForecastChart from "../components/CashFlowForecastChart";


interface CashFlowData {
  Date: string;
  "Opening Balance": number;
  Receivables: number;
  Payables: number;
  Financing: number;
  Investments: number;
  "Closing balance": number;
  "Min Balance": number;
  "Max Balance": number;
  Invest: number;
  Borrow: number;
}

const DashBoard2: React.FC = () => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [data1, setData1] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<Array<Record<string, any>>>([]);
  const [kpiData, setKpiData] = useState<Array<Record<string, any>>>([]);
  const [cashflowData, setCashflowData] = useState<Array<Record<string, any>>>([]);
  const [cashflowWaterfallData, setCashflowWaterfallData] = useState<Array<{ category: string, value: number }>>([]);



  // Fetch data from the API

  useEffect(() => {
    const fetchCashflowData = async () => {
      try {
        const response = await fetch("/CashFLow.xlsx"); // ✅ New file
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true, dateNF: 'yyyy-mm-dd' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const result: Array<Record<string, any>> = XLSX.utils.sheet_to_json(worksheet, { raw: true });
  
        // Optional: Convert Excel serial date to readable date if needed
        const parsed = result.map((row): CashFlowData => ({
          Date: typeof row.Date === "number" ? XLSX.SSF.format("yyyy-mm-dd", row.Date) : String(row.Date),
          "Opening Balance": parseFloat(row["Opening Balance"]) || 0,
          Receivables: parseFloat(row["Receivables"]) || 0,
          Payables: parseFloat(row["Payables"]) || 0,
          Financing: parseFloat(row["Financing"]) || 0,
          Investments: parseFloat(row["Investments"]) || 0,
          "Closing balance": parseFloat(row["Closing balance"]) || 0,
          "Min Balance": parseFloat(row["Min Balance"]) || 0,
          "Max Balance": parseFloat(row["Max Balance"]) || 0,
          Invest: parseFloat(row["Invest"]) || 0,
          Borrow: parseFloat(row["Borrow"]) || 0,
        }));
        
  
        setCashflowData(parsed as CashFlowData[]);

      } catch (err) {
        console.error("Failed to load cashflow data", err);
      }
    };
    fetchCashflowData();
  }, []);
  
  useEffect(() => {
  const fetchData = async () => {
    try {const response = await fetch("/Balance Sheet.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true, dateNF: 'yyyy-mm-dd' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const result: Array<Record<string, any>> =
      XLSX.utils.sheet_to_json(worksheet);
      const transformedData = result.map((row) => row);
      setData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);}
     };
     fetchData();
    }, []);
    useEffect(() => {
      const filterColumns = (data: Record<string, any>[], columns: string[]) => {
        return data.map((row) => {
          const filteredRow: Record<string, any> = {};
          columns.forEach((col) => {
            if (row[col] !== undefined) {
              filteredRow[col] = row[col];
            }});
            return filteredRow;});
          };
          const filteredData1 = filterColumns(filteredData, [
            "Cash And Cash Equivalents",
            "Current Investments",
            "Inventories",
            "Other Current Liabilities",
            "OtherCurrentAssets",
            "Short Term Borrowings",
            "Short Term Loans And Advances",
            "Short Term Provisions",
            "Trade Payables",
            "Trade Receivables",
          ]);
          const transposeData = (
            filteredData1: Record<string, any>[],
            columnsToNegate: string[] = [],
            sortOrder: "asc" | "desc" = "desc"
          ) => {
            if (filteredData1.length === 0) return [];
            const keys = Object.keys(filteredData1[0]);
            const transposed: Record<string, any>[] = [];
            keys.forEach((key) => {
              let total = 0;
              filteredData1.forEach((row) => {
                let num = parseFloat(row[key]);
                if (!isNaN(num)) {
                  if (columnsToNegate.includes(key)) {
                    num *= -1;
                  }
                  total += num;
                }
              });
              transposed.push({
                category: key,
                value: total,
              });
            });
            transposed.sort((a, b) =>sortOrder === "asc" ? a.value - b.value : b.value - a.value);
            return transposed;
          };
          const transposed = transposeData(
            filteredData1,[
              "Trade Payables",
              "Short Term Borrowings",
              "Other Current Liabilities",
              "Short Term Provisions",
            ],
            "desc"
          );
          setData1(transposed);

   //KPI data
   // const fiscalYears = filteredData.map((row) => row["Fiscal Year"]);
   // // const maxYear = Math.max(
   // //   ...fiscalYears.filter((year) => !isNaN(Number(year))).map(Number)
  // );
         const extractYear = (fy: string) => {
          const match = fy.match(/\d{4}/);
          return match ? parseInt(match[0]) : NaN;
        };
        const fiscalYears = filteredData.map((row) => extractYear(row["Fiscal Year"]))
        .filter((year) => !isNaN(year));
        const maxYear = Math.max(...fiscalYears);
        const kpiDataprep = filteredData.filter(
          (row) => extractYear(row["Fiscal Year"]) === maxYear);
          
          // Prepare data for liquidity KPIs

        const liquidityDataPrep = filteredData.map(row => ({
          "Total liquidity": row["Total liquidity"],
          "Quick ratio": row["Quick ratio"],
          "Cash And Cash Equivalents": row["Cash And Cash Equivalents"],
          "Current ratio": row["Current ratio "],
          "ROCE": row["ROCE"],
          "CCC": row["CCC"],
          "Fiscal Year": row["Fiscal Year"], // Ensure Fiscal Year is included for potential charting
          })).filter(row =>row["Total liquidity"] !== undefined ||
            row["Quick ratio"] !== undefined ||
            row["CCC"] !== undefined ||
            row["Cash And Cash Equivalents"] !== undefined ||
            row["Current ratio"] !== undefined);
            const latestLiquidityData = liquidityDataPrep.filter(
              row => extractYear(row["Fiscal Year"]) === maxYear
            );
            setKpiData(latestLiquidityData);

            const cashflowColumns = [
              "Net Profit",
              "CF from Operating Activities",
              "CF from Investing Activities",
              "CF from Financing Activities",
              "Forex Gain/Loss",
              "Adj on Amalgamation/ Merger/ Demerger",
              "C&CE at the beginning of the year",
            ];
            
            const labelMap: Record<string, string> = {
              "Net Profit": "Net Profit",
              "CF from Operating Activities": "Operating Cash Flow",
              "CF from Investing Activities": "Investing Cash Flow",
              "CF from Financing Activities": "Financing Cash Flow",
              "Forex Gain/Loss": "Forex Impact",
              "Adj on Amalgamation/ Merger/ Demerger": "Adj on Amalgamation/ Merger/ Demerger",
              "C&CE at the beginning of the year": "C&CE at the beginning of the year",
            };
            
            const newWaterfallData = cashflowColumns.map((col) => {
              const total = filteredData.reduce((sum, row) => {
                const val = parseFloat(row[col]);
                return !isNaN(val) ? sum + val : sum;
              }, 0);
              return { category: labelMap[col], value: total };
            });
            
            setCashflowWaterfallData(newWaterfallData);
            
            


          }, [filteredData]); // 🔁 Re-run when filteredData changes
        const handleChartFilterChange = (filters: any) => {
          const { CategoryColumn, Category } = filters;
          const filtered1 = filteredData.filter((row) => {
            return Category ? row[CategoryColumn] === Category : true;});
            setFilteredData(filtered1); };
            console.log(filteredData);
            const RefreshData = () => {
              setFilteredData(data);};
              if (loading) return <div>Loading...</div>;
              return (
              <Layout title="Liquidity & CashFlow">
                <div className="Navigation-container">
                 {/* <nav className="nav-bar">
                     <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Over View</NavLink>
                      <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Liquidity & Cash</NavLink>
                      <NavLink to="/receivables" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Account Receivables</NavLink>
                      <NavLink to="/payables" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Account Payable</NavLink>
                      <NavLink to="/inventory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Inventory</NavLink>
                  </nav> */}
                  <button className="clear-filters-btn" onClick={RefreshData}>Clear Filters</button>
                  </div>
                  <div className="Status-cards">
                    <StatsCards data={kpiData} graphdata={filteredData} type = "liquidity"/>
                    </div>
                    <div className="Chart-row">
                      <div className="chart-container">
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                          Liquidity Trends Over Time
                        </h3>
                        <StackedBarWithLineChart
                        data={filteredData}
                        xField="Fiscal Year"
                        stackFields={[
                        "Current Investments",
                        "Inventories",
                        "Trade Receivables",
                        "Cash And Cash Equivalents",]}lineField="Current ratio "
                        onFilterChange1={handleChartFilterChange}/>
                      </div>
                      <div className="chart-container">
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                        CashFlow Breakdown
                        </h3>
                        <WaterfallChart
                        data={cashflowWaterfallData}/>
                      </div>
                        {/* <div className="chart-container">
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                        Liquidity Trends Over Time</h3>
                        <StakedBar data={filteredData} stackedFields={[
                        "Current Investments",
                        "Inventories",
                        "Trade Receivables",
                        "Cash And Cash Equivalents",
                        ]} xField="Fiscal Year"  lineField="Current ratio"/></div> */}
                    </div>
                    <div className="Chart-row">
                      <div className="chart-container">
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                          ROCE Over Time
                        </h3>
                        <LineChart
                        data={filteredData}
                        catColumn="Fiscal Year"
                        valueColumLine="ROCE"
                        />
                      </div>
                      <div className="chart-container">
                      {/* <BarChartLine
                      data={filteredData}
                  catColumn="Fiscal Year"
                  valueColum="Inventories"
                  valueColumLine="Inventory Turnover"
                  onFilterChange1={handleChartFilterChange}/> */}
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                          Liquidity Ratios Over Time
                        </h3>
                        <AmMultiAreaChart
                        data={filteredData.map(row => ({
                        year: row["Fiscal Year"], // Assuming "Fiscal Year" is the correct key
                        "Current ratio ": row["Current ratio "],
                        "Quick ratio": row["Quick ratio"],
                        "Cash ratio": row["Cash ratio"],
                      }))}
                      xField="year"
                      yFields={["Current ratio ", "Quick ratio", "Cash ratio"]}

                      />
                      </div>
                    </div>
                    <div className="Chart-row">
                      <div className="chart-container-full">
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                           Cash Flow Forecast
                        </h3>
                        <CashFlowForecastChart data={cashflowData} />
                      </div>
                    </div>
              </Layout>
              );
            };export default DashBoard2;