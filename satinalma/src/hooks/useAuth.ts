import { useMemo } from 'react';
import { useAuth as useLocalAuth } from '../contexts/AuthContext';

// Mantis-compatible useAuth wrapper
export default function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout } = useLocalAuth();

  // Mantis Login passes (email, password); map email->username for our backend
  const loginCompat = async (email: string, password: string) => {
    return login(email, password);
  };

  return useMemo(
    () => ({
      isLoggedIn: isAuthenticated,
      isInitialized: !isLoading,
      user,
      login: loginCompat,
      logout,
      // Stubs to satisfy Mantis API; can be implemented later
      register: async () => {},
      resetPassword: async () => {},
      updateProfile: async () => {}
    }),
    [user, isAuthenticated, isLoading]
  );
}
