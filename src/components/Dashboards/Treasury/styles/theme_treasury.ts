import { createTheme, ThemeOptions } from '@mui/material/styles';

/* ================= THEME OPTIONS ================= */

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#37474f',
      light: '#62727b',
      dark: '#102027',
    },
    success: {
      main: '#2e7d32',
      light: '#60ad5e',
      dark: '#005005',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#263238',
      secondary: '#546e7a',
    },
  },

  typography: {
    fontFamily:
      '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',

    h1: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },

    h2: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },

    h3: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },

    body1: {
      fontSize: '0.875rem',
      color: '#263238',
    },

    body2: {
      fontSize: '0.75rem',
      color: '#546e7a',
    },
  },

  components: {

    /* ================= CARDS ================= */

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },

    /* ================= PAPER ================= */

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#263238',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },

    /* ================= TABLE ================= */

    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },

    /* ================= TABLE HEADER ================= */

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
        },
      },
    },

    /* ================= TABLE CELL ================= */

    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#1f2937 !important',
          borderBottom: '1px solid #e5e7eb',
        },
        head: {
          color: '#111827 !important',
          fontWeight: 600,
          backgroundColor: '#f8fafc',
        },
        body: {
          color: '#1f2937 !important',
        },
      },
    },

    /* ================= TABLE ROW ================= */

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f1f5f9',
          },
        },
      },
    },

  },
};

/* ================= CREATE THEME ================= */

export const theme = createTheme(themeOptions);

export default theme;