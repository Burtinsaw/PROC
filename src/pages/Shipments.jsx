import React, { useEffect, useMemo, useState, lazy, Suspense, useCallback } from 'react';
import { Box, Stack, Button, CircularProgress, Select, MenuItem, TextField } from '@mui/material';
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
  const INCOTERMS = useMemo(()=>['EXW','FCA','FOB','CFR','CIF','CPT','CIP','DAP','DDP'],[]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
  const { data } = await axios.get('/shipments');
      const list = data?.shipments || data || [];
  setRows(list.map(s => ({ id: s.id, trackingNo: s.trackingNo || s.code, status: s.status, carrier: s.carrier || '-', incoterm: s.incoterm || '-', eta: s.eta, createdAt: s.createdAt })));
    } catch(e) { console.error('Shipments error', e); toast.error('Sevkiyatlar alınamadı'); } finally { setLoading(false);} }
  ,[]);

  useEffect(()=>{ load(); },[load]);

  // URL query senkronizasyonu
  useEffect(()=>{
    const next = {};
    if(incotermFilter) next.incoterm = incotermFilter;
    if(q) next.q = q;
    setSearchParams(next, { replace: true });
  },[incotermFilter, q, setSearchParams]);

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
    { field:'eta', headerName:'ETA', flex:0.6, minWidth:140, valueGetter: ({ value }) => value ? new Date(value).toLocaleDateString('tr-TR') : '-' },
    { field:'createdAt', headerName:'Oluşturma', flex:0.9, minWidth:160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ];

  const filtered = useMemo(()=> {
    const byIncoterm = !incotermFilter ? rows : rows.filter(r => r.incoterm === incotermFilter);
    if(!q) return byIncoterm;
    const needle = q.toLowerCase();
    return byIncoterm.filter(r =>
      String(r.trackingNo||'').toLowerCase().includes(needle) ||
      String(r.carrier||'').toLowerCase().includes(needle) ||
      String(r.status||'').toLowerCase().includes(needle)
    );
  }, [rows, incotermFilter, q]);

  const exportCsv = () => {
    // CSV'ye uygun kolonlar
    const csvColumns = [
      { field:'trackingNo', headerName:'Takip No' },
      { field:'carrier', headerName:'Taşıyıcı' },
      { field:'incoterm', headerName:'Incoterm' },
      { field:'status', headerName:'Durum' },
      { field:'eta', headerName:'ETA' },
      { field:'createdAt', headerName:'Oluşturma' },
    ];
    const source = selected.length ? filtered.filter(r => selected.includes(r.id)) : filtered;
    exportRowsToCsv({ filename: selected.length ? `shipments_selected_${selected.length}.csv` : 'shipments.csv', rows: source, columns: csvColumns });
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
      <Button onClick={()=>{ setQueryDraft(''); setIncotermFilter(''); }} variant="text">Filtreleri temizle</Button>
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
