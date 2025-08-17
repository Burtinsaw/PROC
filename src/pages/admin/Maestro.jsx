import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Button, Stack } from '@mui/material';
import api from '../../utils/axios';

export default function Maestro() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/maestro/health');
      setData(data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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
            </Box>
          )}
          <Box sx={{ mt:2 }}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={load} disabled={loading}>Yenile</Button>
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
