import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Container, Typography } from '@mui/material';
import { theme } from './styles/theme_treasury';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import KPICards from './components/dashboard/KPICards';
import NetDebtSummary from './components/dashboard/NetDebtSummary';
import BorrowingsDashboard from './components/dashboard/BorrowingsDashboard';
import InvestmentsDashboard from './components/dashboard/InvestmentsDashboard';
import Filters from './components/common/Filters';

/* ================= TYPES ================= */

type ModuleType =
  | 'Dashboard Overview'
  | 'Net Debt Position'
  | 'Borrowings & Loans'
  | 'Investments'
  | 'Cash Flow'
  | 'Reports';

interface FiltersType {
  month: string;
  loanType: string;
  investmentType: string;
}

const App: React.FC = () => {
  const drawerWidth: number = 240;

  const [activeModule, setActiveModule] =
    useState<ModuleType>('Dashboard Overview');

  const [filters, setFilters] = useState<FiltersType>({
    month: 'Mar 2024',
    loanType: 'all',
    investmentType: 'all',
  });

  const handleFilterChange = (
    field: keyof FiltersType | 'reset',
    value?: string
  ): void => {
    if (field === 'reset') {
      setFilters({
        month: 'Mar 2024',
        loanType: 'all',
        investmentType: 'all',
      });
    } else if (value !== undefined) {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const renderModule = (): React.ReactNode => {
    switch (activeModule) {
      case 'Net Debt Position':
        return <NetDebtSummary />;

      case 'Borrowings & Loans':
        return <BorrowingsDashboard />;

      case 'Investments':
        return <InvestmentsDashboard />;

      // case 'Cash Flow':
      //   return (
      //     <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
      //       <Typography variant="h2" sx={{ mb: 2, color: '#1a237e' }}>
      //         Cash Flow Analysis
      //       </Typography>
      //       <Typography variant="body1" sx={{ color: '#546e7a', mb: 2 }}>
      //         This module provides detailed cash flow statements, operating cash analysis, and liquidity forecasting.
      //       </Typography>
      //       <Box sx={{ p: 4, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px dashed #e0e0e0' }}>
      //         <Typography variant="body2" sx={{ color: '#90a4ae' }}>
      //           Cash Flow Analysis will be implemented in Phase 2
      //         </Typography>
      //       </Box>
      //     </Box>
      //   );

      // case 'Reports':
      //   return (
      //     <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
      //       <Typography variant="h2" sx={{ mb: 2, color: '#1a237e' }}>
      //         Financial Reports
      //       </Typography>
      //       <Typography variant="body1" sx={{ color: '#546e7a', mb: 2 }}>
      //         Generate comprehensive treasury reports including debt schedules, investment summaries, and compliance documents.
      //       </Typography>
      //       <Box sx={{ p: 4, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px dashed #e0e0e0' }}>
      //         <Typography variant="body2" sx={{ color: '#90a4ae' }}>
      //           Reports module will be implemented in Phase 2
      //         </Typography>
      //       </Box>
      //     </Box>
      //   );

      default:
        return (
          <>
            <KPICards />
            <Box sx={{ mb: 4 }}>
              <NetDebtSummary />
            </Box>
            <Box sx={{ mb: 4 }}>
              <BorrowingsDashboard />
            </Box>
            <Box sx={{ mb: 4 }}>
              <InvestmentsDashboard />
            </Box>
          </>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: 'flex' }}>
        {/* <Header title="Treasury Management Console" /> */}

        <Sidebar
          drawerWidth={drawerWidth}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            // mt: '64px',
            backgroundColor: 'background.default',
            minHeight: '100vh',
          }}
        >
          <Container maxWidth="xl" disableGutters>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h1" sx={{ color: '#1a237e', mb: 0.5 }}>
                {activeModule === 'Dashboard Overview'
                  ? 'Treasury Management Console'
                  : activeModule}
              </Typography>

              <Typography variant="body2" sx={{ color: '#000000' }}>
                {activeModule === 'Dashboard Overview'
                  ? 'Consolidated view of debt, investments, and liquidity positions as of March 2024'
                  : `Detailed analysis of ${activeModule.toLowerCase()}`}
              </Typography>
            </Box>

            {activeModule === 'Dashboard Overview' && (
              <Filters filters={filters} onFilterChange={handleFilterChange} />
            )}

            {renderModule()}

            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="caption" sx={{ color: '#90a4ae' }}>
                Data Source: SAP ERP, TMS | Last Updated: Today 09:42 IST |
                Prepared by: Treasury Operations | Classification: Internal Use Only
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;