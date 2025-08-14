import axios from 'axios';
import { toast } from 'sonner';

const initialBase = import.meta.env.VITE_APP_API_URL || '/api';
const axiosServices = axios.create({
  baseURL: initialBase,
  timeout: 10000, // 10 saniye timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dinamik olarak baseURL güncelleme yardımcıları
export function setApiBase(url) {
  if (!url) return;
  axiosServices.defaults.baseURL = url;
  try { window.__API_BASE = url; } catch { /* ignore */ }
  // Ayrıca kök origin’i ayrı saklayalım (socket için kullanacağız)
  try {
    const u = new URL(url, window.location.origin);
    window.__API_ORIGIN = `${u.protocol}//${u.hostname}${u.port ? ':'+u.port : ''}`;
  } catch { /* ignore */ }
}
export function getApiBase(){ return axiosServices.defaults.baseURL; }

// Request interceptor for API calls
axiosServices.interceptors.request.use(
  (config) => {
  const token = localStorage.getItem('serviceToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Accept-Language from saved uiLang
    try {
      const uiLang = localStorage.getItem('uiLang');
      if(uiLang) config.headers['Accept-Language'] = uiLang;
    } catch {/* ignore */}
    
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
        window.location.href = '/login';
      }
    }
    
    // Hata bildirimleri (401 hariç)
    if (response?.status === 429) {
      toast.warning('Çok fazla istek, lütfen biraz bekleyin.');
    } else if (response && response?.status >= 400 && response?.status !== 401) {
      toast.error(response?.data?.message || `Hata: ${response.status}`);
    } else if (!response) {
      console.error('🌐 Network Error: Server unreachable');
      toast.error('Sunucuya ulaşılamıyor');
    }
    
    return Promise.reject(error);
  }
);

export default axiosServices;