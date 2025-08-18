// Business Layout Integration Demo
// Showcase of complete business theme system integration

import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

// Import business components
import { createBusinessTheme } from '../theme/businessTheme';
import { BusinessSidebar, BusinessTopBar } from './business/BusinessNavigation';
import BusinessDashboard from './business/BusinessDashboard';
import BusinessDataTable from './business/BusinessDataTable';
import { SampleRFQForm } from './business/BusinessFormComponents';

// Main Business Layout Component
export const BusinessLayoutDemo = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [themeMode, setThemeMode] = useState('light');

  // Create business theme
  const businessTheme = createBusinessTheme(themeMode);

  // Navigation handler
  const handleNavigate = (item) => {
    if (item.path) {
      // Simple routing simulation
      switch (item.path) {
        case '/dashboard':
          setCurrentView('dashboard');
          break;
        case '/rfq':
          setCurrentView('rfq-table');
          break;
        case '/rfq/new':
          setCurrentView('rfq-form');
          break;
        default:
          setCurrentView('dashboard');
      }
    }
  };

  // Toggle sidebar
  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Sample handlers
  const handleSearchClick = () => {
    console.log('Search clicked');
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
  };

  const handleRFQRowClick = (row) => {
    console.log('RFQ row clicked:', row);
  };

  const handleRFQEdit = (row) => {
    console.log('Edit RFQ:', row);
  };

  const handleRFQDelete = (row) => {
    console.log('Delete RFQ:', row);
  };

  const handleRFQView = (row) => {
    console.log('View RFQ:', row);
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <BusinessDashboard />;
      case 'rfq-table':
        return (
          <BusinessDataTable
            title="RFQ Yönetimi"
            onRowClick={handleRFQRowClick}
            onEdit={handleRFQEdit}
            onDelete={handleRFQDelete}
            onView={handleRFQView}
          />
        );
      case 'rfq-form':
        return <SampleRFQForm />;
      default:
        return <BusinessDashboard />;
    }
  };

  return (
    <ThemeProvider theme={businessTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <BusinessSidebar
          open={sidebarOpen}
          selectedPath={currentView}
          onNavigate={handleNavigate}
          dense
        />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ml: sidebarOpen ? 0 : '-280px',
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              })
          }}
        >
          {/* Top Bar */}
          <BusinessTopBar
            onMenuClick={handleMenuClick}
            onSearchClick={handleSearchClick}
            onNotificationClick={handleNotificationClick}
            dense
          />

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: 'background.default'
            }}
          >
            {renderCurrentView()}
          </Box>
        </Box>
      </Box>

      {/* Quick Actions Floating Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        {/* Quick action buttons could go here */}
      </Box>

      {/* Theme Toggle for Demo */}
      <Box
        sx={{
          position: 'fixed',
          top: 80,
          right: 24,
          zIndex: 1000
        }}
      >
        <Box
          onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
          sx={{
            p: 1,
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 1,
            cursor: 'pointer',
            fontSize: '0.75rem',
            textAlign: 'center',
            minWidth: 80
          }}
        >
          {themeMode === 'light' ? 'Dark' : 'Light'} Mode
        </Box>
      </Box>

      {/* View Switcher for Demo */}
      <Box
        sx={{
          position: 'fixed',
          top: 120,
          right: 24,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'RFQ List', view: 'rfq-table' },
          { label: 'RFQ Form', view: 'rfq-form' }
        ].map((item) => (
          <Box
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            sx={{
              p: 0.75,
              backgroundColor: currentView === item.view ? 'secondary.main' : 'background.paper',
              color: currentView === item.view ? 'white' : 'text.primary',
              border: 1,
              borderColor: 'divider',
              borderRadius: 0.5,
              cursor: 'pointer',
              fontSize: '0.6875rem',
              textAlign: 'center',
              minWidth: 80,
              '&:hover': {
                backgroundColor: currentView === item.view ? 'secondary.dark' : 'action.hover'
              }
            }}
          >
            {item.label}
          </Box>
        ))}
      </Box>
    </ThemeProvider>
  );
};

export default BusinessLayoutDemo;
