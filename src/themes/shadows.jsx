import { alpha } from '@mui/material/styles';

// ==============================|| DEFAULT THEME - CUSTOM SHADOWS ||============================== //

export default function CustomShadows(theme) {
  return {
    button: `0 2px 4px ${alpha(theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.grey[900], 0.15)}`,
    text: `0 -1px 0 ${theme.palette.grey[700]}`,
    z1: `0px 2px 8px ${alpha(theme.palette.grey[900], 0.15)}`,
    z8: alpha(theme.palette.grey[900], 0.15),
    z12: alpha(theme.palette.grey[900], 0.25),
    z16: alpha(theme.palette.grey[900], 0.3),
    z20: alpha(theme.palette.grey[900], 0.4),
    z24: alpha(theme.palette.grey[900], 0.45)
  };
}
