import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';
import MiniSparkline from '../charts/MiniSparkline';

/*
  StatCard v2 (Aurora uyumlu)
  Props:
    - label (string)
    - value (string | number)
    - delta (number) yüzde değişim (örn 5.2 pozitif, -3.1 negatif)
    - unit (string opsiyonel)
    - icon (ReactNode opsiyonel)
    - trend (ReactNode opsiyonel sparkline slot)
*/
// Ek prop: series (number[] ya da {value}[]) verilirse trend yoksa internal sparkline render eder.
export default function StatCard({ label, value, delta, unit, icon, trend, series }) {
  const positive = typeof delta === 'number' && delta >= 0;
  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius * 1.2,
        p: 2.4,
        overflow: 'hidden',
        background: theme.palette.mode==='dark'
          ? 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))'
          : 'linear-gradient(160deg,#fff,#f5f7fb)',
        border: '1px solid',
        borderColor: theme.palette.mode==='dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        boxShadow: theme.palette.mode==='dark' ? '0 6px 24px -4px rgba(0,0,0,0.55)' : '0 6px 24px -4px rgba(0,0,0,0.12)',
        transition: 'var(--transition-base)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.1,
        ...(theme.palette.mode==='dark' && {
          '&:after': presetAuroraDecoration(theme)
        }),
        ...(theme.palette.mode!=='dark' && {
          '&:after': presetAuroraDecoration(theme)
        }),
        '&:hover': {
          boxShadow: theme.palette.mode==='dark' ? '0 12px 40px -8px rgba(0,0,0,0.7)' : '0 14px 42px -10px rgba(0,0,0,0.16)',
          transform: 'translateY(-3px)'
        }
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && <Box sx={{ width: 36, height: 36, borderRadius: 2, display:'grid', placeItems:'center',
          background: (theme)=>`linear-gradient(140deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color:'#fff', fontSize: 20 }}>{icon}</Box>}
        <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', opacity:.75 }}>{label}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <Typography sx={(theme)=>({
          fontSize: 'clamp(1.6rem,2.4vw,2.2rem)',
          fontWeight: 600,
          letterSpacing: '-.5px',
          lineHeight: 1.1,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        })}>{value}{unit && <Typography component='span' sx={{ ml:.5, fontSize:'0.85rem', fontWeight:500, color:'text.secondary' }}>{unit}</Typography>}</Typography>
        {typeof delta==='number' && (
          <Chip
            size="small"
            icon={positive ? <TrendingUp strokeWidth={2} size={16} /> : <TrendingDown strokeWidth={2} size={16} />}
            label={Math.abs(delta).toFixed(1)+'%'}
            sx={{
              fontWeight:600,
              height:24,
              borderRadius: 2,
              px: .75,
              bgcolor: positive? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.18)',
              color: positive? '#10b981' : '#ef4444',
              '& .MuiChip-icon': { ml: '-2px' }
            }}
          />
        )}
      </Box>
      {(trend || series) && (
        <Box sx={{ mt: .5 }}>
          {trend ? trend : <MiniSparkline data={series || []} />}
        </Box>
      )}
    </Box>
  );
}

function presetAuroraDecoration(theme){
  return {
    content:'""',
    position:'absolute',
    inset:0,
    pointerEvents:'none',
    background: `radial-gradient(circle at 85% 25%, ${theme.palette.mode==='dark'? 'rgba(168,85,247,0.18)':'rgba(99,102,241,0.15)'}, transparent 60%)`,
    mixBlendMode:'normal'
  };
}
