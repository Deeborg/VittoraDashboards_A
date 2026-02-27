import React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box } from '@mui/material';

const ResponsiveContainer = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        width: '100%',        // ✅ allow full width
        minWidth: 0,          // ✅ FIX flexbox shrink bug
        px: isMobile ? 1 : 3,
        py: isMobile ? 1 : 2,

        // Cards should stretch, not shrink
        '& .MuiCard-root': {
          width: '100%',
        },

        // Tables responsive only on mobile
        '& .MuiTableContainer-root': {
          overflowX: isMobile ? 'auto' : 'visible',
        },
      }}
    >
      {children}
    </Box>
  );
};

export default ResponsiveContainer;