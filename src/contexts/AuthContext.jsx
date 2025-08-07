import React, { createContext, useEffect, useReducer } from 'react';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT, INITIALIZE } from './auth-reducer/actions';
import authReducer from './auth-reducer/auth';

// project imports
import Loader from '../components/Loader';
import axios from '../utils/axios';

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken || typeof serviceToken !== 'string') {
    return false;
  }
  
  try {
    const decoded = jwtDecode(serviceToken);
    
    // Token'ın geçerlilik süresini kontrol et
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp <= currentTime;
    
    if (isExpired) {
      console.warn('🔓 Token expired, removing from storage');
      localStorage.removeItem('serviceToken');
      return false;
    }
    
    // Token 5 dakika içinde expire olacaksa uyar
    const timeUntilExpiry = decoded.exp - currentTime;
    if (timeUntilExpiry < 300) { // 5 dakika
      console.warn('⏰ Token expires in less than 5 minutes');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    localStorage.removeItem('serviceToken');
    return false;
  }
};

const setSession = (serviceToken) => {
  if (serviceToken) {
    try {
      // Token geçerliliğini kontrol et
      if (!verifyToken(serviceToken)) {
        console.error('❌ Invalid token provided to setSession');
        return;
      }
      
      localStorage.setItem('serviceToken', serviceToken);
      axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
      
      console.log('✅ Session token set successfully');
    } catch (error) {
      console.error('❌ Failed to set session:', error);
    }
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
    console.log('🔓 Session cleared');
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = localStorage.getItem('serviceToken');
        
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          
          // Backend'den kullanıcı bilgilerini al
          try {
            const response = await axios.get('/auth/profile');
            const user = response.data.data || response.data.user;
            
            dispatch({
              type: LOGIN,
              payload: {
                isLoggedIn: true,
                user
              }
            });
          } catch (profileError) {
            console.error('❌ Failed to fetch user profile:', profileError);
            // Profile çekilemezse token'ı geçersiz say
            setSession(null);
            dispatch({ type: LOGOUT });
          }
        } else {
          console.log('🔓 No valid token found, logging out');
          setSession(null);
          dispatch({ type: LOGOUT });
        }
      } catch (err) {
        console.error('❌ Auth initialization failed:', err);
        setSession(null);
        dispatch({ type: LOGOUT });
      } finally {
        dispatch({ type: INITIALIZE });
      }
    };

    init();
  }, []);

  const login = async (username, password) => {
    try {
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      const response = await axios.post('/auth/login', {
        username,
        password
      });
      
      if (!response.data.success || !response.data.token) {
        throw new Error(response.data.message || 'Invalid response from server');
      }
      
      const { token, user } = response.data;
      setSession(token);
      
      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user
        }
      });
      
      console.log('✅ Login successful for user:', user.username);
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Giriş yapılırken bir hata oluştu';
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      const response = await axios.post('/api/account/register', {
        email,
        password,
        firstName,
        lastName
      });
      
      const { serviceToken, user } = response.data;
      setSession(serviceToken);
      
      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user
        }
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Kayıt olurken bir hata oluştu' 
      };
    }
  };

  const logout = async () => {
    try {
      // Backend'e logout isteği gönder
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('❌ Logout request failed:', error);
      // Backend hatası olsa da local logout devam etsin
    } finally {
      setSession(null);
      dispatch({ type: LOGOUT });
      console.log('🔓 User logged out successfully');
    }
  };

  const resetPassword = async (email) => {
    try {
      await axios.post('/api/account/reset-password', { email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu' 
      };
    }
  };

  if (!state.isInitialized) return <Loader />;

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;