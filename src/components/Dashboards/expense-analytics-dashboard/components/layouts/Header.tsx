import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="relative"
      sx={{
        zIndex: theme.zIndex.drawer,
        backgroundColor: '#ffffff',
        color: '#152236',
        borderBottom: '1px solid #e2e8f0',
      }}
      elevation={0}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2, color: '#3c485b' }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
        variant="h5"   
        noWrap
        component="div"
        sx={{ 
          flexGrow: 1, 
          fontWeight: 600,
          color: '#1e293b',  
        }}
      >
        Expense Analytics
      </Typography>

        
      </Toolbar>
    </AppBar>
  );
};

export default Header;