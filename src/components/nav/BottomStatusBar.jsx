import React from 'react';
import { Box } from '@mui/material';
import ExchangeRatesWidget from '../ExchangeRatesWidget';
import { useBackendHealth } from '../common/HealthBanner';
import { Tooltip } from '@mui/material';

export default function BottomStatusBar({ leftOffset = 0 }) {
  const HEIGHT = 30;
  const health = useBackendHealth(20000);
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
        px: 0.75,
        gap: 0.75,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 1100
      }}
    >
      {/* Tiny health indicator at the very left (hidden on mobile) */}
      <Tooltip title={`Sistem: ${health.status || 'UNKNOWN'}`} disableInteractive>
        <Box sx={(t)=>{
          const color = health.status === 'DOWN'
            ? t.palette.error.main
            : (health.status === 'DEGRADED' ? t.palette.warning.main : t.palette.success.main);
          return {
            display: { xs: 'none', sm: 'inline-flex' },
            width: 6, height: 6, borderRadius: '50%',
            bgcolor: color,
            boxShadow: `0 0 0 2px ${t.palette.background.paper}, 0 0 6px 1px ${color}66`,
          };
        }} />
      </Tooltip>
      <ExchangeRatesWidget />
    </Box>
  );
}
