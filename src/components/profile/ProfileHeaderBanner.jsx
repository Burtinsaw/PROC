import React from 'react';
import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';

export default function ProfileHeaderBanner({ title='Profil', subtitle, completion=0 }) {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: (t)=>`1px solid ${t.palette.divider}` }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Box sx={{ minWidth: 220 }}>
          <Typography variant="caption" color="text.secondary">Profil Tamamlanma: {completion}%</Typography>
          <LinearProgress variant="determinate" value={completion} sx={{ mt: 0.5, height: 8, borderRadius: 999 }} />
        </Box>
      </Stack>
    </Paper>
  );
}
