// Modern Business ERP Theme Configuration
// Inspired by SAP Fiori, Oracle Fusion, Microsoft Dynamics

import { createTheme } from '@mui/material/styles';
import { radii } from './designTokens';

// Business Color Palette - Professional & Trustworthy
export const businessColors = {
  // Primary Business Blue (Trust, Stability)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  // Secondary Accent (Action, Energy)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4', 
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a'
  },

  // Neutral Grays (Text, Backgrounds)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db', 
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },

  // Status Colors (Semantic)
  status: {
    success: '#059669', // Green
    warning: '#d97706', // Amber  
    error: '#dc2626',   // Red
    info: '#0891b2'     // Cyan
  },

  // Business Backgrounds
  background: {
    light: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      subtle: '#f1f5f9',
      surface: '#ffffff'
    },
    dark: {
      primary: '#0f172a',
      secondary: '#1e293b', 
      subtle: '#334155',
      surface: '#1e293b'
    }
  }
};

// Business Typography Scale
export const businessTypography = {
  fontFamily: '"Inter", "Segoe UI", "Roboto", -apple-system, sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  
  // Business-optimized sizes
  h1: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em'
  },
  h2: {
    fontSize: '1.5rem', 
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.015em'
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: 600, 
    lineHeight: 1.4
  },
  h4: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  h5: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  h6: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  body1: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  body2: {
    fontSize: '0.75rem',
    fontWeight: 400, 
    lineHeight: 1.4
  },
  subtitle1: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  subtitle2: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  button: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1,
    textTransform: 'none',
    letterSpacing: '0.025em'
  },
  caption: {
    fontSize: '0.6875rem',
    fontWeight: 400,
    lineHeight: 1.3
  },
  overline: {
    fontSize: '0.625rem',
    fontWeight: 600,
    lineHeight: 1.2,
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  }
};

// Business Spacing Scale (8px grid)
export const businessSpacing = {
  xs: 4,   // 0.25rem
  sm: 8,   // 0.5rem  
  md: 12,  // 0.75rem
  lg: 16,  // 1rem
  xl: 20,  // 1.25rem
  xxl: 24, // 1.5rem
  xxxl: 32 // 2rem
};

// Business Component Overrides
export const businessComponentOverrides = {
  MuiCssBaseline: {
    styleOverrides: {
      '*': {
        boxSizing: 'border-box'
      },
      html: {
        fontSize: '14px', // Base size for dense UI
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      },
      body: {
        margin: 0,
        fontFamily: businessTypography.fontFamily
      }
    }
  },

  // Dense Table Design
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '8px 12px',
        fontSize: '0.75rem',
        borderBottom: '1px solid',
        borderBottomColor: 'rgba(224, 224, 224, 1)'
      },
      head: {
        fontWeight: 600,
        color: 'rgba(0, 0, 0, 0.87)',
        backgroundColor: '#f8fafc'
      }
    }
  },

  // Compact Cards
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radii.lg,
        border: '1px solid',
        borderColor: theme.palette.divider,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)'
        },
        transition: 'box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      })
    }
  },

  // Dense Buttons
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: radii.md,
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.75rem',
        padding: '6px 16px',
        minHeight: 32
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.12)'
        }
      }
    }
  },

  // Compact Chips
  MuiChip: {
    styleOverrides: {
      root: {
        height: 20,
        fontSize: '0.6875rem',
        fontWeight: 500,
        borderRadius: radii.sm
      },
      label: {
        padding: '0 6px'
      }
    }
  },

  // Dense Form Controls
  MuiFormControl: {
    defaultProps: {
      size: 'small',
      margin: 'dense'
    }
  },

  MuiTextField: {
    defaultProps: {
      size: 'small',
      variant: 'outlined'
    },
    styleOverrides: {
      root: {
        '& .MuiInputBase-root': {
          fontSize: '0.75rem'
        }
      }
    }
  },

  // Professional DataGrid
  MuiDataGrid: {
    styleOverrides: {
      root: ({ theme }) => ({
        border: '1px solid',
        borderColor: theme.palette.divider,
        fontSize: '0.75rem',
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#f8fafc',
          borderBottom: '2px solid',
          borderBottomColor: theme.palette.divider
        },
        '& .MuiDataGrid-cell': {
          padding: '4px 8px',
          borderBottom: '1px solid',
          borderBottomColor: 'rgba(224, 224, 224, 0.5)'
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'rgba(59, 130, 246, 0.04)'
        }
      })
    }
  }
};

// Create Business Theme Function
export const createBusinessTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: businessColors.primary[500],
        light: businessColors.primary[400],
        dark: businessColors.primary[600],
        contrastText: '#ffffff'
      },
      secondary: {
        main: businessColors.secondary[500],
        light: businessColors.secondary[400],
        dark: businessColors.secondary[600],
        contrastText: '#ffffff'
      },
      background: {
        default: isDark ? businessColors.background.dark.primary : businessColors.background.light.primary,
        paper: isDark ? businessColors.background.dark.surface : businessColors.background.light.surface
      },
      text: {
        primary: isDark ? businessColors.neutral[100] : businessColors.neutral[800],
        secondary: isDark ? businessColors.neutral[300] : businessColors.neutral[600]
      },
      divider: isDark ? businessColors.neutral[700] : businessColors.neutral[200],
      success: {
        main: businessColors.status.success
      },
      warning: {
        main: businessColors.status.warning
      },
      error: {
        main: businessColors.status.error
      },
      info: {
        main: businessColors.status.info
      }
    },
    
    typography: businessTypography,
    
    spacing: (factor) => `${businessSpacing.sm * factor}px`,
    
    shape: {
      borderRadius: radii.md
    },
    
    components: businessComponentOverrides,
    
    // Custom business tokens
    custom: {
      spacing: businessSpacing,
      colors: businessColors,
      density: 'compact',
      layout: {
        headerHeight: 56,
        sidebarWidth: 280,
        railWidth: 64
      }
    }
  });
};

export default createBusinessTheme;
