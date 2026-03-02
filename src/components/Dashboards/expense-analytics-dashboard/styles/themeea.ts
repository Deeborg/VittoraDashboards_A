import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
    },
    warning: {
      main: '#d97706',
      light: '#f59e0b',
      dark: '#b45309',
    },
    info: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    success: {
      main: '#059669',
      light: '#10b981',
      dark: '#047857',
    },
    background: {
      default: '#0a1929',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000', // Changed to pure black
      secondary: '#1e293b', // Darker gray for better visibility
      disabled: '#64748b',
    },
    divider: '#e2e8f0',
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#000000', // Pure black
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#000000',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#000000',
    },
    body1: {
      fontSize: '1rem',
      color: '#1e293b', // Dark gray
    },
    body2: {
      fontSize: '0.875rem',
      color: '#334155', // Dark gray
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#475569',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#475569',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a1929',
          color: '#1e293b',
          scrollbarColor: "#cbd5e1 #f1f5f9",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#f1f5f9",
            width: 8,
            height: 8,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#cbd5e1",
            minHeight: 24,
            border: "2px solid #f1f5f9",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#94a3b8",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#1e293b', // Dark color for all typography by default
        },
        h4: {
          color: '#000000',
        },
        h5: {
          color: '#000000',
        },
        h6: {
          color: '#000000',
        },
        body1: {
          color: '#1e293b',
        },
        body2: {
          color: '#334155',
        },
        caption: {
          color: '#475569',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e2e8f0',
          color: '#1e293b', // Dark text in table cells
          padding: '12px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#000000', // Black text for table headers
        },
        body: {
          color: '#1e293b',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        label: {
          color: 'inherit', // Use chip's own color
        },
        colorSuccess: {
          backgroundColor: '#d1fae5',
          color: '#059669', // Dark green text for better readability
        },
        colorError: {
          backgroundColor: '#fee2e2',
          color: '#b91c1c', // Darker red for better readability
        },
        colorWarning: {
          backgroundColor: '#fef3c7',
          color: '#b45309', // Darker orange for better readability
        },
        colorInfo: {
          backgroundColor: '#dbeafe',
          color: '#1e40af', // Darker blue for better readability
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          backgroundColor: '#2563eb',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1d4ed8',
          },
        },
        containedSecondary: {
          backgroundColor: '#7c3aed',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#6d28d9',
          },
        },
        outlined: {
          borderColor: '#e2e8f0',
          color: '#1e293b', // Dark text
          '&:hover': {
            borderColor: '#cbd5e1',
            backgroundColor: '#f8fafc',
          },
        },
        text: {
          color: '#1e293b',
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#475569',
          fontSize: '0.875rem',
          '&.Mui-focused': {
            color: '#2563eb',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#000000', // Black text in inputs
          fontSize: '0.875rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e8f0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cbd5e1',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563eb',
          },
        },
        input: {
          color: '#000000', // Black text in input fields
          '&::placeholder': {
            color: '#94a3b8',
            opacity: 1,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: '#000000', // Black text in select
        },
        icon: {
          color: '#64748b',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#1e293b', // Dark text in menu items
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
          '&.Mui-selected': {
            backgroundColor: '#dbeafe',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#bfdbfe',
            },
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: '#e2e8f0',
          color: '#475569', // Dark text
          '&.Mui-selected': {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          },
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#475569', // Dark icon color
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#2563eb',
          '&:hover': {
            color: '#1d4ed8',
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          color: '#475569',
        },
        separator: {
          color: '#cbd5e1',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#475569',
          '&.Mui-selected': {
            color: '#2563eb',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          color: '#1e293b', // Dark text in alerts
        },
        standardSuccess: {
          backgroundColor: '#d1fae5',
          color: '#059669',
        },
        standardError: {
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
        },
        standardWarning: {
          backgroundColor: '#fef3c7',
          color: '#b45309',
        },
        standardInfo: {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
        },
      },
    },
  },
});
