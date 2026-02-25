// Sales Dashboard: router.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import SalesAnalytics from './pages/SalesAnalytics/SalesAnalytics';
import Performance from './pages/Performance/Performance';
import Customers from './pages/Customers/Customers';
import Products from './pages/Products/Products';
import Orders from './pages/Orders/Orders';
import Entities from './pages/Entities/Entities';
import Regions from './pages/Regions/Regions';
import Settings from './pages/Settings/Settings';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* This layout will now load INSIDE Vittora's ResponsiveSidebar */}
      <Route element={<MainLayout />}>
        {/* Because Vittora's path is /analytics/sales, this 'index' means /analytics/sales */}
        <Route index element={<Dashboard />} />
        
        {/* This will be /analytics/sales/sales-analytics */}
        <Route path="sales-analytics" element={<SalesAnalytics />} />
        <Route path="performance" element={<Performance />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="entities" element={<Entities />} />
        <Route path="regions" element={<Regions />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;