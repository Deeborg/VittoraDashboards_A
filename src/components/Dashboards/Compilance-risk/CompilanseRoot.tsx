import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { NavigationProvider } from './context/NavigationContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import GlobalStyles from './styles/Gs';
import { theme } from './styles/theme_cr';

// Import pages
import Dashboard from './pages/Dashboard';
import AuditTrail from './pages/AuditTrail';
import SODViolations from './pages/SODViolations';
import FraudDetection from './pages/FraudDetection';
import SAPAccessControl from './pages/SAPAccessControl';
import StatutoryFilings from './pages/StatutoryFilings';
import InternalAuditPoints from './pages/InternalAuditPoints';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.colors.gray[50]};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const App: React.FC = () => {
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/audit-trail': return 'Audit Trail';
      case '/sod-violations': return 'SOD Violations';
      case '/fraud-detection': return 'Fraud Detection';
      case '/sap-access': return 'SAP Access Control';
      case '/statutory-filings': return 'Statutory Filings';
      case '/audit-points': return 'Internal Audit Points';
      default: return 'Compliance Dashboard';
    }
  };

  return (
    <ThemeProvider theme={theme}>
     
        <DataProvider>
          <NavigationProvider>
            <GlobalStyles />
            <AppContainer>
              <Sidebar />
              <MainContent>
                <Routes>
                  <Route path="/" element={<><Header pageTitle={getPageTitle('/')} /><ContentArea><Dashboard /></ContentArea></>} />
                  <Route path="/audit-trail" element={<><Header pageTitle={getPageTitle('/audit-trail')} /><ContentArea><AuditTrail /></ContentArea></>} />
                  <Route path="/sod-violations" element={<><Header pageTitle={getPageTitle('/sod-violations')} /><ContentArea><SODViolations /></ContentArea></>} />
                  <Route path="/fraud-detection" element={<><Header pageTitle={getPageTitle('/fraud-detection')} /><ContentArea><FraudDetection /></ContentArea></>} />
                  <Route path="/sap-access" element={<><Header pageTitle={getPageTitle('/sap-access')} /><ContentArea><SAPAccessControl /></ContentArea></>} />
                  <Route path="/statutory-filings" element={<><Header pageTitle={getPageTitle('/statutory-filings')} /><ContentArea><StatutoryFilings /></ContentArea></>} />
                  <Route path="/audit-points" element={<><Header pageTitle={getPageTitle('/audit-points')} /><ContentArea><InternalAuditPoints /></ContentArea></>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainContent>
            </AppContainer>
          </NavigationProvider>
        </DataProvider>
     
    </ThemeProvider>
  );
};

export default App;