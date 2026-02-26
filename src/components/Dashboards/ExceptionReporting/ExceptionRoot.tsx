import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

// Import Context & Layout
import { FilterProvider } from './contexts/FilterContext';
import AppLayout from './layouts/AppLayout';
import type { PageId } from './layouts/Sidebar';

// Import Pages
import Overview from './pages/Overview';
import ExceptionDetails from './pages/ExceptionDetails';
import ComplianceMonitoring from './pages/ComplianceMonitoring';
import InventoryRisk from './pages/InventoryRisk';
import FinancialRisk from './pages/FinancialRisk';
import Settings from './pages/Settings';

// Import the specific styles for this dashboard
import './exception-styles.css'; 

const pages: Record<PageId, React.FC> = {
  overview: Overview,
  exceptions: ExceptionDetails,
  compliance: ComplianceMonitoring,
  inventory: InventoryRisk,
  financial: FinancialRisk,
  settings: Settings,
};

const ExceptionRoot: React.FC = () => {
  // Keeps track of which sidebar tab is active
  const [activePage, setActivePage] = useState<PageId>('overview');
  const PageComponent = pages[activePage];

  return (
    // We wrap everything in this div to ensure the background color applies 
    // without breaking the rest of your Vittora app
    <div className="exception-dashboard-wrapper">
      <FilterProvider>
        <AppLayout activePage={activePage} onNavigate={setActivePage}>
          <AnimatePresence mode="wait">
            <PageComponent key={activePage} />
          </AnimatePresence>
        </AppLayout>
      </FilterProvider>
    </div>
  );
};

export default ExceptionRoot;