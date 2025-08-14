import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/common/ErrorBoundary';
// BackendStatus moved to Sidebar footer; Exchange rates shown there as well

// project imports
import router from './routes/index';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import QueryClientProvider from './contexts/QueryClientProvider';
import React from 'react';
// Removed PingTest dev widget to reduce noise
import ContentContainer from './components/layout/ContentContainer';
import { LanguageProvider } from './contexts/LanguageContext';

// ==============================|| APP - THEME, ROUTER, AUTH ||============================== //

function App() {
  return (
  <ThemeProvider>
  <CssBaseline />
  <Toaster richColors position="top-center" />
      <ErrorBoundary>
        <AuthProvider>
          <LanguageProvider>
      <QueryClientProvider>
  {/* dev ping removed */}
  <RouterProvider router={router} />
      </QueryClientProvider>
          </LanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
