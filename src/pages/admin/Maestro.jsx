import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Button, Stack, Chip, Divider } from '@mui/material';
import api from '../../utils/axios';

export default function Maestro() {
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [p95History, setP95History] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promStatus, setPromStatus] = useState('unknown'); // 'ok' | 'err' | 'unknown'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshSec, setRefreshSec] = useState(30);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [h, m] = await Promise.all([
        api.get('/maestro/health'),
        api.get('/_metrics').catch(()=>({ data: null }))
      ]);
      setData(h.data);
      setMetrics(m?.data || null);
      const p95 = m?.data?.durations?.p95Ms;
      if (typeof p95 === 'number') {
        setP95History((prev) => {
          const next = [...prev, p95];
          if (next.length > 30) next.shift();
          return next;
        });
      }
      // Prometheus /metrics erişim kontrolü (HEAD dene, olmazsa GET)
      try {
        const base = window.__API_ORIGIN || window.location.origin;
        let ok = false;
        try {
          const r = await fetch(`${base}/metrics`, { method: 'HEAD' });
          ok = r.ok;
        } catch {
          const r2 = await fetch(`${base}/metrics`, { method: 'GET' });
          ok = r2.ok;
        }
        setPromStatus(ok ? 'ok' : 'err');
      } catch {
        setPromStatus('err');
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  // küçük bir auto-refresh (30s) – hafifçe güncel tutar
  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => load(), Math.max(5, refreshSec) * 1000);
    return () => clearInterval(t);
  }, [autoRefresh, refreshSec]);

  const spark = useMemo(() => {
    const data = p95History;
    if (!data.length) return null;
    const w = 120, h = 28, pad = 2;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = Math.max(1, max - min);
    const step = (w - pad * 2) / Math.max(1, data.length - 1);
    let d = '';
    data.forEach((v, i) => {
      const x = pad + i * step;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    });
    return { d, w, h };
  }, [p95History]);

  const p95Color = useMemo(() => {
    const p95 = metrics?.durations?.p95Ms || 0;
    if (p95 < 200) return 'success';
    if (p95 < 500) return 'warning';
    return 'error';
  }, [metrics]);

  const downloadMetricsJson = () => {
    if (!metrics) return;
    const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backend-metrics-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p:2 }}>
      <Typography variant="h5" sx={{ mb:2 }}>Maestro – Sağlık Durumu</Typography>
      <Card>
        <CardContent>
          {loading && <CircularProgress size={22} />}
          {error && <Typography color="error">{String(error)}</Typography>}
          {data && (
            <Box>
              <Typography variant="body1">Node: {data.node}</Typography>
              <Typography variant="body1">Uptime: {data.uptimeSec}s</Typography>
              <Typography variant="body1">DB: {data.db?.ok ? 'OK' : `HATA: ${data.db?.error}`}</Typography>
              <Typography variant="body1" sx={{ mt:1 }}>Modüller: {Object.entries(data.features?.modules||{}).map(([k,v])=>`${k}:${v?'✓':'✗'}`).join(', ')}</Typography>
              {metrics && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 1 }}>Backend Metrics</Divider>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip size="small" label={`Uptime: ${(metrics.uptimeMs/1000|0)}s`} />
                    <Chip size="small" label={`Req Total: ${metrics.totalRequests||0}`} />
                    <Chip size="small" label={`In-Flight: ${metrics.inFlight||0}`} />
                    <Chip size="small" label={`Avg: ${metrics.durations?.avgMs||0}ms`} />
                    <Chip size="small" color={p95Color} label={`p95: ${metrics.durations?.p95Ms||0}ms`} />
                    <Chip size="small" color={promStatus==='ok'?'success':promStatus==='err'?'error':'default'} label={`Prom: ${promStatus==='ok'?'OK':promStatus==='err'?'ERR':'—'}`} />
                  </Stack>
                  {spark && (
                    <Box sx={{ mt: 1, opacity: 0.8 }}>
                      <Typography variant="caption" sx={{ mr: 1 }}>p95 ms son 30 örnek</Typography>
                      <svg width={spark.w} height={spark.h} viewBox={`0 0 ${spark.w} ${spark.h}`}>
                        <path d={spark.d} stroke="#1976d2" fill="none" strokeWidth="2" />
                      </svg>
                    </Box>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color:'text.secondary' }}>
                      Status: {Object.entries(metrics.byStatus||{}).map(([k,v])=>`${k}:${v}`).join('  ')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="text" onClick={()=>{
                      const base = window.__API_ORIGIN || window.location.origin;
                      window.open(`${base}/metrics`, '_blank');
                    }}>Prometheus Metrics</Button>
                    <Button size="small" variant="text" onClick={downloadMetricsJson}>JSON indir</Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          <Box sx={{ mt:2 }}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={load} disabled={loading}>Yenile</Button>
              <Chip size="small" label={`Auto-Refresh: ${autoRefresh?'Açık':'Kapalı'}`} onClick={()=>setAutoRefresh(v=>!v)} sx={{ cursor:'pointer' }} />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="caption">Aralık:</Typography>
                {[10,30,60].map(s => (
                  <Button key={s} size="small" variant={refreshSec===s?'contained':'outlined'} onClick={()=>setRefreshSec(s)}>{s}s</Button>
                ))}
              </Stack>
              <Button size="small" onClick={async()=>{ await api.post('/maestro/commands/lint'); }}>Lint (stub)</Button>
              <Button size="small" onClick={async()=>{ await api.post('/maestro/commands/typecheck'); }}>Typecheck (stub)</Button>
              <Button size="small" onClick={async()=>{ await api.post('/maestro/commands/test-summary'); }}>Test Özeti (stub)</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
