import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

// project imports
import router from './routes/index';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// ==============================|| APP - THEME, ROUTER, AUTH ||============================== //

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
