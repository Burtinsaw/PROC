import React from 'react';
import { LinearProgress, Box } from '@mui/material';
import { useNavigation } from 'react-router-dom';

export default function RouteProgress() {
  const navigation = useNavigation?.();
  const busy = navigation && (navigation.state === 'loading' || navigation.state === 'submitting');
  if (!busy) return null;
  return (
    <Box sx={{ position: 'sticky', top: 'var(--app-header-h)', left: 0, right: 0, zIndex: 1100 }}>
      <LinearProgress color="secondary" sx={{ height: 3, borderRadius: 1 }} />
    </Box>
  );
}
