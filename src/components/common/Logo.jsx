import { Box, Typography } from '@mui/material';

export default function Logo({ compact = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: 'primary.main' }} />
      {!compact && (
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
          Mantis
        </Typography>
      )}
    </Box>
  );
}
