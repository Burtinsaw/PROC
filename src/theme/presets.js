// MUI Theme Presets
// Unified theme system for all application variants

import { createTheme } from '@mui/material/styles';
import { radii, shadows, typographyScale } from './designTokens';

/**
 * Base theme configuration shared by all presets
 */
const baseThemeConfig = {
  shape: { borderRadius: radii.md },
  typography: typographyScale,
  customShadows: {
    card: shadows.md,
    cardHover: shadows.lg,
    popover: shadows.lg,
    focus: '0 0 0 3px rgba(37,99,235,0.35)'
  }
};

/**
 * Preset definitions with their color palettes and customizations
 */
export const themePresets = {
  classic: {
    name: 'Classic',
    description: 'Klasik düzen',
    palette: {
      primary: { main: '#2563eb' },
      secondary: { main: '#7c3aed' },
      success: { main: '#059669' },
      warning: { main: '#d97706' },
      error: { main: '#dc2626' },
      info: { main: '#0891b2' }
    }
  },
  
  neo: {
    name: 'Neo',
    description: 'Modern mavi tonlar',
    palette: {
      primary: { main: '#6366f1' },
      secondary: { main: '#22d3ee' },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      info: { main: '#3b82f6' }
    }
  },
  
  aurora: {
    name: 'Aurora',
    description: 'Canlı renkler',
    palette: {
      primary: { main: '#a855f7' },
      secondary: { main: '#06b6d4' },
      success: { main: '#22c55e' },
      warning: { main: '#eab308' },
      error: { main: '#f97316' },
      info: { main: '#8b5cf6' }
    }
  },
  
  business: {
    name: 'Business',
    description: 'Kurumsal ERP tarzı',
    palette: {
      primary: { main: '#1e40af' },
      secondary: { main: '#7c2d12' },
      success: { main: '#166534' },
      warning: { main: '#a16207' },
      error: { main: '#991b1b' },
      info: { main: '#1e3a8a' }
    },
    density: 'compact',
    components: {
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: radii.sm,
            boxShadow: 'none',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 4px 12px 0 ${theme.palette.primary.main}15`
            }
          })
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radii.sm,
            textTransform: 'none',
            fontWeight: 600
          }
        }
      }
    }
  },
  
  procurement: {
    name: 'Procurement',
    description: 'Tedarik süreçleri',
    palette: {
      primary: { main: '#059669' },
      secondary: { main: '#ea580c' },
      success: { main: '#16a34a' },
      warning: { main: '#ca8a04' },
      error: { main: '#dc2626' },
      info: { main: '#0284c7' }
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: radii.md,
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.mode === 'dark' 
              ? 'rgba(6,95,70,0.05)' 
              : 'rgba(6,95,70,0.02)',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              background: theme.palette.mode === 'dark' 
                ? 'rgba(6,95,70,0.08)' 
                : 'rgba(6,95,70,0.04)'
            }
          })
        }
      }
    }
  },
  
  minimal: {
    name: 'Minimal',
    description: 'Sade tasarım',
    palette: {
      primary: { main: '#374151' },
      secondary: { main: '#6b7280' },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      info: { main: '#8b5cf6' }
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            border: 'none',
            background: 'transparent'
          }
        }
      },
      MuiButton: {
        defaultProps: {
          variant: 'text'
        },
        styleOverrides: {
          root: {
            borderRadius: radii.lg,
            textTransform: 'none'
          }
        }
      }
    }
  },
  
  contrast: {
    name: 'Contrast',
    description: 'Yüksek kontrast',
    palette: {
      primary: { main: '#000000' },
      secondary: { main: '#ffffff' },
      success: { main: '#22c55e' },
      warning: { main: '#eab308' },
      error: { main: '#ef4444' },
      info: { main: '#3b82f6' }
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: 'outlined'
        },
        styleOverrides: {
          root: () => ({
            borderWidth: '2px',
            fontWeight: 700,
            borderRadius: radii.sm,
            '&:hover': {
              borderWidth: '2px'
            }
          })
        }
      }
    }
  }
};

/**
 * Create theme with preset configuration
 */
export function createPresetTheme(mode = 'light', presetName = 'classic', options = {}) {
  const preset = themePresets[presetName] || themePresets.classic;
  const { density = 'standard', corner = 'md' } = options;
  
  // Base theme
  let theme = createTheme({
    palette: {
      mode,
      ...preset.palette,
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff'
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
        secondary: mode === 'dark' ? '#94a3b8' : '#475569'
      },
      divider: mode === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(30,41,59,0.12)'
    },
    ...baseThemeConfig,
    shape: {
      borderRadius: radii[corner] || radii.md
    }
  });

  // Apply density settings
  if (density === 'compact') {
    theme = createTheme(theme, {
      spacing: 6, // Reduced from default 8
      components: {
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: '6px 8px'
            }
          }
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              paddingTop: 4,
              paddingBottom: 4
            }
          }
        }
      }
    });
  } else if (density === 'comfortable') {
    theme = createTheme(theme, {
      spacing: 10, // Increased from default 8
      components: {
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: '12px 16px'
            }
          }
        }
      }
    });
  }

  // Apply preset-specific component overrides
  if (preset.components) {
    theme = createTheme(theme, {
      components: {
        ...theme.components,
        ...preset.components
      }
    });
  }

  return theme;
}

export default themePresets;
