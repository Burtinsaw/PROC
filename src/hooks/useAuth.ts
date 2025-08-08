import { useMemo } from 'react';
import { useAuth as useLocalAuth } from '../contexts/useAuth';

// Mantis-compatible useAuth wrapper
export default function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, resetPassword } = useLocalAuth();

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
      // Stubs/bridges to satisfy Mantis API
      register: async () => {},
      resetPassword,
      updateProfile: async () => {}
    }),
    [user, isAuthenticated, isLoading, resetPassword]
  );
}
