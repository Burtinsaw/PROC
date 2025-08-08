import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

// ==============================|| SIMPLE LAYOUT ||============================== //

const SimpleLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default SimpleLayout;
