import React, { useState, useEffect } from "react";

import "../Style/Chart1.css"
import * as XLSX from "xlsx";
// import BarChart from "../Components/BarChart";
import BarChart2 from "../components/BarChart2";
// import BarChartLine from "../Components/BarChartLine";
import LineChart from "../components/LineChart";
import WaterfallChart from "../components/WatterfallChart";
import StatsCards from "../components/StatsCard";
// import AreaChart from "../Components/AreaChart";
// import AreaChartam from "../Components/AreaChartam";
// import AmMultiAreaChart from "../Components/AreaChartMulti";
// import StackedBarWithLineChart from "../Components/StackedBarWithLineChart";
// import logo from '../Asset/ajalabs.png';
import "../Style/Chart1.css";
import "../Style/StatsCard.css";
import Layout from "../components/layout"; 
import StakedBar from "../components/StackedBar";

const DashBoard3: React.FC = () => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [data1, setData1] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<Array<Record<string, any>>>(
    []
  );
  const [kpiData, setKpiData] = useState<Array<Record<string, any>>>([]);
  const [liabilityWaterfallData, setLiabilityWaterfallData] = useState<Array<{ category: string, value: number }>>([]);


  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/Balance Sheet.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const result: Array<Record<string, any>> =
          XLSX.utils.sheet_to_json(worksheet);

        const transformedData = result.map((row) => row);
        setData(transformedData);
        setFilteredData(transformedData);
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

      transposed.sort((a, b) =>
        sortOrder === "asc" ? a.value - b.value : b.value - a.value
      );

      return transposed;
    };

    const transposed = transposeData(
      filteredData1,
      [
        "Trade Payables",
        "Short Term Borrowings",
        "Other Current Liabilities",
        "Short Term Provisions",
      ],
      "desc"
    );

    setData1(transposed);

    //KPI data

    const extractYear = (fy: string) => {
      const match = fy.match(/\d{4}/);
      return match ? parseInt(match[0]) : NaN;
    };
    
    const fiscalYears = filteredData
      .map((row) => extractYear(row["Fiscal Year"]))
      .filter((year) => !isNaN(year));
    
    const maxYear = Math.max(...fiscalYears);
    
    const kpiDataprep = filteredData.filter(
      (row) => extractYear(row["Fiscal Year"]) === maxYear
    );

    setKpiData(kpiDataprep);
    const liabilityColumns = [
      "Other Current Liabilities",
      "Trade Receivables",
      "Short Term Borrowings"
    ];
    
    const liabilityLabelMap: Record<string, string> = {
      "Other Current Liabilities": "Other Liabilities",
      "Trade Receivables": "Trade Receivables",
      "Short Term Borrowings": "Short Term Borrowings"
    };
    
    const liabilityData = liabilityColumns.map((col) => {
      const total = filteredData.reduce((sum, row) => {
        const val = parseFloat(row[col]);
        return !isNaN(val) ? sum + val : sum;
      }, 0);
      return { category: liabilityLabelMap[col], value: total };
    });
    
    setLiabilityWaterfallData(liabilityData);
    
  }, [filteredData]); // 🔁 Re-run when filteredData changes

  const handleChartFilterChange = (filters: any) => {
    const { CategoryColumn, Category } = filters;

    const filtered1 = filteredData.filter((row) => {
      return Category ? row[CategoryColumn] === Category : true;
    });
    setFilteredData(filtered1);
  };
  console.log(filteredData);

  const RefreshData = () => {
    setFilteredData(data);
  };

  if (loading) return <div>Loading...</div>;



  return (
    <Layout title="Account Recievables">
      <div className="Navigation-container">
      
      <button className="clear-filters-btn" onClick={RefreshData}>Clear Filters</button>
      </div>
        <div className="Status-cards">
        <StatsCards data={kpiData} graphdata={data} type= "workingcapital"/>        
        </div>

        <div className="Chart-row">
            {/* <div className="chart-container">
                  <BarChart
                data={filteredData}
                Xaxis="Fiscal Year"
                Yaxis="Working capital"
                xLabel="Fiscal Year"
                yLabel="Working capital"
                onFilterChange1={handleChartFilterChange}/>
            </div> */}
            <div className="chart-container">
              <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                 Recievables Vs Payables</h3>
                <BarChart2
                    data={filteredData}
                    Xaxis="Fiscal Year"
                    Yaxes={[
                      "Trade Payables",
                      "Trade Receivables"
                    ]}
                    xLabel="Posting Date"
                    yLabel="Impact"
                    onFilterChange1={handleChartFilterChange}
                  />
            </div>
            <div className="chart-container">
              <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                Trade Recievables contribute to Liquidity</h3>
              <WaterfallChart
              data={liabilityWaterfallData}
              />
            </div>
        </div>


        <div className="Chart-row">
            <div className="chart-container">   
            <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
            Recievables Trend over Time</h3>        
                <LineChart
                  data={filteredData}
                  catColumn="Fiscal Year"
                  valueColumLine="Trade Receivables"
                />
            </div>
            <div className="chart-container">
              <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                  Receivable & DSO Trend</h3>
              <StakedBar 
              data={filteredData} 
              stackedFields={[
                "Trade Receivables",
                "DSO",
                "DPO"
                ]} 
              xField="Fiscal Year"
              lineField="DSO "/>
            </div>   
        </div>

        <div className="Chart-row">
          {/* <div className="chart-container-full">
            <WaterfallChart
              data={data1.map((row) => ({
                category: row["category"],
                value: Number(row["value"]),
              }))}
              
            />
          </div> */}
        </div> 
    </Layout>
  );
};

export default DashBoard3;
