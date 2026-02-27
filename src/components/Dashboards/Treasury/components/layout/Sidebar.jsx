import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReportIcon from '@mui/icons-material/Report';

const menuItems = [
  { text: 'Dashboard Overview', icon: <DashboardIcon /> },
  { text: 'Net Debt Position', icon: <AccountBalanceIcon /> },
  { text: 'Borrowings & Loans', icon: <TrendingUpIcon /> },
  { text: 'Investments', icon: <BarChartIcon /> },
];

const Sidebar = ({ drawerWidth, activeModule, setActiveModule }) => {
  return (
   <Drawer
  variant="persistent"
  open={true}
  sx={{
    width: drawerWidth,
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      position: 'relative',
      backgroundColor: '#182b53',
      borderRight: '1px solid #1e3a6b',
    },
  }}
>
      {/* <Box sx={{ p: 2}}>
        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 600 }}>
          Finance Portal
        </Typography>
      </Box> */}
      
      <Divider sx={{ backgroundColor: '#1e3a6b' }} /> {/* Dark blue divider */}
      
      <List sx={{ mt: 5 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={activeModule === item.text}
              onClick={() => setActiveModule(item.text)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: '#1e3a6b', // Lighter blue for selected item
                  borderRight: '3px solid #4a90e2', // Bright blue accent border
                  '&:hover': {
                    backgroundColor: '#1e3a6b',
                  },
                },
                '&:hover': {
                  backgroundColor: '#152b4f', // Hover state
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40, 
                color: activeModule === item.text ? '#4a90e2' : '#b0c4de', // Bright blue for active, light blue for inactive
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: activeModule === item.text ? 600 : 400,
                  color: activeModule === item.text ? '#ffffff' : '#e0e8ff', // White for active, off-white for inactive
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Typography variant="body2" sx={{ color: '#b0c4de', mb: 1 }}>
          Data Classification: Confidential
        </Typography>
        <Typography variant="caption" sx={{ color: '#7e9cc2' }}>
          Version 2.4.1 • Updated Today
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;