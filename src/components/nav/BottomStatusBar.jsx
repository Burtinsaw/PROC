import React from 'react';
import { Box } from '@mui/material';
import ExchangeRatesWidget from '../ExchangeRatesWidget';

export default function BottomStatusBar({ leftOffset = 0 }) {
  const HEIGHT = 30;
  return (
    <Box
      role="contentinfo"
      aria-label="Kurlar ve saatler"
      sx={{
        position: 'fixed',
        left: { xs: 0, lg: leftOffset },
        right: 0,
        bottom: 0,
        height: HEIGHT,
        display: 'flex',
        alignItems: 'center',
        px: 1,
        gap: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 1100
      }}
    >
      <ExchangeRatesWidget />
    </Box>
  );
}
