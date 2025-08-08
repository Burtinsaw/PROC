import React, { createContext, useState, useMemo, useContext, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from '../utils/axios'; // Configured axios instance

const AuthContext = createContext();

const isValidToken = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initRan = useRef(false);

  useEffect(() => {
  if (initRan.current) return; // StrictMode double-mount guard
  initRan.current = true;
  const initializeAuth = async () => {
      const token = localStorage.getItem('serviceToken');
      if (token && isValidToken(token)) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        try {
          const profile = await axios.get('/auth/profile');
          if (profile.data?.success) {
            setUser(profile.data.data || profile.data.user || null);
            setIsAuthenticated(true);
          } else {
            logout();
          }
    } catch (err) {
          const status = err?.response?.status;
          if (status === 401 || status === 403) {
            logout();
          } else {
            // 429/Network vb: oturumu koru, kullanıcıyı token’dan kısmen yükle
            try {
              const decoded = jwtDecode(token);
              setUser((prev) => prev || decoded || null);
            } catch {
              // ignore decode error
            }
            setIsAuthenticated(true);
          }
        }
      } else {
  localStorage.removeItem('serviceToken');
        delete axios.defaults.headers.common.Authorization;
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
  // Backend server mounts auth routes at /api/auth in server.js; axios baseURL already points to /api
  const response = await axios.post('/auth/login', { username, password });
      if (response.data?.success && response.data.token) {
        const { token, user: userData } = response.data;
  localStorage.setItem('serviceToken', token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.data?.message || 'Giriş başarısız' };
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Giriş hatası';
      return { success: false, message };
    }
  };

  const logout = () => {
  localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
