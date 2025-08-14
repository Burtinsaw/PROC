import { useContext } from 'react';
import { ThemeContext } from './ThemeContext.jsx';

export function useAppTheme(){
  const ctx = useContext(ThemeContext);
  if(!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
