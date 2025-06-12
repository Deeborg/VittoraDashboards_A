import React, { useState, useEffect } from "react";

import "../Style/ChartBankEffi.css"
import * as XLSX from "xlsx";

import FilterComponent from "../components/FiltersBankEffi1";
import StatsCards from "../components/StatsCardsBankEffi";
import StatsCards1 from "../components/StatsCardsBankEffi1";
import HorizontalBarChartSlid from "../components/BarChartHoriSlidBankEffi1";
import HorizontalBarChartSlid1 from "../components/BarChartHoriSlidBankEffi";
import WorldBubbleMapChart from "../components/WorldMapBankEffi";
import DonetChart from "../components/PieChartBankEffi1";
import PieChart from "../components/PieChartBankEffi";
import WordCloudChart from "../components/WordCloudBankEffi";
import BubbleChart from "../components/BubblechartBankEffi";
import RadarChartComponent from "../components/RadarChartBankEffi";
import TableComponent from "../components/TableBankEffi";
import TreemapChart from "../components/TreeMapBankEffi";

const DashBoard1: React.FC = () => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<Array<Record<string, any>>>([]);
  const [GroupedStateData, setGroupedStateData] = useState<Array<Record<string, any>>>([]);
  const [GroupedPopCat, setGroupedPopCat] = useState<Array<Record<string, any>>>([]);

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/2021-04-30_ccr_var.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const result: Array<Record<string, any>> =
          XLSX.utils.sheet_to_json(worksheet);

        const transformedData = result.map((row) => {
          const code = row["BR_CODE"];
          const name = row["BRANCH_NAME"];
          const Branch_Code_Name =code+" - "+name;

          return {
            ...row,
            Branch_Code_Name
            
          };
        });

        
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
    if (!filteredData || filteredData.length === 0) return;

    const safeNumber = (val: any): number => (isNaN(Number(val)) ? 0 : Number(val));

    // Group by State Code
    type GroupData = {
      State_ID?: string;
      State?: string;
      Profit: number;
      NPA_Value: number;
      SB_Account: number;
    };

    const groupedMap = new Map<string, GroupData>();

    filteredData.forEach((item: any) => {
      const stateId = item['State Code'];
      const stateName = item['STATE'];
      const profit = safeNumber(item['prof_2021-04-30']);
      const sbAccount = safeNumber(item['sb_acc_count_2021-04-30']); 
      const npaValue = safeNumber(item['npa_val_2021-04-30']); 

      if (groupedMap.has(stateId)) {
        const existing = groupedMap.get(stateId)!;
        existing.Profit += profit;
        existing.SB_Account += sbAccount;
        existing.NPA_Value += npaValue;
      } else {
        groupedMap.set(stateId, {
          State_ID: stateId,
          State: stateName,
          Profit: profit,
          SB_Account: sbAccount,
          NPA_Value: npaValue,
        });
      }
    });

    const groupedStateArray: GroupData[] = Array.from(groupedMap.values()).sort();
    console.log('Grouped & Summed State Data:', groupedStateArray);
    setGroupedStateData(groupedStateArray);

    // Group by POPULATION_CAT
    type PopCatData = {
      Pop_Cat: string;
      Branch_Set: Set<string>;
      Employee: number;
      Loan_Value: number;
      Other_income: number;
    };

    const groupedPopCat = new Map<string, PopCatData>();

    filteredData.forEach((item: any) => {
      const popCat = item['POPULATION_CAT'];
      const branch = item['BRANCH_NAME'];
      const employee = safeNumber(item['EMP_COUNT']);
      const loan = safeNumber(item['loans_val_2021-04-30']);
      const other = safeNumber(item['oth_inc_2021-04-30']);

      if (groupedPopCat.has(popCat)) {
        const existing = groupedPopCat.get(popCat)!;
        existing.Branch_Set.add(branch);
        existing.Employee += employee;
        existing.Loan_Value += loan;
        existing.Other_income += other;
      } else {
        groupedPopCat.set(popCat, {
          Pop_Cat: popCat,
          Branch_Set: new Set([branch]),
          Employee: employee,
          Loan_Value: loan,
          Other_income: other,
        });
      }
    });

    const groupedPopCatArray = Array.from(groupedPopCat.values()).map((item) => ({
      Pop_Cat: item.Pop_Cat,
      Branch_Count: item.Branch_Set.size,
      Employee: item.Employee,
      Loan_Value: item.Loan_Value,
      Other_income: item.Other_income,
      color:
        item.Pop_Cat === 'Urban'
          ? '#FF5555'
          : item.Pop_Cat === 'Rural'
          ? '#FFFF55'
          : item.Pop_Cat === 'Semi Urban'
          ? '#FFAA33'
          : '#AA55FF', 
    })).sort();

    console.log('Grouped & Summed PopCat Data:', groupedPopCatArray);
    setGroupedPopCat(groupedPopCatArray);
  }, [filteredData]);

  const handleChartFilterChange = (filters: any) => {
  const { selectedFilter1, selectedFilter2, selectedFilter3, selectedFilter4 } = filters;

  const filtered = data.filter((row) => {
    const matchesFilter1 = selectedFilter1 ? row["STATE"] === selectedFilter1 : true;
    const matchesFilter2 = selectedFilter2 ? row["DISTRICT"] === selectedFilter2 : true;
    const matchesFilter3 = selectedFilter3 ? row["POPULATION_CAT"] === selectedFilter3 : true;
    const matchesFilter4 = selectedFilter4 ? row["Branch_Code_Name"] === selectedFilter4 : true;

    return matchesFilter1 && matchesFilter2 && matchesFilter3 && matchesFilter4;
  });

  console.log(filtered)
  setFilteredData(filtered);
};


  return (
    <div className="dashboard-container-bankeffi">        
        <div className="dashboard-header-bankeffi">   
            {/* <img src=".\asset\ajalabs.png" height={30}/>        */}
            <h1>SBU Efficiency Analysis</h1>
            <img src=".\asset\ajalabs.png" height={30}/>                     
        </div>        
        <div className="KPI-Container-bankeffi">
          <StatsCards1 data={filteredData}  />
          <div className="KPI-main-bankeffi">
            <StatsCards data={filteredData}/>
            
            <FilterComponent data={data} onFilterChange={handleChartFilterChange}/>
            
            
            <div className="chart-row-bankeffi">
              <div className="chart-column1-bankeffi">
                <h3>Efficiency Rating</h3>
                <HorizontalBarChartSlid data={filteredData} CategoryColumn={"Branch_Code_Name"} ValueColumns={['DEA_CCR','DEA_VAR']} xLabel={"Efficiency Rating"} yLabel={"Branch Name"} />
              </div>
              <div className="chart-column2-bankeffi">
                <h3>State-Wise Profit </h3>
                <WorldBubbleMapChart data={GroupedStateData} CategoryColumn={"State_ID"} CategoryColumn1={"State"} ValueColumn={"Profit"}  />
              </div>
            </div>

            
          </div>
          </div>
        <div className="KPI-Container-bankeffi">
          <div className="Chart-Container-bankeffi">
            <div className="chart-row-bankeffi">
              <div className="chart-column1_1-bankeffi">
                <h3>#Branches by Population Category</h3>
                <PieChart data={GroupedPopCat} CategoryColumn={"Pop_Cat"} ValueColumn={"Branch_Count"} />

              </div>
              <div className="chart-column2_1-bankeffi">
                <h3>#Employes by Population Category</h3>
                <DonetChart data={GroupedPopCat} CategoryColumn={"Pop_Cat"} ValueColumn={"Employee"} />

              </div>
            </div>
            <div className="chart-row-bankeffi">
              <div className="chart-column1-bankeffi">
                <h3>Branch wise Salary</h3>
                <HorizontalBarChartSlid1 data={filteredData} CategoryColumn={"Branch_Code_Name"} ValueColumns={['salary_2021-04-30']} xLabel={"Salary"} yLabel={"Branch Name"} sizeylab={450}/>
              </div>
              <div className="chart-column2-bankeffi">
                <h3>Population Category Wise Loan value</h3>
                <BubbleChart  data={GroupedPopCat} CategoryColumn={"Pop_Cat"} ValueColumn={"Loan_Value"} />
              </div>
            </div>
            <div className="chart-row-bankeffi">
              <div className="chart-column2_2-bankeffi">
                <h3>Other Income by Population Category </h3>
                <RadarChartComponent data={GroupedPopCat} CategoryColumn={"Pop_Cat"} ValueColumn={"Other_income"} />
                
              </div>
              <div className="chart-column1_2-bankeffi">
                <h3>Branch Wise Operational Expence</h3>
                <HorizontalBarChartSlid1 data={filteredData} CategoryColumn={"Branch_Code_Name"} ValueColumns={['opex_2021-04-30']} xLabel={"Operational Expence"} yLabel={"Branch Name"} sizeylab={300}/>

              </div>
            </div>
            <div className="chart-row-bankeffi">
              
              <div className="chart-column2_3-bankeffi">
                <h3>State Wise NPA Loan Value</h3>
                {/* <WordCloudChart data={GroupedStateData} CategoryColumn={"State"} ValueColumn={"NPA_Value"}/> */}
                {/* <BubbleChart  data={GroupedStateData} CategoryColumn={"State"} ValueColumn={"NPA_Value"} /> */}
                <TreemapChart data={GroupedStateData} category_column={"State"} value_column={"NPA_Value"}  />            

              </div>
              <div className="chart-column1_3-bankeffi">
                <h3>State Wise SB Account </h3>
                <WordCloudChart data={GroupedStateData} CategoryColumn={"State"} ValueColumn={"SB_Account"}/>

              </div>
            </div>

            <div className="chart-row-bankeffi">
              <div className="chart-column1_1-bankeffi">
                <h3>Summary Table</h3>
                <TableComponent data={filteredData} visibleColumns={['STATE', 'REGION_NAME', 'DISTRICT', 'POPULATION_CAT', 'Branch_Code_Name', 'comm_2021-04-30',  'int_2021-04-30', 'oth_inc_2021-04-30', 'loans_count_2021-04-30', 'loans_val_2021-04-30', 'sb_acc_count_2021-04-30', 'dep_2021-04-30', 'no_cust_2021-04-30', 'prof_2021-04-30', 'npa_count_2021-04-30', 'npa_val_2021-04-30', 'depr_2021-04-30', 'rent_2021-04-30', 'opex_2021-04-30', 'EMP_COUNT', 'salary_2021-04-30', 'DEA_CCR', 'DEA_VAR']} visibleColumnNames={['State', 'Region', 'District', 'Population Category', 'Branch Name', 'Commission', 'Interest', 'Other Income', 'Loans', 'Loan Value', 'SB Account', 'Deposit', 'Customers', 'Profit', 'NPA Loans', 'NPA Value', 'Depreciation', 'Rent', 'Operational Exp', 'Employees', 'Salary', 'DEA_CCR', 'DEA_VAR']} />
      
              </div>
              
            </div>,
          </div>
        </div>
    </div>
  );
};

export default DashBoard1;
 