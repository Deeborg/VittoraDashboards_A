import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from "react-router-dom";

import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const drawerWidth = 250; // Increased from 150 to proper width

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#0a1929',
    }}>
      {/* Sidebar - Fixed width */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        drawerWidth={drawerWidth}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: sidebarOpen ? 0 : `-${drawerWidth}px`,
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
        }}
      >
        {/* Header - Fixed at top */}
        <Box sx={{ 
          flexShrink: 0,
        }}>
          <Header onMenuClick={handleMenuClick} />
        </Box>

        {/* Page Content - Scrollable */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 3,
            backgroundColor: '#0a1929',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;