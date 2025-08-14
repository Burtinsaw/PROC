import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { resolveStatus } from '../../tokens/status';

// Color mapping via CSS variables fallback
const toneMap = {
  primary: { bg: 'var(--color-brand-primary, #2563eb)', soft: 'var(--color-brand-primarySoft, #dbeafe)' },
  secondary: { bg: 'var(--color-brand-secondary, #db2777)', soft: 'var(--color-brand-secondarySoft, #fce7f3)' },
  success: { bg: '#16a34a', soft: '#dcfce7' },
  warning: { bg: '#d97706', soft: '#fef3c7' },
  error: { bg: '#dc2626', soft: '#fee2e2' },
  info: { bg: '#0284c7', soft: '#e0f2fe' },
  default: { bg: '#64748b', soft: '#f1f5f9' }
};

const Outlined = styled(Chip)(({ ownerState }) => {
  const key = ownerState.muiColor || 'default';
  const dense = !!ownerState.dense;
  const col = toneMap[key] || toneMap.default;
  return {
    height: dense ? 18 : 22,
    fontWeight: 600,
    fontSize: dense ? 10.5 : 11.5,
    letterSpacing: '.25px',
    borderRadius: 999,
    border: `1px solid ${col.bg}`,
    background: col.soft,
    color: col.bg,
    lineHeight: 1,
    '& .MuiChip-label': { px: dense ? 0.5 : 0.75, py: 0, display: 'flex', alignItems: 'center' }
  };
});

export default function StatusChip({ status, dense=false, ...rest }) {
  if (!status) return null;
  const info = resolveStatus(status);
  return <Outlined size="small" label={info.label} ownerState={{ muiColor: info.color, dense }} {...rest} />;
}
