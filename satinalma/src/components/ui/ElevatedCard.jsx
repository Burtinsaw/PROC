import React from 'react';
import { Card, Box } from '@mui/material';

/*
  ElevatedCard: Kurumsal dashboard kartları için tek tip stil.
  Props:
    - children
    - hover (bool)
    - padding (default 16)
*/
export default function ElevatedCard({ children, hover = true, padding = 2, ...rest }) {
  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        position: 'relative',
        borderRadius: 3,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))'
          : 'linear-gradient(145deg, #ffffff, #f7f9fc)',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 18px -2px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)'
          : '0 4px 18px -2px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        transition: 'all .25s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        '&:before': {
          content: '""',
            position: 'absolute',
            inset: 0,
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 25% 10%, rgba(255,255,255,0.08), transparent 60%)'
              : 'radial-gradient(circle at 25% 10%, rgba(0,0,0,0.04), transparent 60%)',
            opacity: .9,
            pointerEvents: 'none'
        },
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 26px -4px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)'
              : '0 10px 32px -4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)'
          }
        })
      })}
      {...rest}
    >
      <Box sx={{ position: 'relative', p: padding }}>{children}</Box>
    </Card>
  );
}
