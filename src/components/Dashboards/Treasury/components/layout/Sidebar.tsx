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
import BarChartIcon from '@mui/icons-material/BarChart';

/* ================= TYPES ================= */

type ModuleType =
  | 'Dashboard Overview'
  | 'Net Debt Position'
  | 'Borrowings & Loans'
  | 'Investments'
  | 'Cash Flow'
  | 'Reports';

interface SidebarProps {
  drawerWidth: number;
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

interface MenuItem {
  text: ModuleType;
  icon: React.ReactNode;
}

/* ================= MENU ITEMS ================= */

const menuItems: MenuItem[] = [
  { text: 'Dashboard Overview', icon: <DashboardIcon /> },
  { text: 'Net Debt Position', icon: <AccountBalanceIcon /> },
  { text: 'Borrowings & Loans', icon: <TrendingUpIcon /> },
  { text: 'Investments', icon: <BarChartIcon /> },
];

/* ================= COMPONENT ================= */

const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  activeModule,
  setActiveModule,
}) => {
  return (
    <Drawer
      variant="persistent"
      open
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          position: 'relative',
          backgroundColor: '#182b53',
          borderRight: '1px solid #1e3a6b',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Divider sx={{ backgroundColor: '#1e3a6b' }} />

      <List sx={{ mt: 5 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={activeModule === item.text}
              onClick={() => setActiveModule(item.text)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: '#1e3a6b',
                  borderRight: '3px solid #4a90e2',
                },
                '&:hover': {
                  backgroundColor: '#152b4f',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color:
                    activeModule === item.text
                      ? '#4a90e2'
                      : '#b0c4de',
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight:
                    activeModule === item.text ? 600 : 400,
                  color:
                    activeModule === item.text
                      ? '#ffffff'
                      : '#e0e8ff',
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