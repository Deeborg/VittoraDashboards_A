import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
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
      path: 'expenses',
    },
    {
      text: 'Comparison',
      icon: <CompareIcon />,
      path: 'comparison',
    },
    {
      text: 'Drill Down',
      icon: <DrillDownIcon />,
      path: 'drill-down',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
          Expense Analytics
        </Typography>
        {isMobile && (
          <ChevronLeftIcon
            onClick={onClose}
            sx={{ cursor: 'pointer', color: '#94a3b8' }}
          />
        )}
      </Box>

      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                py: 1.2,
                px: 2,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#ffffff',
                  },
                },
                '&:hover': {
                  backgroundColor: '#1e293b',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? '#ffffff' : '#94a3b8',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? '#ffffff' : '#cbd5e1',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: '#1e293b' }} />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0f172a',
          borderRight: '1px solid #1e293b',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;