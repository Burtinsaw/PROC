import React from 'react';
import { Box } from '@mui/material';

/*
  DeltaBadge: Yüzde değişim göstergesi (pozitif/negatif/nötr)
  Props:
    - value (number) -> %
    - size: 'sm' | 'md'
*/
export default function DeltaBadge({ value, size='md' }) {
  const positive = value > 0; const negative = value < 0;
  const abs = Math.abs(value).toFixed(1) + '%';
  const palette = positive
    ? { bg:'rgba(16,185,129,0.15)', border:'rgba(16,185,129,0.3)', color:'#10b981' }
    : negative
      ? { bg:'rgba(239,68,68,0.16)', border:'rgba(239,68,68,0.32)', color:'#ef4444' }
      : { bg:'rgba(148,163,184,0.18)', border:'rgba(148,163,184,0.32)', color:'#64748b' };
  const pad = size==='sm'? '2px 6px':'4px 10px';
  const font = size==='sm'? '.6rem':'.7rem';
  return (
    <Box component="span" sx={{
      display:'inline-flex', alignItems:'center', gap:.25,
      fontWeight:600, fontSize:font, letterSpacing:'.5px', textTransform:'uppercase',
      background: palette.bg, color: palette.color, border:'1px solid', borderColor: palette.border,
      borderRadius: 999, padding: pad, lineHeight:1.1
    }}>
      {positive? '▲': negative? '▼':'•'} {abs}
    </Box>
  );
}
