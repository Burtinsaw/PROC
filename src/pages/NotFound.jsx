import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthWrapper from '../sections/auth/AuthWrapper';

export default function NotFound() {
  return (
    <AuthWrapper title="Sayfa bulunamadı" subtitle="Aradığınız sayfa mevcut değil">
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>404 - Not Found</Typography>
        <Button variant="contained" component={Link} to="/">Anasayfaya dön</Button>
      </Box>
    </AuthWrapper>
  );
}
