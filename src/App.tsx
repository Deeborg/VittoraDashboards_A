import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResponsiveSidebar from "./components/sidebar";
import Home from "./components/home";
import Summary from "./components/summary";
import Chart_P1 from "./components/Chart_1";
import DashBoard1 from "./components/Chart1"
import DashBoard3 from "./components/Chart2"
import DashBoard2 from "./components/Chart3";
import KeyModulesPage from "./components/modules";
import Scenario from "./Pages/Scenario";
import BankEfficiency from "./Pages/BankEfficiency";
import Forex from "./components/Forex";
import SentimentDashboard from "./components/Sentimentanalysis"

import TrialBalanceAdmin from "./modules/trial-balance/TrialBalanceAdmin";
import TrialBalanceUser from "./modules/trial-balance/TrialBalanceUser";
import TrialBalanceHome from "./modules/trial-balance/Pages/HomePage";
import DashboardPortal from "./components/DashboardPortal";

import SalesRoot from "./components/Dashboards/SalesAnalytics/SalesRoot"; 
import ExceptionRoot from './components/Dashboards/ExceptionReporting/ExceptionRoot';
import InvestorRoot from "./components/Dashboards/InvestorRelations/InvestorRoot";


import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: { mode: 'light' } // or 'dark'
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
          <Route path="/trial-balance" element={<TrialBalanceHome />} />
          <Route path="/trial-balance/admin" element={<TrialBalanceAdmin />} />
          <Route path="/trial-balance/user" element={<TrialBalanceUser />} />
          <Route path="/analytics" element={<DashboardPortal />} />
          <Route path="/analytics/sales/*" element={<SalesRoot />} />
          <Route path="/analytics/exceptions/*" element={<ExceptionRoot />} />
          <Route path="/analytics/investor/*" element={<InvestorRoot />} />
          {/* Add more routes as needed */}
        </Routes>
      </ResponsiveSidebar>
    </Router>
    </ThemeProvider>
  );
}
