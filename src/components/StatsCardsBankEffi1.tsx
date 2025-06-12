import React from "react";
import "../Style/ChartBankEffi.css"


interface KPIProps {
  data: Record<string, any>[]; // Accept the full table with dynamic keys
   
}

const StatsCards: React.FC<KPIProps> = ({ data}) => {
  if (data.length === 0) {
    return <p>No data available for KPIs.</p>;
  }

  const SbAccount = data.reduce((sum, row) => sum + (row["sb_acc_count_2021-04-30"] || 0),0);
  const Profit = data.reduce((sum, row) => sum + (row["prof_2021-04-30"] || 0),0);
  const Loans = data.reduce((sum, row) => sum + (row["loans_count_2021-04-30"] || 0),0);
  const LoanValue = data.reduce((sum, row) => sum + (row["loans_val_2021-04-30"] || 0),0);
  const NPALoans = data.reduce((sum, row) => sum + (row["npa_count_2021-04-30"] || 0),0);
  const NPAValues = data.reduce((sum, row) => sum + (row["npa_val_2021-04-30"] || 0),0);
  const Expence = data.reduce((sum, row) => sum + (row["opex_2021-04-30"] || 0),0);

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
    <div className="stats-cards-container1-bankeffi">
      <div className="stats-cards1-bankeffi">
        <div className="stats-card1-bankeffi">
          <h4># SB Accounts</h4>
          <p>{formatAmount(SbAccount)}</p> 
        </div>
        <div className="stats-card1-bankeffi">
          <h4>Total Profit</h4>
            <p>{formatAmount(Profit)}</p>
        </div>
        <div className="stats-card1-bankeffi">
          <h4># Loans</h4>
          <p>{Loans}</p>
        </div>
        <div className="stats-card1-bankeffi">
          <h4>Loan Value</h4>
          <p>{formatAmount(LoanValue)}</p>
        </div>
        <div className="stats-card1-bankeffi">
          <h4># NPA Loans</h4>
          <p>{NPALoans}</p>
        </div>
        <div className="stats-card1-bankeffi">
          <h4>NPA Values</h4>
          <p>{formatAmount(NPAValues)}</p>
        </div>
        <div className="stats-card1-bankeffi">
          <h4>Operational Expence</h4>
          <p>{formatAmount(Expence)}</p>
        </div>

        
      </div>
    </div>
  );
};

export default StatsCards;
