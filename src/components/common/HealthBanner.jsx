import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Link, Stack, Typography } from '@mui/material';
import { getApiBase } from '../../utils/axios';

export function useBackendHealth(pollMs = 15000) {
  const [state, setState] = useState({ status: 'unknown', since: Date.now(), detail: '' });
  const base = useMemo(() => {
    try { return (getApiBase?.() || '/api').replace(/\/$/, ''); } catch { return '/api'; }
  }, []);

  useEffect(() => {
    let alive = true;
    let timer;
    async function check() {
      try {
        const url = `${base}/health`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json().catch(() => ({}));
        const status = data?.status || 'DEGRADED';
        if (!alive) return;
        setState({ status, since: Date.now(), detail: '' });
      } catch (e) {
        if (!alive) return;
        setState({ status: navigator.onLine ? 'DOWN' : 'OFFLINE', since: Date.now(), detail: String(e?.message || e) });
      }
      timer = setTimeout(check, pollMs);
    }
    check();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [base, pollMs]);

  return state;
}

export default function HealthBanner() {
  const { status } = useBackendHealth();
  const offline = typeof navigator !== 'undefined' && navigator && navigator.onLine === false;
  const visible = offline || status === 'DOWN' || status === 'DEGRADED' || status === 'OFFLINE';
  if (!visible) return null;

  const severity = offline || status === 'OFFLINE' || status === 'DOWN' ? 'error' : 'warning';
  const message = offline || status === 'OFFLINE'
    ? 'Çevrimdışı: İnternet bağlantınız yok gibi görünüyor.'
    : (status === 'DOWN' ? 'Backend kapalı veya ulaşılamıyor.' : 'Backend kısıtlı (DEGRADED), bazı işlevler yavaş olabilir.');

  return (
    <Box sx={{ position: 'fixed', bottom: 30, left: 0, right: 0, zIndex: 1300 }}>
      <Alert severity={severity} sx={{ borderRadius: 0, py: 0.25, px: 1 }} icon={false}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ fontSize: 11 }}>{message}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            API: <Link href={getApiBase?.() || '/api'} underline="hover">{getApiBase?.() || '/api'}</Link>
          </Typography>
        </Stack>
      </Alert>
    </Box>
  );
}
