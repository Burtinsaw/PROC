import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

export default function AuthWrapper({ title = 'Satın Alma Sistemi', subtitle = 'Lütfen giriş yapın', children, maxWidth = 440 }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper elevation={4} sx={{ p: 3, width: '100%', maxWidth, borderRadius: 3 }}>
        {(title || subtitle) && (
          <Stack spacing={0.5} sx={{ mb: 2, textAlign: 'center' }}>
            {title && <Typography variant="h5" fontWeight={700}>{title}</Typography>}
            {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
          </Stack>
        )}
        {children}
      </Paper>
    </Box>
  );
}
