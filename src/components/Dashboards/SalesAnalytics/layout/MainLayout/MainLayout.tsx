import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content-area">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default MainLayout;