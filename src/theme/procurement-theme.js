import { createTheme } from '@mui/material/styles';

// Modern Procurement System Theme
const procurementTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a365d', // Deep navy blue
      light: '#2d5a8a',
      dark: '#0f2027',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#e53e3e', // Professional red
      light: '#fc8181',
      dark: '#c53030',
      contrastText: '#ffffff'
    },
    success: {
      main: '#38a169', // Professional green
      light: '#68d391',
      dark: '#2f855a'
    },
    warning: {
      main: '#ed8936', // Orange
      light: '#fbb946',
      dark: '#dd6b20'
    },
    info: {
      main: '#3182ce', // Blue
      light: '#63b3ed',
      dark: '#2c5282'
    },
    background: {
      default: '#f7fafc', // Light gray
      paper: '#ffffff'
    },
    grey: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923'
    },
    text: {
      primary: '#2d3748',
      secondary: '#4a5568'
    },
    divider: '#e2e8f0'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#1a365d'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1a365d'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2d3748'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2d3748'
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2d3748'
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2d3748'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#4a5568'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#4a5568'
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 8px 10px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 6px 10px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 8px 12px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.06)',
    '0px 10px 16px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.06)',
    '0px 12px 20px rgba(0, 0, 0, 0.1), 0px 5px 10px rgba(0, 0, 0, 0.06)',
    '0px 14px 24px rgba(0, 0, 0, 0.1), 0px 6px 12px rgba(0, 0, 0, 0.06)',
    '0px 16px 28px rgba(0, 0, 0, 0.1), 0px 7px 14px rgba(0, 0, 0, 0.06)',
    '0px 18px 32px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.06)',
    '0px 20px 36px rgba(0, 0, 0, 0.1), 0px 9px 18px rgba(0, 0, 0, 0.06)',
    '0px 22px 40px rgba(0, 0, 0, 0.1), 0px 10px 20px rgba(0, 0, 0, 0.06)',
    '0px 24px 44px rgba(0, 0, 0, 0.1), 0px 11px 22px rgba(0, 0, 0, 0.06)',
    '0px 26px 48px rgba(0, 0, 0, 0.1), 0px 12px 24px rgba(0, 0, 0, 0.06)',
    '0px 28px 52px rgba(0, 0, 0, 0.1), 0px 13px 26px rgba(0, 0, 0, 0.06)',
    '0px 30px 56px rgba(0, 0, 0, 0.1), 0px 14px 28px rgba(0, 0, 0, 0.06)',
    '0px 32px 60px rgba(0, 0, 0, 0.1), 0px 15px 30px rgba(0, 0, 0, 0.06)',
    '0px 34px 64px rgba(0, 0, 0, 0.1), 0px 16px 32px rgba(0, 0, 0, 0.06)',
    '0px 36px 68px rgba(0, 0, 0, 0.1), 0px 17px 34px rgba(0, 0, 0, 0.06)',
    '0px 38px 72px rgba(0, 0, 0, 0.1), 0px 18px 36px rgba(0, 0, 0, 0.06)',
    '0px 40px 76px rgba(0, 0, 0, 0.1), 0px 19px 38px rgba(0, 0, 0, 0.06)',
    '0px 42px 80px rgba(0, 0, 0, 0.1), 0px 20px 40px rgba(0, 0, 0, 0.06)'
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out'
        },
        contained: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07)',
          '&:hover': {
            boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f0'
        }
      }
    }
  }
});

export default procurementTheme;
