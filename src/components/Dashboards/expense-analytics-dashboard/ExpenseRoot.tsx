import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme } from './styles/theme';

import Dashboard from './pages/Dashboard';
import DrillDown from './pages/DrillDown';
import Comparison from './pages/Comparison';
import Expenses from './pages/Expenses';

import Layout from './components/layouts/Layout';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="comparison" element={<Comparison />} />
            <Route path="drill-down" element={<DrillDown />} />
          </Route>
        </Routes>
     

    </ThemeProvider>
  );
}

export default App;