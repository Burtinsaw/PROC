import React, { useEffect, useState, useRef } from 'react';
import { Alert, Collapse, IconButton, Chip, Stack, Tooltip, LinearProgress, Typography, Box } from '@mui/material';
import { RefreshCcw } from 'lucide-react';
import axios from '../utils/axios';

export default function BackendStatus({ compact = false, dbOnly = false }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const [error, setError] = useState(null);

  const ping = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/health', { timeout: 4000 });
      setHealth(data);
      setError(null);
    } catch (e) {
      setError(e.message || 'Bağlantı hatası');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!timer.current) {
      ping();
      timer.current = setInterval(ping, 20000);
    }
    return () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };
  }, []);

  const status = health?.status;
  const show = error || status === 'DOWN' || status === 'DEGRADED';

  const colorMap = {
    OK: 'success',
    DEGRADED: 'warning',
    DOWN: 'error'
  };
  const color = colorMap[status] || (error ? 'error' : 'info');

  // Ultra-minimal: only a very small inline text like "DB: up/down"
  if (dbOnly) {
    const dbStatus = health?.db?.status || (error ? 'err' : '-');
    const color = dbStatus === 'up' ? 'success.main' : (dbStatus === 'down' ? 'error.main' : 'text.secondary');
    return (
      <Box aria-label={`Veritabanı durumu: ${dbStatus}`} sx={{ width: 1, display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontSize: 10, color, lineHeight: 1 }}>
          DB: {dbStatus}
        </Typography>
      </Box>
    );
  }

  if (compact) {
    return (
      <Stack direction="row" gap={0.5} alignItems="center" sx={{ flexWrap:'wrap' }}>
        <Chip size="small" label={`Durum: ${status || (error ? 'ERR' : 'UNK')}`} color={color === 'error' ? 'error' : color === 'warning' ? 'warning' : 'default'} />
        {health && <Chip size="small" label={`DB:${health.db?.status || '-'}`} color={health.db?.status==='up' ? 'success':'warning'} variant="outlined" />}
        {health && <Chip size="small" label={`Q:${health.queues?.mode || '-'}`} color={health.queues?.enabled ? 'default':'warning'} variant={health.queues?.enabled ? 'outlined':'filled'} />}
        {health && <Chip size="small" label={`v${health.version || ''}`} variant="outlined" />}
        <IconButton color="inherit" size="small" onClick={ping} disabled={loading}>
          <RefreshCcw size={14} />
        </IconButton>
      </Stack>
    );
  }

  return (
    <Collapse in={show} unmountOnExit>
      <Alert
        severity={color}
        action={
          <IconButton color="inherit" size="small" onClick={ping} disabled={loading}>
            <RefreshCcw size={16} />
          </IconButton>
        }
        sx={{ borderRadius: 0, alignItems:'flex-start' }}
      >
        <Stack gap={0.5}>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={`Durum: ${status || 'UNKNOWN'}`} color={color === 'error' ? 'error' : color === 'warning' ? 'warning' : 'default'} />
            {health && <Chip size="small" label={`DB: ${health.db?.status || 'n/a'}`} color={health.db?.status==='up' ? 'success':'warning'} variant="outlined" />}
            {health && <Chip size="small" label={`Queue: ${health.queues?.mode}`} color={health.queues?.enabled ? 'default':'warning'} variant={health.queues?.enabled ? 'outlined':'filled'} />}
            {health && <Chip size="small" label={`v${health.version}`} variant="outlined" />}
          </Stack>
          {error && <div style={{ fontSize:12 }}>Hata: {error}</div>}
          {status === 'DEGRADED' && <div style={{ fontSize:12 }}>Sistem kısıtlı modda (ör: queue veya DB eksik). Takip edin.</div>}
          {status === 'DOWN' && <div style={{ fontSize:12 }}>Veritabanı bağlantısı başarısız. Servisler çalışmayabilir.</div>}
          {!error && !status && <div style={{ fontSize:12 }}>Health bilgisi alınamadı.</div>}
          {loading && <LinearProgress sx={{ mt:0.5 }} />}
        </Stack>
      </Alert>
    </Collapse>
  );
}
