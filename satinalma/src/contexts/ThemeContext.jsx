import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

// Temel gölge ve gradient varyantları
const baseDesignTokens = {
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", Arial, sans-serif',
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: { fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.5px' },
    h2: { fontSize: '1.95rem', fontWeight: 700, letterSpacing: '-0.5px' },
    h3: { fontSize: '1.55rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1rem', fontWeight: 600 },
    h6: { fontSize: '0.85rem', fontWeight: 600, letterSpacing: '.5px' },
    subtitle1: { fontSize: '.9rem', fontWeight: 600 },
    body1: { fontSize: '.875rem', lineHeight: 1.55 },
    body2: { fontSize: '.75rem', lineHeight: 1.6 }
  },
  customShadows: {
    primary: '0 4px 12px -2px rgba(66,153,225,0.5)',
    card: '0 4px 18px -2px rgba(0,0,0,0.12)',
    inset: 'inset 0 1px 0 0 rgba(255,255,255,0.06)'
  },
  gradient: (c1, c2) => `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
};

// Light Theme
const lightThemeOptions = {
  palette: {
    mode: 'light',
    primary: { main: '#145ac8', light: '#3d7fee', dark: '#0d3c82', contrastText: '#fff' },
    secondary: { main: '#fb5b5a', light: '#ff8080', dark: '#c42423', contrastText: '#fff' },
    success: { main: '#2e7d32' },
    info: { main: '#2684ff' },
    warning: { main: '#ed8f23' },
    error: { main: '#e53935' },
    background: { default: '#f2f5fa', paper: '#ffffff' },
    divider: 'rgba(0,0,0,0.08)',
    text: { primary: '#1f2733', secondary: '#4c5563' }
  },
  ...baseDesignTokens,
  components: {
    MuiButton: {
      styleOverrides: {
        root: () => ({
          borderRadius: 12,
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
          '&:hover': { boxShadow: '0 4px 10px rgba(0,0,0,0.18)' }
        })
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: () => ({
          backgroundImage: 'none'
        })
      }
    }
  }
};

// Dark Theme
const darkThemeOptions = {
  palette: {
    mode: 'dark',
    primary: { main: '#4aa8ff', light: '#76c0ff', dark: '#1873b9', contrastText: '#0d1117' },
    secondary: { main: '#ff6d6c', light: '#ff8f8e', dark: '#cc3130', contrastText: '#0d1117' },
    success: { main: '#4caf50' },
    info: { main: '#42a5f5' },
    warning: { main: '#ffa726' },
    error: { main: '#ef5350' },
    background: { default: '#0f1720', paper: '#19232e' },
    divider: 'rgba(255,255,255,0.08)',
    text: { primary: '#e6edf3', secondary: '#9ba5b1' }
  },
  ...baseDesignTokens,
  components: {
    MuiButton: {
      styleOverrides: {
        root: () => ({
          borderRadius: 12,
          fontWeight: 600,
          textTransform: 'none',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0))',
          '&:hover': {
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))',
            boxShadow: '0 4px 16px -2px rgba(0,0,0,0.7)'
          }
        })
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: () => ({
          backgroundImage: 'none'
        })
      }
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode === 'dark' ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => {
    const selectedThemeOptions = mode === 'light' ? lightThemeOptions : darkThemeOptions;
    const t = createTheme({ ...selectedThemeOptions });
    // Ek renk kısayolları
    t.colors = {
      primary: t.palette.primary.main,
      secondary: t.palette.secondary.main,
      success: t.palette.success.main,
      error: t.palette.error.main,
      warning: t.palette.warning.main,
      info: t.palette.info.main,
      background: t.palette.background.paper
    };
    return t;
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleTheme, theme }), [mode, theme]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
