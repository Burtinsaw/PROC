import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import ElevatedCard from '../ui/ElevatedCard';
import NeutralBadge from './NeutralBadge';

/* MetricCard
   Props:
    - icon (React component)
    - value
    - label
    - delta ('+12.5%')
    - deltaType ('increase'|'decrease')
    - color (icon color)
    - bgColor (avatar background)
*/
export default function MetricCard({ icon: Icon, value, label, delta, deltaType, color, bgColor }) {
  const deltaColor = deltaType === 'increase' ? 'success' : deltaType === 'decrease' ? 'error' : 'neutral';
  return (
    <ElevatedCard padding={2} sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: bgColor || 'primary.light',
            color: color || 'primary.main',
            width: 56,
            height: 56,
            boxShadow: '0 0 0 4px rgba(0,0,0,0.04)'
          }}
        >
          {Icon && <Icon size={26} />}
        </Avatar>
        {delta && (
          <NeutralBadge
            label={delta}
            variant={deltaColor === 'neutral' ? 'outlined' : 'subtle'}
            sx={(theme) => ({
              ...(deltaColor !== 'neutral' && {
                backgroundColor: theme.palette[deltaColor]?.lighter || undefined,
                borderColor: theme.palette[deltaColor]?.light || undefined,
                color: theme.palette[deltaColor]?.main || undefined
              })
            })}
          />
        )}
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </ElevatedCard>
  );
}
