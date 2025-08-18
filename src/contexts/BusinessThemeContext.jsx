// Business Theme Integration
// Integrates business theme with existing Aurora preset system

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createBusinessTheme } from '../theme/businessTheme';

// Business Theme Context
const BusinessThemeContext = createContext();

export const useBusinessTheme = () => {
  const context = useContext(BusinessThemeContext);
  if (!context) {
    throw new Error('useBusinessTheme must be used within a BusinessThemeProvider');
  }
  return context;
};

// Business Theme Provider Component
export const BusinessThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const [density, setDensity] = useState('compact'); // compact, normal, comfortable
  const [businessVariant, setBusinessVariant] = useState('default'); // default, minimal, contrast

  // Load theme preferences from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('businessThemeMode');
    const savedDensity = localStorage.getItem('businessThemeDensity');
    const savedVariant = localStorage.getItem('businessThemeVariant');
    
    if (savedMode) setMode(savedMode);
    if (savedDensity) setDensity(savedDensity);
    if (savedVariant) setBusinessVariant(savedVariant);
  }, []);

  // Save theme preferences to localStorage
  useEffect(() => {
    localStorage.setItem('businessThemeMode', mode);
    localStorage.setItem('businessThemeDensity', density);
    localStorage.setItem('businessThemeVariant', businessVariant);
  }, [mode, density, businessVariant]);

  // Create theme based on current settings
  const theme = createBusinessTheme(mode, { density, variant: businessVariant });

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const changeDensity = (newDensity) => {
    setDensity(newDensity);
  };

  const changeVariant = (newVariant) => {
    setBusinessVariant(newVariant);
  };

  const value = {
    mode,
    density,
    businessVariant,
    theme,
    toggleMode,
    changeDensity,
    changeVariant
  };

  return (
    <BusinessThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </BusinessThemeContext.Provider>
  );
};

// Business Theme Settings Component
export const BusinessThemeSettings = () => {
  const { 
    mode, 
    density, 
    businessVariant, 
    toggleMode, 
    changeDensity
  } = useBusinessTheme();

  return (
    <div>
      {/* Theme settings UI would go here */}
      <p>Current mode: {mode}</p>
      <p>Current density: {density}</p>
      <p>Current variant: {businessVariant}</p>
      
      <button onClick={toggleMode}>
        Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
      </button>
      
      <button onClick={() => changeDensity('compact')}>Compact</button>
      <button onClick={() => changeDensity('normal')}>Normal</button>
      <button onClick={() => changeDensity('comfortable')}>Comfortable</button>
    </div>
  );
};

export default BusinessThemeProvider;
