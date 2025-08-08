import React, { useState } from 'react';
import { Box, CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import ProcurementHeader from '../components/ProcurementHeader';
import ProcurementSidebar from '../components/ProcurementSidebar';
import { useTheme } from '../contexts/ThemeContext';

const drawerWidth = 260;

const ProcurementLayout = ({ title }) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />

        {/* Header */}
        <ProcurementHeader onDrawerToggle={handleDrawerToggle} title={title} />

        {/* Sidebar */}
        <ProcurementSidebar
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          variant={isMobile ? 'temporary' : 'persistent'}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: isMobile ? 0 : (sidebarOpen ? `${drawerWidth}px` : 0),
            width: '100%',
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default,
            pt: '64px', // Header height offset
            overflow: 'auto'
          }}
        >
          <Box sx={{ pt: 2, pr: 2, pb: 2, pl: '7px' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </MuiThemeProvider>
  );
};

export default ProcurementLayout;
