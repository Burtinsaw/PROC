import React, { createContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { APP_HEADER_HEIGHT, APP_HEADER_GAP } from '../constants/layout';
import { createPresetTheme } from '../theme/presets';

// Context nesnesi
export const ThemeContext = createContext(null);

/**
 * Unified Theme Provider
 * MUI standartlarında merkezi theme yönetimi
 */
export const ThemeProvider = ({ children }) => {
  // Theme state
  const [mode, setMode] = useState('light');
  const [preset, setPreset] = useState('classic');
  const [density, setDensity] = useState('standard');
  const [corner, setCorner] = useState('md');

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('themeMode');
      const savedPreset = localStorage.getItem('designPreset');
      const savedDensity = localStorage.getItem('uiDensity');
      const savedCorner = localStorage.getItem('cornerRadius');

      if (savedMode && ['light', 'dark'].includes(savedMode)) {
        setMode(savedMode);
      }
      if (savedPreset) {
        setPreset(savedPreset);
      }
      if (savedDensity) {
        setDensity(savedDensity);
      }
      if (savedCorner) {
        setCorner(savedCorner);
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }, []);

  // Create the actual MUI theme
  const theme = useMemo(() => {
    const baseTheme = createPresetTheme(mode, preset, { density, corner });
    
    // Add CSS variables for header and layout
    const cssVars = {
      '--app-header-h': `${APP_HEADER_HEIGHT.xs}px`,
      '--app-header-gap': `${APP_HEADER_GAP}px`,
      '--transition-base': 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      '--motion-duration-base': '200ms',
      '--motion-ease-standard': 'cubic-bezier(0.4, 0, 0.2, 1)'
    };

    return {
      ...baseTheme,
      cssVars,
      // Add custom properties to theme
      appSettings: {
        mode,
        preset,
        density,
        corner
      }
    };
  }, [mode, preset, density, corner]);

  // Theme control functions
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const togglePreset = () => {
    const presets = ['classic', 'neo', 'aurora', 'business', 'procurement', 'minimal', 'contrast'];
    setPreset(currentPreset => {
      const currentIndex = presets.indexOf(currentPreset);
      const nextIndex = (currentIndex + 1) % presets.length;
      const nextPreset = presets[nextIndex];
      localStorage.setItem('designPreset', nextPreset);
      return nextPreset;
    });
  };

  const setPresetExplicit = (presetName) => {
    const validPresets = ['classic', 'neo', 'aurora', 'business', 'procurement', 'minimal', 'contrast'];
    if (validPresets.includes(presetName)) {
      setPreset(presetName);
      localStorage.setItem('designPreset', presetName);
    }
  };

  const setDensityExplicit = (densityName) => {
    const validDensities = ['compact', 'standard', 'comfortable'];
    if (validDensities.includes(densityName)) {
      setDensity(densityName);
      localStorage.setItem('uiDensity', densityName);
    }
  };

  const setCornerExplicit = (cornerName) => {
    const validCorners = ['sm', 'md', 'lg', 'xl'];
    if (validCorners.includes(cornerName)) {
      setCorner(cornerName);
      localStorage.setItem('cornerRadius', cornerName);
    }
  };

  // Context value
  const value = useMemo(() => ({
    // Current settings
    mode,
    preset,
    density,
    corner,
    theme,
    
    // Control functions
    toggleTheme,
    togglePreset,
    setPreset: setPresetExplicit,
    setDensity: setDensityExplicit,
    setCorner: setCornerExplicit
  }), [mode, preset, density, corner, theme]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {/* Inject CSS variables globally */}
        <style>
          {`:root {
            ${Object.entries(theme.cssVars || {})
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n')}
          }`}
        </style>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Background applier for global settings
function GlobalBackgroundApplier() {
  const [bg, setBg] = React.useState('');
  const [blur, setBlur] = React.useState(0);
  const [dim, setDim] = React.useState(0);
  const [apply, setApply] = React.useState(false);
  
  React.useEffect(() => {
    const read = () => {
      try {
        setBg(localStorage.getItem('dashboardBg') || '');
        setBlur(Number(localStorage.getItem('dashboardBgBlur') || '0') || 0);
        setDim(Number(localStorage.getItem('dashboardBgDim') || '0') || 0);
        setApply(localStorage.getItem('applyBgGlobally') === 'true');
      } catch { /* ignore */ }
    };
    read();
    const handler = () => read();
    window.addEventListener('appConfigUpdated', handler);
    return () => window.removeEventListener('appConfigUpdated', handler);
  }, []);
  
  if (!apply || !bg) return null;
  
  return (
    <style>
      {`
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('${bg}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(${blur}px) brightness(${1 - dim / 100});
          z-index: -1000;
          pointer-events: none;
        }
      `}
    </style>
  );
}

export default ThemeProvider;
