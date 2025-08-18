// Modern Procurement Theme
// Yeşil-turuncu tonlarında modern procurement odaklı tema

import { alpha } from '@mui/material/styles';

// Procurement Theme Color Palette
export const procurementColors = {
  // Primary: Modern yeşil tonları (procurement/supply chain'i çağrıştıran)
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5', 
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Ana yeşil
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    main: '#10b981', // Emerald-500
    light: '#34d399',
    dark: '#047857',
    contrastText: '#ffffff'
  },
  
  // Secondary: Turuncu/amber tonları (enerji ve dinamizm)
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a', 
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Ana turuncu
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    main: '#f59e0b', // Amber-500
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#ffffff'
  },

  // Accent: Modern mavi (teknoloji vurgusu)
  accent: {
    main: '#3b82f6', // Blue-500
    light: '#60a5fa',
    dark: '#1d4ed8'
  },

  // Status colors
  status: {
    success: '#10b981', // Yeşil tonları ile uyumlu
    warning: '#f59e0b', // Turuncu tonları ile uyumlu  
    error: '#ef4444',   // Red-500
    info: '#3b82f6',    // Blue-500
    pending: '#8b5cf6', // Violet-500
    approved: '#10b981',
    rejected: '#ef4444',
    draft: '#6b7280'
  },

  // Neutral grays
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
  }
};

// Procurement Theme Typography
export const procurementTypography = {
  fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em'
  },
  h2: {
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.5
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.6
  },
  body1: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6
  },
  body2: {
    fontSize: '0.8125rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.025em'
  },
  button: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    letterSpacing: '0.025em',
    textTransform: 'none'
  }
};

// Procurement Theme Spacing & Layout
export const procurementLayout = {
  borderRadius: {
    xs: '0.25rem',
    sm: '0.375rem', 
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    xxl: '2rem'
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }
};

// Modern Procurement Theme Configuration
export const createProcurementTheme = (mode = 'light', variant = 'default') => {
  const isDark = mode === 'dark';
  
  // Base palette
  const palette = {
    mode,
    primary: procurementColors.primary,
    secondary: procurementColors.secondary,
    success: { main: procurementColors.status.success },
    warning: { main: procurementColors.status.warning },
    error: { main: procurementColors.status.error },
    info: { main: procurementColors.status.info },
    
    // Background colors
    background: {
      default: isDark ? procurementColors.neutral[900] : '#ffffff',
      paper: isDark ? procurementColors.neutral[800] : '#ffffff',
      subtle: isDark ? procurementColors.neutral[850] : procurementColors.neutral[50]
    },
    
    // Text colors
    text: {
      primary: isDark ? procurementColors.neutral[100] : procurementColors.neutral[800],
      secondary: isDark ? procurementColors.neutral[300] : procurementColors.neutral[600],
      disabled: isDark ? procurementColors.neutral[500] : procurementColors.neutral[400]
    },
    
    // Divider
    divider: isDark ? procurementColors.neutral[700] : procurementColors.neutral[200],
    
    // Action colors
    action: {
      hover: isDark ? alpha(procurementColors.neutral[100], 0.08) : alpha(procurementColors.neutral[900], 0.04),
      selected: isDark ? alpha(procurementColors.primary.main, 0.16) : alpha(procurementColors.primary.main, 0.08),
      focus: alpha(procurementColors.primary.main, 0.12),
      disabled: isDark ? procurementColors.neutral[600] : procurementColors.neutral[300]
    }
  };

  // Variant-specific modifications
  if (variant === 'vibrant') {
    // Daha canlı renkler
    palette.primary.main = procurementColors.primary[400];
    palette.secondary.main = procurementColors.secondary[400];
  } else if (variant === 'subtle') {
    // Daha yumuşak renkler
    palette.primary.main = procurementColors.primary[600];
    palette.secondary.main = procurementColors.secondary[600];
  }

  return {
    palette,
    typography: procurementTypography,
    shape: {
      borderRadius: procurementLayout.borderRadius.md
    },
    spacing: 8,
    shadows: Object.values(procurementLayout.shadows),
    
    // Custom theme properties
    procurement: {
      colors: procurementColors,
      layout: procurementLayout,
      variant,
      statusColors: procurementColors.status
    }
  };
};

export default {
  procurementColors,
  procurementTypography, 
  procurementLayout,
  createProcurementTheme
};
