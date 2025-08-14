import React from 'react';
import { Chip } from '@mui/material';

// Maps business priority labels to semantic tones using theme tokens.
const toneMap = {
  Yüksek: { color: 'error', variant: 'filled' },
  Orta: { color: 'warning', variant: 'filled' },
  Düşük: { color: 'info', variant: 'filled' },
  Critical: { color: 'error', variant: 'filled' },
  High: { color: 'error', variant: 'filled' },
  Medium: { color: 'warning', variant: 'filled' },
  Low: { color: 'info', variant: 'filled' }
};

export default function PriorityChip({ value, size='small' }) {
  if(!value) return null;
  const tone = toneMap[value] || { color: 'default', variant: 'outlined' };
  return <Chip label={value} size={size} color={tone.color} variant={tone.variant} sx={{ fontWeight:600, letterSpacing:.3 }} />;
}
