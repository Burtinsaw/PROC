import React, { useEffect } from 'react';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { CssBaseline } from '@mui/material';

export const globalTypes = {
  theme: {
    name: 'Tema',
    description: 'Uygulama tema modu',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' }
      ],
      dynamicTitle: true
    }
  }
};

export const decorators = [
  (Story, context) => {
    const mode = context.globals.theme;
    // Force ThemeProvider to pick chosen mode by seeding localStorage before mount
    useEffect(() => {
      localStorage.setItem('themeMode', mode);
    }, [mode]);
    return (
      <ThemeProvider key={mode}>
        <CssBaseline />
        <div style={{ padding: 16 }}>
          <Story />
        </div>
      </ThemeProvider>
    );
  }
];

export const parameters = {
  actions: { argTypesRegex: '^on.*' },
  controls: { expanded: true }
};
