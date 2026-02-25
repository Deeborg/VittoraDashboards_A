// src/theme.ts
import { createTheme, Theme } from '@mui/material/styles';

export const getAppTheme = (darkMode: boolean): Theme =>
  createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
        contrastText: darkMode ? '#121212' : '#ffffff',
      },
      secondary: {
        main: '#d32f2f',
        contrastText: darkMode ? '#121212' : '#ffffff',
      },
      background: {
        default: darkMode ? '#121212' : '#f0f2f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Segoe UI, Roboto, sans-serif',
      h4: { fontWeight: 700 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
          },
        },
      },
    },
  });
