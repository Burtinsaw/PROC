import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Chip, Stack, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Pagination, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import api from '../../utils/axios';

// Basit audit listesi: sadece feature_toggle aksiyonlarını listeler
export default function AuditChanges() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState('all'); // all | module | feature
  const [q, setQ] = useState(''); // key araması

  const fetchData = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const p = opts.page || page;
      const l = opts.limit || limit;
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', String(l));
      params.set('action', 'feature_toggle');
      // entityType = FeatureToggle şeklinde loglanıyor
      params.set('entityType', 'FeatureToggle');
      const { data } = await api.get(`/audit?${params.toString()}`);
      let list = Array.isArray(data.rows) ? data.rows : [];
      // İstemci tarafı filtreler
      if (kind !== 'all') {
        list = list.filter(r => (r.metadata?.kind || '').toLowerCase() === kind);
      }
      if (q) {
        const qq = q.toLowerCase();
        list = list.filter(r => (r.metadata?.key || '').toLowerCase().includes(qq) || String(r.entityId||'').toLowerCase().includes(qq));
      }
      setRows(list);
      setTotalPages(Number(data.totalPages || 1));
    } finally {
      setLoading(false);
    }
  }, [page, limit, kind, q]);

  useEffect(() => { fetchData({ page: 1 }); /* ilk yüklemede sayfa 1 */ }, [fetchData]);
  useEffect(() => { fetchData(); /* filtreler değişince sunucudan tekrar getir (pagination-state korunur) */ }, [fetchData, kind, q]);

  const onRefresh = () => fetchData();

  const header = useMemo(() => (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
      <Typography variant="h5">Ayar Değişiklikleri</Typography>
      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="kind-label">Tür</InputLabel>
          <Select labelId="kind-label" label="Tür" value={kind} onChange={(e)=>{ setKind(e.target.value); setPage(1); }}>
            <MenuItem value="all">Hepsi</MenuItem>
            <MenuItem value="module">Modül</MenuItem>
            <MenuItem value="feature">Özellik</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" label="Ara (anahtar)" value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} />
        <Tooltip title="Yenile">
          <span>
            <IconButton color="primary" onClick={onRefresh} disabled={loading}>
              {loading ? <CircularProgress size={18} /> : <RefreshCw size={18} />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  ), [kind, q, loading, onRefresh]);

  return (
    <Box sx={{ p: 2 }}>
      {header}
      <Card>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Zaman</TableCell>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>Aksiyon</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell>Kimlik</TableCell>
                  <TableCell>Değer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => {
                  const k = r?.metadata?.key;
                  const kd = r?.metadata?.kind;
                  const prev = r?.metadata?.previous;
                  const now = r?.metadata?.enabled;
                  const user = r?.user?.username || r?.user?.email || `#${r?.userId || '-'}`;
                  const change = (prev === undefined || now === undefined)
                    ? '-'
                    : (prev === now ? (now ? 'Açıktı (değişmedi)' : 'Kapalıydı (değişmedi)') : `${prev ? 'Açık' : 'Kapalı'} → ${now ? 'Açık' : 'Kapalı'}`);
                  const chipColor = now ? 'success' : 'default';
                  return (
                    <TableRow key={r.id} hover>
                      <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{user}</TableCell>
                      <TableCell>{r.action}</TableCell>
                      <TableCell>{kd}</TableCell>
                      <TableCell>{k || r.entityId}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {typeof now === 'boolean' && <Chip size="small" label={now ? 'Açık' : 'Kapalı'} color={chipColor} />}
                          <Typography variant="body2" sx={{ opacity: .75 }}>{change}</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Kayıt bulunamadı
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={22} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display:'flex', justifyContent:'flex-end', mt: 2 }}>
            <Pagination size="small" page={page} count={totalPages} onChange={(_,p)=>{ setPage(p); fetchData({ page:p }); }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
