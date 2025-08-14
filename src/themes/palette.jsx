import { alpha, createTheme } from '@mui/material/styles';
import { ThemeMode, PresetColor } from '../config/config';

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

const getColors = (presetColor, mode) => {
  const colors = {
    // Primary colors for different presets
    default: mode === ThemeMode.DARK 
      ? { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5', contrastText: '#000' }
      : { main: '#1976d2', light: '#42a5f5', dark: '#1565c0', contrastText: '#fff' },
    
    blue: mode === ThemeMode.DARK
      ? { main: '#64b5f6', light: '#e3f2fd', dark: '#1976d2', contrastText: '#000' }
      : { main: '#2196f3', light: '#64b5f6', dark: '#1976d2', contrastText: '#fff' },
    
    green: mode === ThemeMode.DARK
      ? { main: '#81c784', light: '#e8f5e8', dark: '#388e3c', contrastText: '#000' }
      : { main: '#4caf50', light: '#81c784', dark: '#388e3c', contrastText: '#fff' },
    
    orange: mode === ThemeMode.DARK
      ? { main: '#ffb74d', light: '#fff3e0', dark: '#f57c00', contrastText: '#000' }
      : { main: '#ff9800', light: '#ffb74d', dark: '#f57c00', contrastText: '#fff' },
    
    purple: mode === ThemeMode.DARK
      ? { main: '#ba68c8', light: '#f3e5f5', dark: '#7b1fa2', contrastText: '#000' }
      : { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2', contrastText: '#fff' },
    
    red: mode === ThemeMode.DARK
      ? { main: '#e57373', light: '#ffebee', dark: '#d32f2f', contrastText: '#000' }
      : { main: '#f44336', light: '#e57373', dark: '#d32f2f', contrastText: '#fff' }
  };

  return colors[presetColor] || colors.default;
};

const getGreyColors = (mode) => {
  if (mode === ThemeMode.DARK) {
    return {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A50: '#121212',
      A100: '#1e1e1e',
      A200: '#2a2a2a',
      A400: '#383838',
      A700: '#4a4a4a'
    };
  }
  
  return {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A50: '#fafafb',
    A100: '#ffffff',
    A200: '#f8f9fa',
    A400: '#e9ecef',
    A700: '#dee2e6'
  };
};

export default function Palette(mode, presetColor) {
  const primaryColor = getColors(presetColor, mode);
  const greyColors = getGreyColors(mode);

  return createTheme({
    palette: {
      mode,
      common: {
        black: '#000000',
        white: '#ffffff'
      },
      primary: primaryColor,
      secondary: {
        main: mode === ThemeMode.DARK ? '#f48fb1' : '#e91e63',
        light: mode === ThemeMode.DARK ? '#f8bbd9' : '#f06292',
        dark: mode === ThemeMode.DARK ? '#c2185b' : '#ad1457',
        contrastText: mode === ThemeMode.DARK ? '#000' : '#fff'
      },
      error: {
        main: mode === ThemeMode.DARK ? '#f44336' : '#d32f2f',
        light: mode === ThemeMode.DARK ? '#e57373' : '#e53935',
        dark: mode === ThemeMode.DARK ? '#d32f2f' : '#c62828',
        contrastText: '#fff'
      },
      warning: {
        main: mode === ThemeMode.DARK ? '#ff9800' : '#ed6c02',
        light: mode === ThemeMode.DARK ? '#ffb74d' : '#ff9800',
        dark: mode === ThemeMode.DARK ? '#f57c00' : '#e65100',
        contrastText: mode === ThemeMode.DARK ? '#000' : '#fff'
      },
      info: {
        main: mode === ThemeMode.DARK ? '#29b6f6' : '#0288d1',
        light: mode === ThemeMode.DARK ? '#4fc3f7' : '#03a9f4',
        dark: mode === ThemeMode.DARK ? '#0277bd' : '#01579b',
        contrastText: '#fff'
      },
      success: {
        main: mode === ThemeMode.DARK ? '#66bb6a' : '#2e7d32',
        light: mode === ThemeMode.DARK ? '#81c784' : '#4caf50',
        dark: mode === ThemeMode.DARK ? '#388e3c' : '#1b5e20',
        contrastText: '#fff'
      },
      grey: greyColors,
      text: {
        primary: mode === ThemeMode.DARK ? alpha('#ffffff', 0.87) : greyColors[900],
        secondary: mode === ThemeMode.DARK ? alpha('#ffffff', 0.6) : greyColors[600],
        disabled: mode === ThemeMode.DARK ? alpha('#ffffff', 0.38) : greyColors[400]
      },
      background: {
        paper: mode === ThemeMode.DARK ? greyColors.A100 : '#ffffff',
        default: mode === ThemeMode.DARK ? greyColors.A50 : greyColors.A50
      },
      action: {
        active: mode === ThemeMode.DARK ? alpha('#ffffff', 0.54) : greyColors[600],
        hover: mode === ThemeMode.DARK ? alpha('#ffffff', 0.04) : alpha('#000000', 0.04),
        selected: mode === ThemeMode.DARK ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08),
        disabled: mode === ThemeMode.DARK ? alpha('#ffffff', 0.26) : alpha('#000000', 0.26),
        disabledBackground: mode === ThemeMode.DARK ? alpha('#ffffff', 0.12) : alpha('#000000', 0.12),
        focus: mode === ThemeMode.DARK ? alpha('#ffffff', 0.12) : alpha('#000000', 0.12)
      },
      divider: mode === ThemeMode.DARK ? alpha('#ffffff', 0.12) : alpha('#000000', 0.12)
    }
  });
}
