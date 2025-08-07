import axios from 'axios';

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 saniye timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for API calls
axiosServices.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('serviceToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Tüm istekleri logla (development'da)
    if (import.meta.env.DEV) {
      console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosServices.interceptors.response.use(
  (response) => {
    // Başarılı response'ları logla (development'da)
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    }
    return response;
  },
  (error) => {
    const { response, message } = error;
    
    // Error loglama
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: response?.status,
      message: response?.data?.message || message
    });
    
    // Unauthorized durumunda token'ı temizle ve login'e yönlendir
    if (response?.status === 401) {
      localStorage.removeItem('serviceToken');
      
      // Eğer zaten login sayfasında değilse yönlendir
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/auth/login';
      }
    }
    
    // Network hatası durumunda kullanıcıyı bilgilendir
    if (!response) {
      console.error('🌐 Network Error: Server unreachable');
    }
    
    return Promise.reject(error);
  }
);

export default axiosServices;