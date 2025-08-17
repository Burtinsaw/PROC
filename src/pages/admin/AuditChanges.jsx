import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Chip, Stack, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Pagination, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import api from '../../utils/axios';

// Basit audit listesi: sadece feature_toggle aksiyonlarını listeler
export default function AuditChanges() {
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState('all'); // all | module | feature
  const [q, setQ] = useState(''); // key araması
  const [scope, setScope] = useState('feature'); // feature | companyMerge

  const fetchData = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const p = opts.page || page;
      const l = opts.limit || limit;
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', String(l));
      if (scope === 'feature') {
        params.set('action', 'feature_toggle');
        // entityType = FeatureToggle şeklinde loglanıyor
        params.set('entityType', 'FeatureToggle');
      } else if (scope === 'companyMerge') {
        params.set('action', 'company.merge');
        params.set('entityType', 'Company');
      }
      const { data } = await api.get(`/audit?${params.toString()}`);
      let list = Array.isArray(data.rows) ? data.rows : [];
      // İstemci tarafı filtreler
      if (scope === 'feature' && kind !== 'all') {
        list = list.filter(r => (r.metadata?.kind || '').toLowerCase() === kind);
      }
      if (q) {
        const qq = q.toLowerCase();
        list = list.filter(r => (
          (r.metadata?.key || '').toLowerCase().includes(qq) ||
          String(r.entityId||'').toLowerCase().includes(qq) ||
          (r.metadata?.sourceId ? String(r.metadata.sourceId).toLowerCase().includes(qq) : false) ||
          (r.metadata?.targetId ? String(r.metadata.targetId).toLowerCase().includes(qq) : false)
        ));
      }
      setRows(list);
      setTotalPages(Number(data.totalPages || 1));
    } finally {
      setLoading(false);
    }
  }, [page, limit, kind, q, scope]);

  useEffect(() => { fetchData({ page: 1 }); /* ilk yüklemede sayfa 1 */ }, [fetchData]);
  useEffect(() => { fetchData(); /* filtreler değişince sunucudan tekrar getir (pagination-state korunur) */ }, [fetchData, kind, q, scope]);

  // URL'den başlangıç filtrelerini al
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      const s = sp.get('scope');
      const qq = sp.get('q');
      const k = sp.get('kind');
      if (s && (s === 'feature' || s === 'companyMerge')) setScope(s);
      if (typeof qq === 'string') setQ(qq);
      if (k && (k === 'all' || k === 'module' || k === 'feature')) setKind(k);
    } catch { /* ignore */ }
  }, [location.search]);

  // Filtreler değişince URL'i güncelle (paylaşılabilir link)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      sp.set('scope', scope);
      if (q) sp.set('q', q); else sp.delete('q');
      if (scope === 'feature') {
        sp.set('kind', kind);
      } else {
        sp.delete('kind');
      }
      const newUrl = `${location.pathname}?${sp.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } catch { /* ignore */ }
  }, [scope, q, kind, location.pathname, location.search]);

  const onRefresh = React.useCallback(() => fetchData(), [fetchData]);

  const header = useMemo(() => (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
      <Typography variant="h5">Ayar Değişiklikleri</Typography>
      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="scope-label">Kapsam</InputLabel>
          <Select labelId="scope-label" label="Kapsam" value={scope} onChange={(e)=>{ setScope(e.target.value); setPage(1); }}>
            <MenuItem value="feature">Özellik (Feature Toggle)</MenuItem>
            <MenuItem value="companyMerge">Şirket Birleştirme</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="kind-label">Tür</InputLabel>
          <Select labelId="kind-label" label="Tür" value={kind} onChange={(e)=>{ setKind(e.target.value); setPage(1); }} disabled={scope !== 'feature'}>
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
  ), [kind, q, loading, onRefresh, scope]);

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
