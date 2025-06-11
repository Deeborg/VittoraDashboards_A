import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

import BarChart from "../components/BarChart";
import BarChart2 from "../components/BarChart2";
import BarChartLine from "../components/BarChartLine";
import LineChart from "../components/LineChart";
import WaterfallChart from "../components/WatterfallChart";
import StatsCards from "../components/StatsCard";
// import StackedBarWithLineChart from "../components/StackedBarWithLineChart";

import "../Style/Chart1.css";
import Layout from "../components/layout"; 

const DashBoard1: React.FC = () => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [data1, setData1] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<Array<Record<string, any>>>([]);
  const [kpiData, setKpiData] = useState<Array<Record<string, any>>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/Balance Sheet.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const result: Array<Record<string, any>> = XLSX.utils.sheet_to_json(worksheet);

        setData(result);
        setFilteredData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
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
          }
        });
        return filteredRow;
      });
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
      inputData: Record<string, any>[],
      negateColumns: string[] = [],
      sortOrder: "asc" | "desc" = "desc"
    ) => {
      if (inputData.length === 0) return [];

      const keys = Object.keys(inputData[0]);
      const transposed = keys.map((key) => {
        let total = 0;
        inputData.forEach((row) => {
          let num = parseFloat(row[key]);
          if (!isNaN(num)) {
            if (negateColumns.includes(key)) num *= -1;
            total += num;
          }
        });
        return { category: key, value: total };
      });

      return transposed.sort((a, b) =>
        sortOrder === "asc" ? a.value - b.value : b.value - a.value
      );
    };

    setData1(
      transposeData(filteredData1, [
        "Trade Payables",
        "Short Term Borrowings",
        "Other Current Liabilities",
        "Short Term Provisions",
      ])
    );

    // Extract KPI data for the latest year
    const extractYear = (fy: string) => {
      const match = fy.match(/\d{4}/);
      return match ? parseInt(match[0]) : NaN;
    };

    const fiscalYears = filteredData
      .map((row) => extractYear(row["Fiscal Year"]))
      .filter((year) => !isNaN(year));
    const maxYear = Math.max(...fiscalYears);

    setKpiData(filteredData.filter((row) => extractYear(row["Fiscal Year"]) === maxYear));
  }, [filteredData]);

  const handleChartFilterChange = (filters: any) => {
    const { CategoryColumn, Category } = filters;
    const filtered = data.filter((row) =>
      Category ? row[CategoryColumn] === Category : true
    );
    setFilteredData(filtered);
  };

  const RefreshData = () => {
    setFilteredData(data);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout title="Working Capital Management">
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "32px 28px",
          margin: "32px auto",
          maxWidth: "100vw",
          minHeight: "100vh",
          height: "100%",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* <div className="Navigation-container">
          <button className="clear-filters-btn" onClick={RefreshData}>
            Clear Filters
          </button>
        </div> */}

        <StatsCards data={kpiData} graphdata={data} type="workingcapital" />

        <div className="Chart-row">
          {/* ...chart containers... */}
          <div className="chart-container">
            <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#000" }}>
              Net Working Capital Over Time
            </h3>
            <BarChart
              data={filteredData}
              Xaxis="Fiscal Year"
              Yaxis="Working capital"
              xLabel="Fiscal Year"
              yLabel="Working Capital (₹)"
              onFilterChange1={handleChartFilterChange}
            />
          </div>
          <div className="chart-container">
            <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#000" }}>
              Cash Conversion Cycle
            </h3>
            <BarChart2
              data={filteredData}
              Xaxis="Fiscal Year"
              Yaxes={["DIO", "DPO(Neg)", "DSO", "CCC"]}
              xLabel="Fiscal Year"
              yLabel="Impact"
              onFilterChange1={handleChartFilterChange}
            />
          </div>
          <div className="chart-container">
            <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#000" }}>
              Net Working Capital to Net Turnover
            </h3>
            <LineChart
              data={filteredData}
              catColumn="Fiscal Year"
              valueColumLine="NWC_TNS"
            />
          </div>
          <div className="chart-container">
            <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#000" }}>
              Inventories by Fiscal Year
            </h3>
            <BarChartLine
              data={filteredData}
              catColumn="Fiscal Year"
              valueColum="Inventories"
              valueColumLine="Inventory Turnover"
              onFilterChange1={handleChartFilterChange}
            />
          </div>
        </div>
        <div className="Chart-row">
          <div className="chart-container-full">
            <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#000" }}>
              Net Working Cpaital Breakdown
            </h3>
            <WaterfallChart
              data={data1.map((row) => ({
                category: row["category"],
                value: Number(row["value"]),
              }))}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashBoard1;
