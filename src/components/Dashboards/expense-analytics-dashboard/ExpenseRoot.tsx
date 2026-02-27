import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './styles/theme';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/Dashboard';
import DrillDown from './pages/DrillDown';
import Comparison from './pages/Comparison';
import Expenses from './pages/Expenses';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics/expense" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/drill-down" element={<DrillDown />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      
    </ThemeProvider>
  );
}

export default App;