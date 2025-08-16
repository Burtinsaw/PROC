import axios from 'axios';
import { toast } from 'sonner';

// Verbose HTTP logging flag (opt-in via env or localStorage)
const DEBUG_HTTP = (import.meta.env.VITE_DEBUG_HTTP === '1') || (() => {
  try { return localStorage.getItem('debug.http') === '1'; } catch { return false; }
})();

const initialBase = import.meta.env.VITE_APP_API_URL || '/api';
const axiosServices = axios.create({
  baseURL: initialBase,
  timeout: 10000, // 10 saniye timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Basit backoff hesaplayıcı (exponential + jitter)
function computeDelay(attempt, retryAfterMs) {
  if (retryAfterMs && Number.isFinite(retryAfterMs)) return retryAfterMs;
  const base = Math.min(1000 * 2 ** (attempt - 1), 8000); // 1s,2s,4s,8s cap
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

// Tekrar deneyim yönetimi: sadece idempotent istekleri (GET/HEAD) ve belirli hataları tekrar dene
function shouldRetry(error) {
  const cfg = error.config || {};
  const method = (cfg.method || '').toUpperCase();
  if (!['GET', 'HEAD'].includes(method)) return false;
  const status = error.response?.status;
  // Ağ hatası (response yok) veya 429/502/503 için deneyebiliriz
  if (!error.response) return true;
  return status === 429 || status === 502 || status === 503;
}

// Aynı hata mesajını sık göstermemek için basit throttle
const toastMemo = new Map(); // key -> timestamp
function showToastThrottled(kind, message, key) {
  const k = key || `${kind}:${message}`;
  const now = Date.now();
  const last = toastMemo.get(k) || 0;
  if (now - last < 2000) return; // 2s içinde tekrarlama
  toastMemo.set(k, now);
  if (kind === 'error') toast.error(message);
  else if (kind === 'warning') toast.warning(message);
  else toast.message?.(message) || toast.success?.(message) || toast(message);
}

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
  if (DEBUG_HTTP) {
      console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
  if (DEBUG_HTTP) console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosServices.interceptors.response.use(
  (response) => {
    // Başarılı response'ları logla (development'da)
    if (DEBUG_HTTP) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    }
    return response;
  },
  async (error) => {
    const { response, message } = error;
  const cfg = error.config || {};
  const headers = cfg.headers || {};
  const getHeader = (k) => headers[k] ?? headers[k?.toLowerCase?.()] ?? headers[k?.toUpperCase?.()];
  const suppress = cfg._suppressErrorToast || getHeader('X-Suppress-Error-Toast') === '1';
    
    // Error loglama
    if (!suppress && DEBUG_HTTP) {
      console.error('❌ Response Error:', {
        url: error.config?.url,
        status: response?.status,
        message: response?.data?.message || message
      });
    }
    
  // Unauthorized durumunda token'ı temizle ve login'e yönlendir
    if (response?.status === 401) {
      localStorage.removeItem('serviceToken');
      
      // Eğer zaten login sayfasında değilse yönlendir
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Otomatik retry (idempotent istekler için): 429/502/503 veya network
    if (shouldRetry(error)) {
      cfg.__retryCount = (cfg.__retryCount || 0) + 1;
      const maxRetries = Number(import.meta.env.VITE_HTTP_MAX_RETRIES || 3);
      if (cfg.__retryCount <= maxRetries) {
        // Retry-After header (saniye) var mı?
        let retryAfterMs;
        try {
          const ra = response?.headers?.['retry-after'] || response?.headers?.['Retry-After'];
          if (ra) {
            const sec = Number(ra);
            if (Number.isFinite(sec)) retryAfterMs = sec * 1000;
          }
        } catch {/* ignore */}
        const delay = computeDelay(cfg.__retryCount, retryAfterMs);
        if (DEBUG_HTTP) console.log(`↻ Retry #${cfg.__retryCount} in ${delay}ms for`, cfg.url);
        await new Promise((r) => setTimeout(r, delay));
        return axiosServices(cfg);
      }
    }

    // Hata bildirimleri (401 hariç)
    if (!suppress) {
      if (response?.status === 429) {
        showToastThrottled('warning', 'Çok fazla istek, lütfen biraz bekleyin.', 'rate-limit');
      } else if (response && response?.status >= 400 && response?.status !== 401) {
        showToastThrottled('error', response?.data?.message || `Hata: ${response.status}`, `e:${response.status}:${cfg.url}`);
      } else if (!response) {
        if (DEBUG_HTTP) console.error('🌐 Network Error: Server unreachable');
        showToastThrottled('error', 'Sunucuya ulaşılamıyor', 'network');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosServices;