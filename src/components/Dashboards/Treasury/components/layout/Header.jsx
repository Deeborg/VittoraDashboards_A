import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton,
  useMediaQuery,
  useTheme 
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        backgroundColor: ' #182b53',
        borderBottom: '1px solid #e0e0e0',
        zIndex: (theme) => theme.zIndex.drawer + 1 
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" sx={{ mr: 2 }}>
            <MenuIcon sx={{ color: '#546e7a' }} />
          </IconButton>
        )}
        
        <Typography 
          variant={isMobile ? "h3" : "h1"}
          sx={{ 
            flexGrow: 1,
            color: '#f8f8f8',
            fontWeight: 600,
            fontSize: isMobile ? '1.1rem' : '1.5rem'
          }}
        >
        Treasury Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#546e7a',
              backgroundColor: '#f5f7fa',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: isMobile ? '0.7rem' : '0.875rem',
              display: isMobile ? 'none' : 'block'
            }}
          >
            As of: Mar 2024
          </Typography>
          
          <IconButton size="small">
            <NotificationsIcon sx={{ color: '#eff1f3', fontSize: isMobile ? 20 : 24 }} />
          </IconButton>
          
          <IconButton size="small">
            <SettingsIcon sx={{ color: '#f6f7f7', fontSize: isMobile ? 20 : 24 }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;