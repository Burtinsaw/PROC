import { Outlet } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';

// ==============================|| AUTH LAYOUT ||============================== //

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                Satın Alma Sistemi
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Procurement Management System
              </Typography>
            </Box>
          </Grid>
          <Grid size={12}>
            <Paper
              elevation={10}
              sx={{
                position: 'relative',
                p: 4,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Outlet />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AuthLayout;
