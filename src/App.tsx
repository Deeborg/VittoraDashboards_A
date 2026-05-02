import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResponsiveSidebar from "./components/sidebar";

import Home from "./components/home";
import Summary from "./components/summary";
import Chart_P1 from "./components/Chart_1";
import DashBoard1 from "./components/Chart1";
import DashBoard3 from "./components/Chart2";
import DashBoard2 from "./components/Chart3";
import KeyModulesPage from "./components/modules";
import Scenario from "./Pages/Scenario";
import BankEfficiency from "./Pages/BankEfficiency";
import Forex from "./components/Forex";
import SentimentDashboard from "./components/Sentimentanalysis";

import TrialBalanceAdmin from "./modules/trial-balance/TrialBalanceAdmin";
import DashboardPortal from "./components/DashboardPortal";

// DASHBOARD ROOTS
import SalesRoot from "./components/Dashboards/SalesAnalytics/SalesRoot";
import ExceptionRoot from "./components/Dashboards/ExceptionReporting/ExceptionRoot";
import InvestorRoot from "./components/Dashboards/InvestorRelations/InvestorRoot";
import TreasuryRoot from "./components/Dashboards/Treasury/TreasuryRoot";
import RptRoot from "./components/Dashboards/RelatedPartyTransaction/RptRoot";
import ExpenseRoot from "./components/Dashboards/expense-analytics-dashboard/ExpenseRoot";
import CompilanseRoot from "./components/Dashboards/Compilance-risk/CompilanseRoot";
import AgeRoot from "./components/Dashboards/Ageing/AgeRoot";
import LoanRoot from "./components/Dashboards/LoansBorrowing/LoanRoot";
import FixedRoot from "./components/Dashboards/FixedAssets/FixedRoot";
import DemandForecasting from "./components/Dashboards/Forecast/DemandForecasting";
import ProductionPlanning from "./components/Dashboards/Forecast/ProductionPlanning";
import ProcurementPlanning from "./components/Dashboards/Forecast/Procurement";
import InventoryManagement from "./components/Dashboards/Forecast/InventoryManagement";

import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: { mode: "light" },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
    <Router>
      <ResponsiveSidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/modules" element={<KeyModulesPage />} />
          <Route path="/flux" element={<Chart_P1 />} />
          <Route path="/dashboard" element={<DashBoard1 />} />
          <Route path="/liquidity" element={<DashBoard2 />} />
          <Route path="/receivables" element={<DashBoard3 />} />
          <Route path="/scenario" element={<Scenario />} />
          <Route path="/bankefficiency" element={<BankEfficiency/>}/>
          <Route path="/forex" element={<Forex />} />
          <Route path="/sentiment" element={<SentimentDashboard />} />
          <Route path="/trial-balance" element={<TrialBalanceAdmin />} />
          <Route path="/analytics" element={<DashboardPortal />} />
          <Route path="/analytics/sales/*" element={<SalesRoot />} />
          <Route path="/analytics/exceptions/*" element={<ExceptionRoot />} />
          <Route path="/analytics/investor/*" element={<InvestorRoot />} />
          <Route path="/analytics/treasury/*" element={<TreasuryRoot />} />
          <Route path="/analytics/rpt/*" element={<RptRoot />} />
          <Route path="/analytics/expense/*" element={<ExpenseRoot />} />
          <Route path="/analytics/risk/*" element={<CompilanseRoot />} />
          <Route path="/analytics/Ageing/*" element={<AgeRoot />} />
         <Route path="/analytics/Loans/*" element={<LoanRoot />} />
         <Route path="/analytics/assets/*" element={<FixedRoot />} />
         <Route path="/analytics/demand-forecasting" element={<DemandForecasting />} />
         <Route path="/analytics/production-planning" element={<ProductionPlanning />} />
         <Route path="/analytics/procurement-planning" element={<ProcurementPlanning />} />
         <Route path="/analytics/inventory-management" element={<InventoryManagement />} />

          {/* Add more routes as needed */}
        </Routes>
      </ResponsiveSidebar>
    </Router>
    </ThemeProvider>
  );
}