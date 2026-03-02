import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  CompareArrows as CompareIcon,
  ZoomIn as DrillDownIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/analytics/expense',
    },
    {
      text: 'Expense Trends',
      icon: <TrendingUpIcon />,
      path: '/analytics/expense/expenses',
    },
    {
      text: 'Comparison',
      icon: <CompareIcon />,
      path: '/analytics/expense/comparison',
    },
    {
      text: 'Drill Down',
      icon: <DrillDownIcon />,
      path: '/analytics/expense/drill-down',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #1e293b',
          position: 'relative',
          height: '100vh',
        },
      }}
    >
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
      }}>
        {/* Logo/Brand Section */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              sx={{ 
                bgcolor: '#2563eb', 
                width: 36, 
                height: 36,
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              EA
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{  fontWeight: 600, lineHeight: 1.2 }}>
                Expense
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
                Analytics
              </Typography>
            </Box>
          </Box>
          {isMobile && (
            <ChevronLeftIcon
              onClick={onClose}
              sx={{ 
                cursor: 'pointer', 
                color: '#94a3b8',
                '&:hover': { color: '#ffffff' }
              }}
            />
          )}
        </Box>

        {/* Navigation Menu */}
        <List sx={{ flexGrow: 1, px: 1.5, py: 2 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    py: 1.2,
                    px: 1.5,
                    borderRadius: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: '#2563eb',
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#ffffff',
                        fontWeight: 600,
                      },
                    },
                    '&:hover': {
                      backgroundColor: '#1e293b',
                      '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      minWidth: 36,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? '#ffffff' : '#cbd5e1',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;