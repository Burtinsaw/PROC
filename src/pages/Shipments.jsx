import React, { useEffect, useMemo, useState, lazy, Suspense, useCallback } from 'react';
import { Box, Stack, Button, CircularProgress, Select, MenuItem, TextField, FormControlLabel, Switch } from '@mui/material';
import StatusChip from '../components/common/StatusChip';
// DataGrid'i lazy alt bileşene taşıdık
const ShipmentsGrid = lazy(() => import('../tables/ShipmentsGrid'));
import PageHeader from '../components/common/PageHeader';
import MainCard from '../components/common/MainCard';
import axios from '../utils/axios';
import { toast } from 'sonner';
import { exportRowsToCsv } from '../utils/csv';
import { useSearchParams } from 'react-router-dom';

export default function Shipments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [incotermFilter, setIncotermFilter] = useState(searchParams.get('incoterm') || '');
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [queryDraft, setQueryDraft] = useState(searchParams.get('q') || '');
  const [onlyOpen, setOnlyOpen] = useState(searchParams.get('open') === '1');
  const INCOTERMS = useMemo(()=>['EXW','FCA','FOB','CFR','CIF','CPT','CIP','DAP','DDP'],[]);
  const openCount = useMemo(()=> rows.reduce((acc,r)=> acc + (Number(r.openExceptions||0) > 0 ? 1 : 0), 0), [rows]);
  const filterCount = useMemo(()=> (q?1:0) + (incotermFilter?1:0) + (onlyOpen?1:0), [q, incotermFilter, onlyOpen]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
  const { data } = await axios.get('/shipments');
      const list = data?.shipments || data || [];
  setRows(list.map(s => ({ id: s.id, trackingNo: s.trackingNo || s.code, status: s.status, carrier: s.carrier || '-', incoterm: s.incoterm || '-', openExceptions: s.openExceptions || 0, eta: s.eta, createdAt: s.createdAt })));
    } catch(e) { console.error('Shipments error', e); toast.error('Sevkiyatlar alınamadı'); } finally { setLoading(false);} }
  ,[]);

  useEffect(()=>{ load(); },[load]);

  // URL query senkronizasyonu
  useEffect(()=>{
    const next = {};
    if(incotermFilter) next.incoterm = incotermFilter;
    if(q) next.q = q;
    if(onlyOpen) next.open = '1';
    setSearchParams(next, { replace: true });
  },[incotermFilter, q, onlyOpen, setSearchParams]);

  // Debounce for search typing -> commit to q after 300ms
  useEffect(()=>{
    const t = setTimeout(()=> setQ(queryDraft), 300);
    return ()=> clearTimeout(t);
  }, [queryDraft]);

  const columns = [
    { field:'trackingNo', headerName:'Takip No', flex:0.8, minWidth:140 },
  { field:'carrier', headerName:'Taşıyıcı', flex:0.8, minWidth:140 },
  { field:'incoterm', headerName:'Incoterm', flex:0.6, minWidth:120 },
  { field:'status', headerName:'Durum', flex:0.7, minWidth:130, renderCell: ({ value }) => <StatusChip status={value} /> },
    { field:'openExceptions', headerName:'Açık İstisna', flex:0.5, minWidth:120, valueGetter: ({ value }) => Number(value||0), renderCell: ({ value }) => (
      <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:12, fontSize:12,
        background: value>0 ? 'rgba(245, 124, 0, 0.15)' : 'rgba(76, 175, 80, 0.15)',
        color: value>0 ? '#EF6C00' : '#2E7D32',
        border: `1px solid ${value>0 ? 'rgba(239,108,0,0.35)' : 'rgba(46,125,50,0.35)'}` }}>
        {value||0}
      </span>
    ) },
    { field:'eta', headerName:'ETA', flex:0.6, minWidth:140, valueGetter: ({ value }) => value ? new Date(value).toLocaleDateString('tr-TR') : '-' },
    { field:'createdAt', headerName:'Oluşturma', flex:0.9, minWidth:160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ];

  const filtered = useMemo(()=> {
    const byIncoterm = !incotermFilter ? rows : rows.filter(r => r.incoterm === incotermFilter);
    const byOpen = !onlyOpen ? byIncoterm : byIncoterm.filter(r => Number(r.openExceptions||0) > 0);
    if(!q) return byOpen;
    const needle = q.toLowerCase();
    return byOpen.filter(r =>
      String(r.trackingNo||'').toLowerCase().includes(needle) ||
      String(r.carrier||'').toLowerCase().includes(needle) ||
      String(r.status||'').toLowerCase().includes(needle)
    );
  }, [rows, incotermFilter, onlyOpen, q]);

  const exportCsv = () => {
    const sanitize = (s) => String(s||'').toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'');
    // CSV'ye uygun kolonlar
    const csvColumns = [
      { field:'trackingNo', headerName:'Takip No' },
      { field:'carrier', headerName:'Taşıyıcı' },
      { field:'incoterm', headerName:'Incoterm' },
      { field:'status', headerName:'Durum' },
  { field:'openExceptions', headerName:'Açık İstisna' },
      { field:'eta', headerName:'ETA' },
      { field:'createdAt', headerName:'Oluşturma' },
    ];
    const source = selected.length ? filtered.filter(r => selected.includes(r.id)) : filtered;
    const parts = [];
    if (onlyOpen) parts.push('open');
    if (incotermFilter) parts.push(`incoterm-${sanitize(incotermFilter)}`);
    if (q) parts.push(`q-${sanitize(q)}`);
    const suffix = parts.length ? `_${parts.join('_')}` : '';
    const base = selected.length ? `shipments_selected_${selected.length}` : 'shipments';
    exportRowsToCsv({ filename: `${base}${suffix}.csv`, rows: source, columns: csvColumns });
  };

  return (
    <Box>
    <PageHeader title="Sevkiyatlar" description="Takipteki sevkiyatlar" right={
        <Stack direction="row" spacing={1} alignItems="center">
  <TextField size="small" placeholder="Ara (takip no, taşıyıcı, durum)" value={queryDraft} onChange={e=>setQueryDraft(e.target.value)} />
          <Select size="small" value={incotermFilter} displayEmpty onChange={e=>setIncotermFilter(e.target.value)} sx={{ minWidth: 140 }}
            renderValue={(v)=> v || 'Incoterm (tümü)'}>
            <MenuItem value=""><em>Tümü</em></MenuItem>
            {INCOTERMS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
          </Select>
      <FormControlLabel sx={{ ml: 1 }} control={<Switch size="small" checked={onlyOpen} onChange={(e)=> setOnlyOpen(e.target.checked)} />} label={`Sadece açık istisna (${openCount})`} />
  <Button onClick={()=>{ setQueryDraft(''); setQ(''); setIncotermFilter(''); setOnlyOpen(false); setSearchParams({}, { replace:true }); }} variant="text">{`Filtreleri temizle${filterCount ? ` (${filterCount})` : ''}`}</Button>
      <Button onClick={exportCsv} variant="outlined">CSV</Button>
          <Button onClick={load} variant="outlined">Yenile</Button>
        </Stack>
      } />
      <MainCard content={false} sx={{ mt:1 }}>
        <Box sx={{ height: 520 }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height:'100%' }}><CircularProgress /></Stack>
          ) : (
            <Suspense fallback={<Stack alignItems="center" justifyContent="center" sx={{ height:'100%' }}><CircularProgress /></Stack>}>
              <ShipmentsGrid rows={filtered} columns={columns} selectedIds={selected} onSelectionChange={setSelected} />
            </Suspense>
          )}
        </Box>
      </MainCard>
    </Box>
  );
}
