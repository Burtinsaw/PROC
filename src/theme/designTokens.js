// Yeni arayüz tasarımı için merkezi tasarım token'ları
// Buradaki değerler temalara (light/dark) inject edilir ve CSS değişkenleri olarak da sunulur.

export const baseColors = {
  brand: {
    primary: '#2563eb', // classic/neo ana marka
    primaryAccent: '#3b82f6',
    primarySoft: '#dbeafe',
    secondary: '#db2777',
    secondaryAccent: '#f472b6',
    secondarySoft: '#fce7f3'
  },
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  semantic: {
    success: '#16a34a',
    successSoft: '#dcfce7',
    warning: '#d97706',
    warningSoft: '#fef3c7',
    error: '#dc2626',
    errorSoft: '#fee2e2',
    info: '#0284c7',
    infoSoft: '#e0f2fe'
  },
  // Aurora özel renk rampası (soğuk spektrum + accent karışımı)
  aurora: {
    // Ana accent ramp (mavi → menekşe → aquamarine)
    accent: ['#4f9bff','#5d7bff','#6f5bff','#8a5bff','#a855f7','#16b4e6','#14d8c8'],
    // Yumuşak yüzey geçişlerinde kullanılacak ışık degrade start/stop
    glowFrom: 'rgba(99,163,255,0.18)',
    glowTo: 'rgba(42,12,96,0.22)',
    // Cam stroke & kenar highlight
    outline: 'rgba(255,255,255,0.22)',
    outlineSubtle: 'rgba(255,255,255,0.08)',
    // Soft background translucency katmanları
    glassLight: 'rgba(255,255,255,0.65)',
    glassDark: 'rgba(17,24,39,0.55)'
  }
};

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 22,
  pill: 999
};

export const spacing = (factor) => `${factor * 4}px`; // 4px grid

export const shadows = {
  xs: '0 1px 2px rgba(0,0,0,0.06)',
  sm: '0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 12px -2px rgba(0,0,0,0.12)',
  lg: '0 10px 28px -4px rgba(0,0,0,0.14)',
  xl: '0 18px 40px -8px rgba(0,0,0,0.18)'
};

export const transitions = {
  base: 'all .22s cubic-bezier(.4,0,.2,1)'
};

// Motion durations / easing (aurora için micro-interaction genişletmesi)
export const motion = {
  duration: {
    fast: 120,
    base: 200,
    slow: 320
  },
  easing: {
    standard: 'cubic-bezier(.4,0,.2,1)',
    entrance: 'cubic-bezier(.34,1.56,.64,1)',
    emphasised: 'cubic-bezier(.83,0,.17,1)'
  }
};

export const typographyScale = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.5px' },
  h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 },
  h3: { fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.3 },
  h4: { fontSize: '1.15rem', fontWeight: 600 },
  h5: { fontSize: '0.95rem', fontWeight: 600 },
  h6: { fontSize: '0.8rem', fontWeight: 600, letterSpacing: '.5px' },
  body1: { fontSize: '.875rem', lineHeight: 1.55 },
  body2: { fontSize: '.75rem', lineHeight: 1.6 },
  caption: { fontSize: '.675rem', lineHeight: 1.4, letterSpacing: '.3px' },
  // Ek aurora display & label katmanları (override etmeden ek) — komponentler manuel kullanacak
  displayLg: { fontSize: '2.75rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-1px' },
  displaySm: { fontSize: '2rem', fontWeight: 650, lineHeight: 1.15, letterSpacing: '-.5px' },
  titleLg: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.25 },
  titleSm: { fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.3 },
  labelSm: { fontSize: '.7rem', fontWeight: 600, letterSpacing: '.6px', textTransform: 'uppercase' },
  labelXs: { fontSize: '.6rem', fontWeight: 600, letterSpacing: '.7px', textTransform: 'uppercase' }
};

export const lightOverrides = {
  background: {
    base: '#f5f7fb',
    subtle: '#ffffff'
  }
};

export const darkOverrides = {
  background: {
    base: '#0f1720',
    subtle: '#18222e'
  }
};

export function buildCssVars(mode='light') {
  const vars = (preset='classic') => ({
    '--radius-sm': `${radii.sm}px`,
    '--radius-md': `${radii.md}px`,
    '--radius-lg': `${radii.lg}px`,
    '--shadow-md': shadows.md,
    '--transition-base': transitions.base,
    '--motion-duration-fast': `${motion.duration.fast}ms`,
    '--motion-duration-base': `${motion.duration.base}ms`,
    '--motion-duration-slow': `${motion.duration.slow}ms`,
    '--color-bg-base': mode==='dark'?darkOverrides.background.base:lightOverrides.background.base,
    '--color-bg-surface': mode==='dark'?darkOverrides.background.subtle:lightOverrides.background.subtle,
    '--color-brand-primary': baseColors.brand.primary,
    '--color-brand-secondary': baseColors.brand.secondary,
    ...(preset==='aurora'?{
      '--aurora-glass-bg': mode==='dark'? baseColors.aurora.glassDark : baseColors.aurora.glassLight,
      '--aurora-glow-from': baseColors.aurora.glowFrom,
      '--aurora-glow-to': baseColors.aurora.glowTo,
      '--aurora-outline': baseColors.aurora.outline,
      '--aurora-outline-soft': baseColors.aurora.outlineSubtle
    }: {})
  });
  return vars;
}

export default {
  baseColors,
  radii,
  spacing,
  shadows,
  transitions,
  motion,
  typographyScale,
  lightOverrides,
  darkOverrides,
  buildCssVars
};
