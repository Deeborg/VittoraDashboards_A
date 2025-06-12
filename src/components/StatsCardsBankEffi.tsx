import React from "react";
import "../Style/ChartBankEffi.css"

interface KPIProps {
  data: Record<string, any>[]; // Accept the full table with dynamic keys
}

const StatsCards: React.FC<KPIProps> = ({ data }) => {
  if (data.length === 0) {
    return <p>No data available for KPIs.</p>;
  }

  // Calculate unique counts and totals dynamically
  const uniqueState = new Set(data.map((row) => row["STATE"])).size;
  const uniqueRegion = new Set(data.map((row) => row["REGION_NAME"])).size;
  const uniqueBranch = new Set(data.map((row) => row["Branch_Code_Name"])).size;
  // const uniqueEmployee = new Set(data.map((row) => row["EMP_COUNT"])).size;
  // const uniqueGrp = new Set(data.map((row) => row["Sales Group Desc"])).size;
  // const uniqueChannel = new Set(data.map((row) => row["VBAP_Sub Channel"]))
  //   .size;
  const Employee = data.reduce(
    (sum, row) => sum + (row["EMP_COUNT"] || 0),
    0
  );

  function formatAmount(amount: number): string {
    if (Math.abs(amount) >= 1e9) {
      return `${(amount / 1e9).toFixed(0)} B`; // Billion
    } else if (Math.abs(amount) >= 1e6) {
      return `${(amount / 1e6).toFixed(0)} M`; // Million
    } else if (Math.abs(amount) >= 1e3) {
      return `${(amount / 1e3).toFixed(0)} K`; // Thousand
    } else {
      return `${amount.toFixed(0)}`; // Less than 1000
    }
  }
  
  

  return (
    <div className="stats-cards-container-bankeffi">
      <div className="stats-cards-bankeffi">
        <div className="stats-card-bankeffi">
          <h4>States</h4>
          <p>{uniqueState}</p>
        </div>
        <div className="stats-card-bankeffi">
          <h4>Region</h4>
          <p>{uniqueRegion}</p>
        </div>
        <div className="stats-card-bankeffi">
          <h4>Branch</h4>
          <p>{uniqueBranch}</p>
        </div>
        <div className="stats-card-bankeffi">
          <h4>Employees</h4>
          <p>{formatAmount(Employee)}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
