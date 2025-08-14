import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setApiBase } from './utils/axios'

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
  const base = await detectBackendBase();
  setApiBase(base);
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
