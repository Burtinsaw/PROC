import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Forbidden403 = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h3" gutterBottom>403 - Erişim Engellendi</Typography>
    <Typography color="text.secondary" gutterBottom>Bu sayfaya erişim izniniz yok.</Typography>
    <Button component={RouterLink} to="/" variant="contained">Ana sayfaya dön</Button>
  </Box>
);

export default Forbidden403;
