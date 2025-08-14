import React, { createContext, useState, useMemo, useEffect, useRef } from 'react';
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
          const profile = await axios.get('/users/profile');
          const u = profile.data?.user || profile.data?.data;
          if (u) {
            setUser(u);
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
        try { if (userData?.id != null) localStorage.setItem('userId', String(userData.id)); } catch { /* ignore */ }
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

  const register = async (email, password, firstName, lastName) => {
    try {
      // Backend /api/users/register username zorunlu; email local kısmını varsayılan kullanıcı adı yapalım
      const usernameFromEmail = (email || '').split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '') || undefined;
      const body = {
        firstName: (firstName || '').trim(),
        lastName: (lastName || '').trim(),
        email: (email || '').trim(),
        password,
        username: usernameFromEmail || `${(firstName||'').toLowerCase()}.${(lastName||'').toLowerCase()}`.replace(/\s+/g,'').replace(/[^a-z0-9._-]/g,'')
      };
      const res = await axios.post('/users/register', body);
      // İlk kullanıcı ise token döner; diğerlerinde yalnızca bilgi mesajı dönecek
      if (res.data?.token && res.data?.user) {
        const { token, user: userData } = res.data;
        localStorage.setItem('serviceToken', token);
        try { if (userData?.id != null) localStorage.setItem('userId', String(userData.id)); } catch { /* ignore */ }
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, message: res.data?.message };
      }
      return { success: true, message: res.data?.message || 'Kayıt alındı. Lütfen e-posta doğrulaması yapın.' };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Kayıt hatası';
      return { success: false, message };
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await axios.get('/users/profile');
      const u = res.data?.user || res.data?.data || null;
      if (u) setUser(u);
      return u;
    } catch {
      return null;
    }
  };

  const logout = () => {
  localStorage.removeItem('serviceToken');
  try { localStorage.removeItem('userId'); } catch { /* ignore */ }
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    setIsAuthenticated(false);
  };

  const resetPassword = async (email) => {
    try {
      const res = await axios.post('/users/forgot-password', { email });
      return { success: true, message: res.data?.message };
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Şifre sıfırlama hatası';
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (payload) => {
    try {
      const allowed = [
        'firstName','lastName','email','department','designation','phoneNumber','dateOfBirth',
        'address1','address2','city','state','country','postalCode'
      ];
      const body = Object.fromEntries(Object.entries(payload).filter(([k]) => allowed.includes(k)));
      const res = await axios.put('/users/profile', body);
      const updated = res.data?.user || res.data?.data || null;
      if (updated) setUser(updated);
      return { success: true, user: updated, message: res.data?.message };
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Profil güncelleme hatası';
      return { success: false, message: msg };
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      resetPassword,
  refreshProfile,
      updateProfile,
    }),
    [user, isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
