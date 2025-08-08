import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/common/ErrorBoundary';
import BackendStatus from './components/BackendStatus';

// project imports
import router from './routes/index';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// ==============================|| APP - THEME, ROUTER, AUTH ||============================== //

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Toaster richColors position="top-center" />
      <ErrorBoundary>
        <AuthProvider>
          <BackendStatus />
          <RouterProvider router={router} />
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
