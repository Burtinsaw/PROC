import React, { createContext, useState, useContext, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

// Light Theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a365d',
      light: '#2d5a8a',
      dark: '#0f2027',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#e53e3e',
      light: '#fc8181',
      dark: '#c53030',
      contrastText: '#ffffff'
    },
    success: {
      main: '#38a169',
      light: '#68d391',
      dark: '#2f855a'
    },
    warning: {
      main: '#ed8936',
      light: '#fbb946',
      dark: '#dd6b20'
    },
    info: {
      main: '#3182ce',
      light: '#63b3ed',
      dark: '#2c5282'
    },
    background: {
      default: '#f7fafc',
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
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: 'none !important',
          width: '100% !important'
        }
      }
    },
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

// Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4299e1',
      light: '#63b3ed',
      dark: '#2b6cb0',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f56565',
      light: '#fc8181',
      dark: '#e53e3e',
      contrastText: '#ffffff'
    },
    success: {
      main: '#48bb78',
      light: '#68d391',
      dark: '#38a169'
    },
    warning: {
      main: '#ed8936',
      light: '#fbb946',
      dark: '#dd6b20'
    },
    info: {
      main: '#4299e1',
      light: '#63b3ed',
      dark: '#3182ce'
    },
    background: {
      default: '#1a202c',
      paper: '#2d3748'
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
      primary: '#f7fafc',
      secondary: '#a0aec0'
    },
    divider: '#4a5568'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#f7fafc'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#f7fafc'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#edf2f7'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#edf2f7'
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#edf2f7'
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#edf2f7'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#a0aec0'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#a0aec0'
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.2)',
    '0px 4px 6px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 10px 15px rgba(0, 0, 0, 0.3), 0px 4px 6px rgba(0, 0, 0, 0.2)',
    '0px 20px 25px rgba(0, 0, 0, 0.3), 0px 8px 10px rgba(0, 0, 0, 0.2)',
    '0px 25px 50px rgba(0, 0, 0, 0.4)',
    '0px 6px 10px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 8px 12px rgba(0, 0, 0, 0.3), 0px 3px 6px rgba(0, 0, 0, 0.2)',
    '0px 10px 16px rgba(0, 0, 0, 0.3), 0px 4px 8px rgba(0, 0, 0, 0.2)',
    '0px 12px 20px rgba(0, 0, 0, 0.3), 0px 5px 10px rgba(0, 0, 0, 0.2)',
    '0px 14px 24px rgba(0, 0, 0, 0.3), 0px 6px 12px rgba(0, 0, 0, 0.2)',
    '0px 16px 28px rgba(0, 0, 0, 0.3), 0px 7px 14px rgba(0, 0, 0, 0.2)',
    '0px 18px 32px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 20px 36px rgba(0, 0, 0, 0.3), 0px 9px 18px rgba(0, 0, 0, 0.2)',
    '0px 22px 40px rgba(0, 0, 0, 0.3), 0px 10px 20px rgba(0, 0, 0, 0.2)',
    '0px 24px 44px rgba(0, 0, 0, 0.3), 0px 11px 22px rgba(0, 0, 0, 0.2)',
    '0px 26px 48px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.2)',
    '0px 28px 52px rgba(0, 0, 0, 0.3), 0px 13px 26px rgba(0, 0, 0, 0.2)',
    '0px 30px 56px rgba(0, 0, 0, 0.3), 0px 14px 28px rgba(0, 0, 0, 0.2)',
    '0px 32px 60px rgba(0, 0, 0, 0.3), 0px 15px 30px rgba(0, 0, 0, 0.2)',
    '0px 34px 64px rgba(0, 0, 0, 0.3), 0px 16px 32px rgba(0, 0, 0, 0.2)',
    '0px 36px 68px rgba(0, 0, 0, 0.3), 0px 17px 34px rgba(0, 0, 0, 0.2)',
    '0px 38px 72px rgba(0, 0, 0, 0.3), 0px 18px 36px rgba(0, 0, 0, 0.2)',
    '0px 40px 76px rgba(0, 0, 0, 0.3), 0px 19px 38px rgba(0, 0, 0, 0.2)',
    '0px 42px 80px rgba(0, 0, 0, 0.3), 0px 20px 40px rgba(0, 0, 0, 0.2)'
  ],
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: 'none !important',
          width: '100% !important'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)',
          border: '1px solid #4a5568',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.3), 0px 4px 6px rgba(0, 0, 0, 0.2)',
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
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.4)',
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
          border: '1px solid #4a5568'
        }
      }
    }
  }
});

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('procurement-theme');
    return saved === 'dark';
  });

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('procurement-theme', newMode ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('procurement-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const value = {
    theme: currentTheme,
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { lightTheme, darkTheme };
export default ThemeContext;
