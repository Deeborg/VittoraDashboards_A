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
        backgroundColor: '#0a1929',
        color: '#ffffff',
        borderBottom: '1px solid #f9fbfd',
      }}
      elevation={0}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2, color: '#ffffff' }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            flexGrow: 1, 
            fontWeight: 600,
            color: '#ffffff',
          }}
        >
          Expense Analytics
        </Typography>

        
      </Toolbar>
    </AppBar>
  );
};

export default Header;