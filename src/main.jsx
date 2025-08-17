import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setApiBase } from './utils/axios'
import { toast } from 'sonner'
import { FeatureProvider } from './contexts/FeatureContext.jsx'

async function detectBackendBase() {
  // Eğer env ile açıkça verilmişse olduğu gibi kullan
  const envBase = import.meta.env.VITE_APP_API_URL;
  if (envBase && !envBase.startsWith('/')) {
    try {
      const ok = await fetch(`${envBase.replace(/\/$/,'')}/health`, { method: 'GET' }).then(r=>r.ok).catch(()=>false);
      if (ok) return envBase;
    } catch { /* ignore */ }
  }
  // Proxy mod (Vite) için önce /api deneyelim
  try {
    const ok = await fetch('/api/health', { method: 'GET' }).then(r=>r.ok).catch(()=>false);
    if (ok) return '/api';
  } catch { /* ignore */ }
  // Doğrudan port taraması (5000,5001,5002)
  const ports = [5000, 5001, 5002];
  for (const p of ports) {
    try {
      const url = `http://localhost:${p}/api`;
      const ok = await fetch(`${url}/health`, { method: 'GET' }).then(r=>r.ok).catch(()=>false);
      if (ok) return url;
    } catch { /* ignore */ }
  }
  // Son çare: /api kalsın
  return '/api';
}

async function bootstrap(){
  // Global error capture (opsiyonel kullanıcı bildirimi)
  try {
    window.addEventListener('unhandledrejection', (e) => {
      if (import.meta.env.DEV) console.error('UnhandledRejection:', e.reason);
      // Axios interceptor zaten toasts gösteriyor; burada sadece network dışı beklenmeyen durumları yakalayalım
      const msg = String(e?.reason?.message || e?.reason || 'Bilinmeyen hata');
      if (!/Network Error|status|ECONN/i.test(msg)) toast.error(msg);
    });
    window.addEventListener('error', (e) => {
      if (import.meta.env.DEV) console.error('GlobalError:', e.message);
    });
  } catch { /* ignore */ }

  const base = await detectBackendBase();
  setApiBase(base);
  try {
    if (/^https?:\/\//i.test(base)) {
      const href = base.replace(/\/$/, '');
      const link1 = document.createElement('link');
      link1.rel = 'preconnect';
      link1.href = href;
      link1.crossOrigin = '';
      document.head.appendChild(link1);
      const link2 = document.createElement('link');
      link2.rel = 'dns-prefetch';
      link2.href = href;
      document.head.appendChild(link2);
    }
  } catch { /* ignore */ }
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <FeatureProvider>
        <App />
      </FeatureProvider>
    </React.StrictMode>,
  );
}

bootstrap();
