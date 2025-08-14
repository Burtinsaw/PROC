import { Box, CircularProgress } from '@mui/material';

export default function Loader({ full = true }) {
  const content = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <CircularProgress size={28} thickness={4} />
    </Box>
  );
  if (!full) return content;
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {content}
    </Box>
  );
}
