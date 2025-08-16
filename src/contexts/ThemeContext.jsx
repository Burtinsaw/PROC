import React, { createContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { baseColors, radii, shadows, typographyScale, lightOverrides, darkOverrides, buildCssVars } from '../theme/designTokens';
// Context nesnesi
export const ThemeContext = createContext(null);

// Tasarım token'ları temel alınarak tipografi & radius seti
const baseDesignTokens = {
  // Daha resmi görünüm: global köşe yarıçapını küçült
  shape: { borderRadius: radii.sm },
  typography: typographyScale,
  customShadows: {
    card: shadows.md,
    cardHover: shadows.lg,
    popover: shadows.lg,
    focus: '0 0 0 3px rgba(37,99,235,0.35)'
  },
  gradient: (c1, c2) => `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
};

const lightThemeOptions = {
  palette: {
    mode: 'light',
    primary: { main: baseColors.brand.primary, light: baseColors.brand.primaryAccent, dark: '#1d4ed8', contrastText: '#fff' },
    secondary: { main: baseColors.brand.secondary, light: baseColors.brand.secondaryAccent, dark: '#be185d', contrastText: '#fff' },
    success: { main: baseColors.semantic.success },
    info: { main: baseColors.semantic.info },
    warning: { main: baseColors.semantic.warning },
    error: { main: baseColors.semantic.error },
    background: { default: lightOverrides.background.base, paper: lightOverrides.background.subtle },
    divider: 'rgba(0,0,0,0.08)',
    text: { primary: '#1f2733', secondary: '#4c5563' },
    neutral: baseColors.neutral
  },
  ...baseDesignTokens,
  components: {}
};

// Dark Theme
const darkThemeOptions = {
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8', contrastText: '#0f172a' },
    secondary: { main: baseColors.brand.secondaryAccent, light: '#f9a8d4', dark: '#9d174d', contrastText: '#0f172a' },
    success: { main: baseColors.semantic.success },
    info: { main: baseColors.semantic.info },
    warning: { main: baseColors.semantic.warning },
    error: { main: baseColors.semantic.error },
    background: { default: darkOverrides.background.base, paper: darkOverrides.background.subtle },
    divider: 'rgba(255,255,255,0.08)',
    text: { primary: '#e6edf3', secondary: '#9ba5b1' },
    neutral: baseColors.neutral
  },
  ...baseDesignTokens,
  components: {}
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'dark' || savedMode === 'light') return savedMode;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    return prefersDark ? 'dark' : 'light';
  });
  const [preset, setPreset] = useState(()=> localStorage.getItem('designPreset') || 'classic'); // classic | neo | aurora | minimal | contrast
  const [density, setDensity] = useState(()=> localStorage.getItem('uiDensity') || 'comfortable'); // comfortable | compact
  // Varsayılanı küçük köşe: 'sm'
  const [corner, setCorner] = useState(()=> localStorage.getItem('cornerRadius') || 'sm'); // sm | md | lg | xl

  // Global hareket tercihi: Kullanıcı ayarı varsa OS tercihinin önüne geçer
  const [reduceMotionActive, setReduceMotionActive] = useState(() => {
    try {
      const v = localStorage.getItem('reduceMotion');
      if (v === 'true') return true;
      if (v === 'false') return false;
    } catch { /* ignore */ }
    return !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  });
  useEffect(() => {
    const sync = () => {
      try {
        const v = localStorage.getItem('reduceMotion');
        if (v === 'true') setReduceMotionActive(true);
        else if (v === 'false') setReduceMotionActive(false);
        else setReduceMotionActive(!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
      } catch { /* ignore */ }
    };
    window.addEventListener('appConfigUpdated', sync);
    return () => window.removeEventListener('appConfigUpdated', sync);
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };
  const togglePreset = () => {
    // Cycle a short list for convenience
    const order = ['classic','neo','aurora','minimal','contrast'];
    setPreset(p => {
      const idx = order.indexOf(p);
      const next = order[(idx + 1) % order.length] || 'classic';
      localStorage.setItem('designPreset', next);
      return next;
    });
  };
  const setPresetExplicit = (name) => {
    const allowed = ['classic','neo','aurora','minimal','contrast'];
    const next = allowed.includes(name) ? name : 'classic';
    setPreset(next);
    try { localStorage.setItem('designPreset', next); } catch {/* ignore */}
  };
  const setDensityExplicit = (name) => {
    const allowed = ['comfortable','compact'];
    const next = allowed.includes(name) ? name : 'comfortable';
    setDensity(next);
    try { localStorage.setItem('uiDensity', next); } catch {/* ignore */}
  };
  const setCornerExplicit = (name) => {
    const allowed = ['sm','md','lg','xl'];
    const next = allowed.includes(name) ? name : 'lg';
    setCorner(next);
    try { localStorage.setItem('cornerRadius', next); } catch {/* ignore */}
  };

  // Component overrides (her iki tema için ortak) - token kullanarak
  const componentOverrides = useMemo(() => ({
    MuiButton: {
      defaultProps: {
        size: preset === 'minimal' ? 'small' : 'medium',
        variant: preset === 'minimal' ? 'text' : (preset === 'contrast' ? 'outlined' : 'contained')
      },
      styleOverrides: {
        root: ({ theme }) => {
          const br = corner==='sm'? radii.sm : corner==='md'? radii.md : corner==='xl'? radii.xl : radii.lg;
          return ({
          borderRadius: br,
          fontWeight: 600,
          textTransform: 'none',
          paddingInline: preset==='minimal'? theme.spacing(1.25) : theme.spacing(1.75),
          boxShadow: preset==='neo'? (theme.palette.mode==='dark'? '0 8px 24px -8px rgba(0,0,0,0.8)' : '0 10px 28px -10px rgba(0,0,0,0.2)') : 'none',
          transition: 'var(--transition-base)',
          '&:hover': {
            boxShadow: preset==='minimal'? 'none' : (preset==='neo'? (theme.palette.mode==='dark'? '0 12px 36px -10px rgba(0,0,0,0.85)' : '0 14px 38px -12px rgba(0,0,0,0.24)') : shadows.sm),
            ...(preset==='aurora'?{
              backgroundImage: `linear-gradient(90deg, ${baseColors.aurora.accent[0]}, ${baseColors.aurora.accent[3]})`,
              color: '#fff'
            }: {})
          },
          '&:active': { transform: 'translateY(1px)' },
          '&:focusVisible': { boxShadow: theme.palette.mode==='dark'?'0 0 0 3px rgba(96,165,250,0.5)':'0 0 0 3px rgba(37,99,235,0.35)' }
        })}
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'var(--transition-base)',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            transform: 'translateY(-1px)'
          },
          '&:active': { transform: 'translateY(0)' }
        })
      }
    },
    MuiPaper: {
      defaultProps: { elevation: preset==='minimal' ? 0 : (preset==='neo' ? 2 : 1) },
      styleOverrides: {
        root: ({ theme }) => {
          const br = corner==='sm'? radii.sm : corner==='md'? radii.md : corner==='xl'? radii.xl : radii.lg;
          const bg = preset==='neo'
            ? (theme.palette.mode==='dark'
                ? 'linear-gradient(180deg, rgba(31,41,55,0.85), rgba(17,24,39,0.82))'
                : 'linear-gradient(180deg,#ffffff,#f9fafb)')
            : (preset==='aurora'
                ? (theme.palette.mode==='dark'
                    ? 'linear-gradient(165deg, rgba(17,24,39,0.72), rgba(17,24,39,0.55))'
                    : 'linear-gradient(165deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))')
                : undefined);
          return {
            borderRadius: br,
            backgroundImage: 'none',
            background: bg,
            transition: 'var(--transition-base)',
            boxShadow: preset==='neo'
              ? (theme.palette.mode==='dark'
                  ? '0 8px 28px -6px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)'
                  : '0 6px 24px -4px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)')
              : (preset==='aurora'
                  ? (theme.palette.mode==='dark'
                      ? '0 8px 32px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)'
                      : '0 6px 30px -6px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)')
                  : (preset==='minimal'
                      ? 'none'
                      : (theme.palette.mode==='dark'? '0 4px 18px -4px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)' : shadows.sm))),
            // İç sayfa Paper kutular için preset vurguları
            ...(preset==='contrast' ? { border: `2px solid ${theme.palette.primary.main}` } : {}),
            ...(preset==='minimal' ? { border: `1px solid ${theme.palette.divider}` } : {}),
            ...(preset==='neo' ? { borderTop: `3px solid ${theme.palette.primary.main}` } : {}),
            ...(preset==='aurora' ? { borderLeft: `3px solid ${theme.palette.secondary.main}` } : {}),
            ...(preset==='aurora'?{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }:{})
          };
        }
      }
    },
    MuiCard: {
      defaultProps: { raised: preset==='neo' },
      styleOverrides: {
        root: ({ theme }) => {
          const br = corner==='sm'? radii.sm : corner==='md'? radii.md : corner==='xl'? radii.xl : radii.lg;
          const bg = preset==='neo'
            ? (theme.palette.mode==='dark'
                ? 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))'
                : 'linear-gradient(160deg,#ffffff,#f2f6fa)')
            : (preset==='aurora'
                ? (theme.palette.mode==='dark'
                    ? 'linear-gradient(150deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))'
                    : 'linear-gradient(150deg, rgba(255,255,255,0.9), rgba(255,255,255,0.55))')
                : (preset==='minimal'
                    ? (theme.palette.mode==='dark'? 'rgba(255,255,255,0.02)' : '#fff')
                    : (theme.palette.mode==='dark' ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))' : 'linear-gradient(145deg,#fff,#f5f7fb)')));
          return {
            borderRadius: br,
            border: preset==='neo'? '1px solid transparent' : (preset==='contrast'? '2px solid' : '1px solid'),
            borderColor: preset==='neo'? 'transparent' : (preset==='contrast'? theme.palette.primary.main : (theme.palette.mode==='dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')),
            background: bg,
            boxShadow: preset==='neo'
              ? (theme.palette.mode==='dark'
                  ? '0 6px 22px -6px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)'
                  : '0 6px 22px -6px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)')
              : (preset==='aurora'
                  ? (theme.palette.mode==='dark'
                      ? '0 10px 40px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)'
                      : '0 8px 42px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)')
                  : (preset==='minimal'? 'none' : 'none')),
            transition: 'var(--transition-base)',
            ...(preset==='neo' ? { borderTop: `3px solid ${theme.palette.primary.main}` } : {}),
            ...(preset==='aurora' ? { borderLeft: `3px solid ${theme.palette.secondary.main}` } : {}),
            '&:hover': { boxShadow: preset==='neo'? (theme.palette.mode==='dark'
                ? '0 10px 32px -6px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)'
                : '0 12px 40px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)') : (preset==='aurora'? (theme.palette.mode==='dark'
                  ? '0 16px 52px -10px rgba(0,0,0,0.78), 0 0 0 1px rgba(255,255,255,0.1)'
                  : '0 16px 56px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.07)') : (preset==='minimal'? 'none' : shadows.md)) }
          };
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingBottom: theme.spacing(1),
          borderBottom: preset==='contrast' ? `2px solid ${theme.palette.primary.main}` : (preset==='minimal' ? `1px solid ${theme.palette.divider}` : 'none')
        }),
        title: () => ({
          fontWeight: preset==='contrast' ? 800 : (preset==='neo' ? 700 : 600),
          letterSpacing: preset==='neo' ? '-.01em' : undefined
        })
      }
    },
    MuiChip: {
      styleOverrides: {
        root: () => ({
          // Yuvarlak (pill) görünümü kaldır, daha köşeli tasarım
          borderRadius: radii.sm,
          fontWeight: 600,
          letterSpacing: '.25px'
        })
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backdropFilter: 'blur(14px)',
          background: theme.palette.mode==='dark' ? 'linear-gradient(135deg, rgba(24,26,31,0.92), rgba(24,26,31,0.88))' : 'linear-gradient(135deg,#ffffff,#f8fafc)',
          borderLeft: '1px solid',
          borderColor: theme.palette.divider
        })
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => {
          const br = corner==='sm'? radii.sm : corner==='md'? radii.md : corner==='xl'? radii.xl : radii.lg;
          return ({
          // İç sayfa Paper kutular için preset vurguları
          border: preset==='contrast' ? `2px solid ${theme.palette.primary.main}` : (preset==='minimal' ? `1px solid ${theme.palette.divider}` : undefined),
          ...(preset==='neo' ? { borderTop: `3px solid ${theme.palette.primary.main}` } : {}),
          ...(preset==='aurora' ? { borderLeft: `3px solid ${theme.palette.secondary.main}` } : {}),
          borderColor: theme.palette.divider,
          backgroundImage: 'none',
          backdropFilter: 'blur(18px)',
          boxShadow: theme.palette.mode==='dark' ? '0 24px 48px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)' : '0 24px 48px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05)',
          borderRadius: br
        })}
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => {
          const br = corner==='sm'? radii.sm : corner==='md'? radii.md : corner==='xl'? radii.xl : radii.lg;
          return ({
          border: '1px solid',
          borderColor: theme.palette.divider,
          background: theme.palette.mode==='dark' ? 'linear-gradient(135deg, rgba(25,30,38,0.97), rgba(25,30,38,0.92))' : 'linear-gradient(135deg,#ffffff,#f8fafc)',
          boxShadow: theme.palette.mode==='dark' ? '0 12px 32px -8px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)' : '0 12px 32px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
          borderRadius: br
        })}
      }
    },
    MuiMenu: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        paper: ({ theme }) => {
          const br = corner==='sm'? radii.sm : corner==='md'? radii.md : corner==='xl'? radii.xl : radii.lg;
          return ({
          border: '1px solid',
          borderColor: theme.palette.divider,
          boxShadow: 'none',
          backgroundImage: 'none',
          backdropFilter: 'blur(12px)',
          borderRadius: br,
          padding: theme.spacing(0.5, 0)
        })},
  list: () => ({
          padding: 0,
          '& .MuiMenuItem-root + .MuiMenuItem-root': {
            marginTop: 2
          }
        })
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: 13,
          minHeight: 36,
          padding: theme.spacing(0.75, 1.25),
          borderRadius: radii.sm,
          transition: 'var(--transition-base)',
          '&:hover': { backgroundColor: theme.palette.action.hover },
          '&:active': { backgroundColor: theme.palette.action.selected }
        })
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'var(--transition-base)',
          '&:hover': { backgroundColor: theme.palette.action.hover }
        })
      }
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'color var(--motion-duration-base) var(--motion-ease-standard)',
          '&:hover': { color: theme.palette.primary.main }
        })
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: ({ theme }) => ({
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
          fontSize: 13
        })
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => {
          const br = corner==='sm'? radii.sm : corner==='md'? radii.md : corner==='xl'? radii.xl : radii.lg;
          return ({
          borderRadius: br,
          '& .MuiOutlinedInput-notchedOutline': { transition: 'var(--transition-base)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.light },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, boxShadow: theme.palette.mode==='dark'?'0 0 0 3px rgba(59,130,246,0.35)':'0 0 0 3px rgba(37,99,235,0.25)' }
        })}
      }
    },
    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }) => {
          const headerH = density==='compact' ? 36 : 44;
          const rowH = density==='compact' ? 34 : 40;
          return ({
          border: 'none',
          '--DataGrid-containerBackground': 'transparent',
          '--DataGrid-headerHeight': `${headerH}px`,
          '--DataGrid-rowHeight': `${rowH}px`,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode==='dark' ? 'rgba(255,255,255,0.04)' : baseColors.brand.primarySoft,
            backdropFilter: 'blur(4px)',
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
            fontSize: 13,
            lineHeight: 1.1,
            letterSpacing: '.25px',
            transition: 'var(--transition-base)',
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 }
          },
          '& .MuiDataGrid-row': {
            transition: 'var(--transition-base)',
            '&:hover': { backgroundColor: theme.palette.action.hover }
          },
          '& .MuiDataGrid-cell': {
            paddingInline: theme.spacing(1.25),
            fontSize: 13
          }
        })
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => {
          const br = corner==='sm'? radii.sm : corner==='md'? radii.md : corner==='xl'? radii.xl : radii.lg;
          return ({
          background: theme.palette.mode==='dark'? 'rgba(23,30,40,0.92)' : 'rgba(255,255,255,0.95)',
          color: theme.palette.text.primary,
            border: '1px solid',
            borderColor: theme.palette.divider,
            backdropFilter: 'blur(10px)',
            boxShadow: theme.palette.mode==='dark'? '0 4px 18px -4px rgba(0,0,0,0.7)' : '0 6px 20px -6px rgba(0,0,0,0.15)',
            borderRadius: br,
            fontSize: 12,
            padding: theme.spacing(1, 1.25)
        })},
        arrow: ({ theme }) => ({ color: theme.palette.mode==='dark'? 'rgba(23,30,40,0.92)' : 'rgba(255,255,255,0.95)' })
      }
  },
  MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        ':root': {
          '--focus-ring-light': '0 0 0 3px rgba(37,99,235,0.35)',
          '--focus-ring-dark': '0 0 0 3px rgba(96,165,250,0.45)'
        },
  ':root, body': {
          '--motion-ease-standard': 'cubic-bezier(.4,0,.2,1)',
          '--motion-ease-entrance': 'cubic-bezier(.34,1.56,.64,1)',
          '--motion-ease-emph': 'cubic-bezier(.83,0,.17,1)',
          '--motion-duration-fast': '120ms',
          '--motion-duration-base': '200ms',
          '--motion-duration-slow': '320ms',
          '--app-bg-blur': '0px',
          '--app-bg-dim': '0',
          '--app-bg-image': 'none'
        },
  // Global focus ring (StrictMode: Emotion warns if selector starts with pseudo only)
  '& *:focusVisible': ({ theme }) => ({
          outline: 'none',
          boxShadow: theme.palette.mode==='dark' ? 'var(--focus-ring-dark)' : 'var(--focus-ring-light)',
          transition: 'box-shadow .15s ease'
        }),
  body: ({ theme }) => {
          const bg = {};
          if (preset === 'aurora') {
            bg.background = theme.palette.mode==='dark'
              ? 'radial-gradient(circle at 25% 15%, rgba(56,189,248,0.08), transparent 60%), radial-gradient(circle at 85% 65%, rgba(168,85,247,0.08), transparent 55%), #0f172a'
              : 'radial-gradient(circle at 30% 20%, rgba(99,102,241,0.12), transparent 60%), radial-gradient(circle at 80% 70%, rgba(14,165,233,0.12), transparent 55%), #f1f5f9';
          } else if (preset === 'neo') {
            bg.background = theme.palette.mode==='dark'
              ? 'radial-gradient(1000px 400px at 20% -10%, rgba(59,130,246,0.08), transparent 40%), #0b1220'
              : 'radial-gradient(1000px 400px at 80% 110%, rgba(59,130,246,0.12), transparent 40%), #eef2ff';
          } else if (preset === 'minimal') {
            bg.background = theme.palette.mode==='dark' ? '#0b1220' : '#fafafa';
          }
          return {
            position: 'relative',
            ...bg,
            '&::before': {
              content: '""',
              position: 'fixed',
              inset: 0,
              zIndex: -1,
              backgroundImage: 'var(--app-bg-image)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'blur(var(--app-bg-blur))',
              transform: 'scale(1.05)'
            },
            '&::after': {
              content: '""',
              position: 'fixed',
              inset: 0,
              zIndex: -1,
              background: 'rgba(0,0,0,var(--app-bg-dim))'
            },
            // Webkit scrollbars (nested under body to avoid Emotion kebab-case warnings)
            '& *::-webkit-scrollbar': { width: 10, height: 10 },
            '& *::-webkit-scrollbar-track': { background: theme.palette.mode==='dark' ? '#0f172a' : '#f1f5f9' },
            '& *::-webkit-scrollbar-thumb': {
              background: theme.palette.mode==='dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
              borderRadius: 20,
              border: '2px solid transparent',
              backgroundClip: 'content-box'
            },
            '& *::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.mode==='dark' ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.38)',
              border: '2px solid transparent',
              backgroundClip: 'content-box'
            }
          };
  },
        // Yardımcı sınıflar
        '.hide-scrollbar': {
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE/Edge */
          overscrollBehavior: 'contain',
        },
        // WebKit tabanlı tarayıcılarda scrollbar'ı tamamen gizle
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none !important',
          width: '0 !important',
          height: '0 !important',
          background: 'transparent !important'
        },
        // Ikon seti farkları (lucide & MUI SvgIcon)
        '.lucide': {
          strokeWidth: preset==='contrast' ? 2.4 : (preset==='neo' ? 2.0 : (preset==='minimal' ? 1.6 : 1.8)),
          vectorEffect: 'non-scaling-stroke'
        },
        '.MuiSvgIcon-root': {
          fontSize: preset==='contrast' ? '1.4rem' : (preset==='neo' ? '1.3rem' : (preset==='minimal' ? '1.2rem' : '1.25rem'))
        },
        ...(reduceMotionActive ? {
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              // Animasyonları minimize et ama geçişleri açık bırak (UI “efektleri” kaybolmasın)
              animationDuration: '0.001ms !important',
              animationIterationCount: '1 !important',
              scrollBehavior: 'auto !important'
            }
          }
        } : {})
      }
    }
}), [preset, density, corner, reduceMotionActive]);

  const theme = useMemo(() => {
    const selectedThemeOptions = mode === 'light' ? lightThemeOptions : darkThemeOptions;
    const t = createTheme({ ...selectedThemeOptions, components: { ...componentOverrides } });
    // Palette farklılaştırmaları
    if (preset === 'neo') {
      t.palette.background.default = mode==='dark'
        ? '#0f172a'
        : '#f1f5f9';
      t.palette.background.paper = mode==='dark'
        ? 'rgba(30,41,59,0.9)'
        : '#ffffff';
      t.palette.primary.main = '#6366f1'; // indigo-500
      t.palette.secondary.main = '#22d3ee'; // cyan-400
    }
    if (preset === 'contrast') {
      // basit bir yüksek-kontrast dokunuşu
      t.palette.text.primary = mode==='dark' ? '#ffffff' : '#0a0a0a';
      t.palette.text.secondary = mode==='dark' ? '#e5e7eb' : '#111827';
      t.palette.primary.main = mode==='dark' ? '#ffffff' : '#111111';
      t.palette.secondary.main = '#ef4444'; // kırmızı vurgular
    }
    if (preset === 'aurora') {
      t.palette.primary.main = '#a855f7'; // violet-500
      t.palette.secondary.main = '#06b6d4'; // cyan-500
    }
    if (preset === 'minimal') {
      // daha nötr bir görünüm
      t.palette.primary.main = mode==='dark' ? '#e5e7eb' : '#1f2937';
      t.palette.secondary.main = mode==='dark' ? '#9ca3af' : '#6b7280';
    }

    // Tipografi farklılaştırmaları (font-family & başlık stilleri)
    const baseSans = 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif';
    if (preset === 'neo') {
      t.typography.fontFamily = `Segoe UI, Roboto, Inter, ${baseSans}`;
      t.typography.h1 = { ...t.typography.h1, fontWeight: 800, letterSpacing: '-.02em' };
      t.typography.h2 = { ...t.typography.h2, fontWeight: 700, letterSpacing: '-.01em' };
      t.typography.button = { ...t.typography.button, fontWeight: 700 };
    } else if (preset === 'aurora') {
      t.typography.fontFamily = `Roboto, Inter, ${baseSans}`;
      t.typography.h1 = { ...t.typography.h1, fontWeight: 700 };
      t.typography.h2 = { ...t.typography.h2, fontWeight: 600 };
      t.typography.subtitle1 = { ...t.typography.subtitle1, letterSpacing: '.2px' };
    } else if (preset === 'minimal') {
      t.typography.fontFamily = `Inter, ${baseSans}`;
      t.typography.h1 = { ...t.typography.h1, fontWeight: 600 };
      t.typography.h2 = { ...t.typography.h2, fontWeight: 600 };
      t.typography.body1 = { ...t.typography.body1, letterSpacing: '.1px' };
    } else if (preset === 'contrast') {
      t.typography.fontFamily = `Segoe UI, Roboto, ${baseSans}`;
      // Başlıklarda serif kullanıp vurguyu artırıyoruz (sistem serif stack)
      const serif = 'Georgia, Cambria, "Times New Roman", Times, serif';
      t.typography.h1 = { ...t.typography.h1, fontFamily: serif, fontWeight: 800 };
      t.typography.h2 = { ...t.typography.h2, fontFamily: serif, fontWeight: 700 };
      t.typography.h3 = { ...t.typography.h3, fontFamily: serif, fontWeight: 700 };
      t.typography.button = { ...t.typography.button, fontWeight: 800 };
    } else {
      // classic
      t.typography.fontFamily = `Inter, ${baseSans}`;
    }
    t.colors = { primary: t.palette.primary.main, secondary: t.palette.secondary.main };
  t.preset = preset; // expose design preset to sx callbacks
    return t;
  }, [mode, preset, componentOverrides]);

  // CSS custom properties (root seviyesine enjekte)
  useEffect(()=>{
    const cssVarBuilder = buildCssVars(mode);
    const vars = cssVarBuilder(preset);
    const root = document.documentElement;
    Object.entries(vars).forEach(([k,v])=> root.style.setProperty(k, v));
  }, [mode, preset]);

  // Body'ye aktif preset bilgisini data attribute olarak yaz (CSS debug/kural yazımı için faydalı)
  useEffect(()=>{
    try {
      document.body.setAttribute('data-design-preset', preset);
    } catch { /* ignore */ }
  }, [preset]);

  const value = useMemo(() => ({ mode, toggleTheme, preset, togglePreset, setPreset: setPresetExplicit, density, setDensity: setDensityExplicit, corner, setCorner: setCornerExplicit, theme }), [mode, theme, preset, density, corner]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {/* Global BG CSS vars injection via inline style tag */}
        <GlobalBackgroundApplier />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook moved to useAppTheme.js to satisfy fast refresh constraint.

function GlobalBackgroundApplier(){
  const [bg, setBg] = React.useState('');
  const [blur, setBlur] = React.useState(0);
  const [dim, setDim] = React.useState(0);
  const [apply, setApply] = React.useState(false);
  React.useEffect(()=>{
    const read = () => {
      try {
        setBg(localStorage.getItem('dashboardBg') || '');
        setBlur(Number(localStorage.getItem('dashboardBgBlur') || '0') || 0);
        setDim(Number(localStorage.getItem('dashboardBgDim') || '0') || 0);
        setApply(localStorage.getItem('applyBgGlobally') === 'true');
      } catch { /* ignore */ }
    };
    read();
    const handler = ()=> read();
    window.addEventListener('appConfigUpdated', handler);
    return () => window.removeEventListener('appConfigUpdated', handler);
  }, []);
  if (!apply || !bg) return null;
  return (
    <style>
      {`body::before{content:"";position:fixed;inset:0;z-index:-2;background-image:url(${bg});background-size:cover;background-position:center;background-repeat:no-repeat;filter:blur(${blur}px);transform:scale(1.05);} body::after{content:"";position:fixed;inset:0;z-index:-1;background:rgba(0,0,0,${dim/100});}`}
    </style>
  );
}
