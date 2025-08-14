import React from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';

/* ActionBar: Generic bulk/action toolbar */
export default function ActionBar({ count = 0, actions = [], anchor = 'top' }) {
  if (!count) return null;
  return (
    <Box
      sx={(theme)=>{
        const aurora = theme.preset==='aurora';
        const glass = aurora ? {
          backdropFilter:'blur(14px)',
          WebkitBackdropFilter:'blur(14px)',
          background: theme.palette.mode==='dark'
            ? 'linear-gradient(120deg, rgba(17,24,39,0.7), rgba(17,24,39,0.5))'
            : 'linear-gradient(120deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))',
          boxShadow: theme.palette.mode==='dark'
            ? '0 8px 32px -8px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)'
            : '0 8px 32px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)'
        } : { bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' };
        return {
          position:'sticky',
          [anchor]:0,
          zIndex: 5,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          px:2, py:1,
          borderRadius: aurora? 12:0,
          mt: aurora? 1:0,
          animation:'fadeSlide .3s var(--motion-ease, cubic-bezier(.4,0,.2,1))',
          '@keyframes fadeSlide': { from:{ opacity:0, transform:'translateY(-6px)' }, to:{ opacity:1, transform:'translateY(0)' } },
          ...glass
        };
      }}
    >
      <Typography variant="body2" sx={{ fontWeight:600 }}>Seçili: {count}</Typography>
      <Stack direction="row" gap={1}>
        {actions.map((a) => (
          <Button
            key={a.key}
            size="small"
            color={a.color || 'primary'}
            variant={a.variant || 'contained'}
            disabled={a.disabled || a.loading}
            onClick={a.onClick}
          >
            {a.loading ? '...' : a.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}
