import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Stack, Tooltip, TableSortLabel, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Select, MenuItem } from '@mui/material';
import { Download, Upload, Plus, Pencil, Trash2, Merge } from 'lucide-react';
import api from '../../services/api';
import CompanyDialog from './CompanyDialog';
import companyService from '../../services/companyService';
import CompaniesCsvImportDialog from './CompaniesCsvImportDialog';
import usePermissions from '../../hooks/usePermissions';
import { orderedCurrencies, PRIORITY_CURRENCIES } from '../../constants/currencies';

export default function Companies(){
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [pc, setPc] = useState('');
  const [currencies, setCurrencies] = useState(null);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [csvDlgOpen, setCsvDlgOpen] = useState(false);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeSource, setMergeSource] = useState(null);
  const [mergeTarget, setMergeTarget] = useState(null);
  const [mergePreview, setMergePreview] = useState(null);
  const [mergeLoading, setMergeLoading] = useState(false);
  const { any } = usePermissions();

  useEffect(()=>{
    (async ()=>{
      const params = new URLSearchParams();
      if(q) params.set('q', q);
  if(pc) params.set('preferredCurrency', pc);
      const { data } = await api.get(`/companies?${params.toString()}`);
      setRows(data||[]);
    })();
  // only run on mount; search uses explicit handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Allowed currencies'i bir defa yükle (fallback: statik sıra)
  useEffect(()=>{
    (async ()=>{
      try{
        const { data } = await api.get('/companies/_allowed-currencies');
        const list = Array.isArray(data?.allowedCurrencies) ? data.allowedCurrencies : [];
        const uniq = Array.from(new Set(list.map(c => String(c || '').toUpperCase()).filter(Boolean)));
        const prioritized = [
          ...PRIORITY_CURRENCIES.filter(c => uniq.includes(c)),
          ...uniq.filter(c => !PRIORITY_CURRENCIES.includes(c))
        ];
        setCurrencies(prioritized.length ? prioritized : null);
      } catch{
        setCurrencies(null);
      }
    })();
  }, []);

  function handleRequestSort(property){
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }

  function stableSort(array, comparator){
    const stabilized = array.map((el, index) => [el, index]);
    stabilized.sort((a, b) => {
      const orderRes = comparator(a[0], b[0]);
      if (orderRes !== 0) return orderRes;
      return a[1] - b[1];
    });
    return stabilized.map(el => el[0]);
  }

  function getComparator(ord, ordBy){
    return ord === 'desc'
      ? (a,b) => descendingComparator(a,b,ordBy)
      : (a,b) => -descendingComparator(a,b,ordBy);
  }

  function descendingComparator(a,b,ordBy){
    const av = (a?.[ordBy] ?? '').toString().toLowerCase();
    const bv = (b?.[ordBy] ?? '').toString().toLowerCase();
    if (bv < av) return -1;
    if (bv > av) return 1;
    return 0;
  }

  const sorted = stableSort(rows, getComparator(order, orderBy));
  const paged = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb:2, fontWeight:700 }}>Şirketler</Typography>
      <Card sx={{ mb:2 }}>
        <CardContent>
          <Grid container spacing={1} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField fullWidth placeholder="Ara (ad/kod/email/telefon)" value={q} onChange={(e)=> setQ(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Select fullWidth displayEmpty value={pc} onChange={(e)=> setPc(e.target.value)}>
                <MenuItem value=""><em>PB: Tümü</em></MenuItem>
                {(currencies || orderedCurrencies()).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button variant="contained" onClick={async ()=>{
                const params = new URLSearchParams();
                if(q) params.set('q', q);
                if(pc) params.set('preferredCurrency', pc);
                const { data } = await api.get(`/companies?${params.toString()}`);
                setRows(data||[]);
              }} startIcon={<Plus size={16} />}>Ara</Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="primary" startIcon={<Plus size={16} />} onClick={()=> { setEditing(null); setDlgOpen(true); }}>Yeni Şirket</Button>
                <Button variant="outlined" startIcon={<Download size={16} />} onClick={()=> window.open('/api/companies/export', '_blank')}>Dışa Aktar</Button>
                <Button variant="outlined" startIcon={<Download size={16} />} onClick={()=>{
                  const params = new URLSearchParams();
                  if(q) params.set('q', q);
                  if(pc) params.set('preferredCurrency', pc);
                  const url = `/api/companies/export${params.toString()?`?${params.toString()}`:''}`;
                  window.open(url, '_blank');
                }}>Dışa Aktar (Filtreli)</Button>
                <Button variant="outlined" startIcon={<Upload size={16} />} onClick={()=> setCsvDlgOpen(true)}>İçe Aktar (CSV)</Button>
                <Button variant="outlined" startIcon={<Upload size={16} />} onClick={()=> setImporting(true)}>İçe Aktar (JSON)</Button>
                {any(['settings:write']) && (
                  <Button variant="outlined" startIcon={<Merge size={16} />} onClick={()=> setMergeOpen(true)}>Birleştir</Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy==='name'?order:false}>
                <TableSortLabel active={orderBy==='name'} direction={orderBy==='name'?order:'asc'} onClick={()=>handleRequestSort('name')}>Ad</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy==='code'?order:false}>
                <TableSortLabel active={orderBy==='code'} direction={orderBy==='code'?order:'asc'} onClick={()=>handleRequestSort('code')}>Kod</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy==='type'?order:false}>
                <TableSortLabel active={orderBy==='type'} direction={orderBy==='type'?order:'asc'} onClick={()=>handleRequestSort('type')}>Tür</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy==='email'?order:false}>
                <TableSortLabel active={orderBy==='email'} direction={orderBy==='email'?order:'asc'} onClick={()=>handleRequestSort('email')}>E-posta</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy==='phone'?order:false}>
                <TableSortLabel active={orderBy==='phone'} direction={orderBy==='phone'?order:'asc'} onClick={()=>handleRequestSort('phone')}>Telefon</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy==='preferredCurrency'?order:false}>
                <TableSortLabel active={orderBy==='preferredCurrency'} direction={orderBy==='preferredCurrency'?order:'asc'} onClick={()=>handleRequestSort('preferredCurrency')}>PB</TableSortLabel>
              </TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.code}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{r.preferredCurrency || '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Düzenle"><IconButton onClick={()=> { setEditing(r); setDlgOpen(true); }}><Pencil size={16} /></IconButton></Tooltip>
                  <Tooltip title="Sil"><IconButton color="error" onClick={async ()=>{
                    if(!confirm('Silmek istediğinize emin misiniz?')) return;
                    await companyService.deleteCompany(r.id);
                    const params = new URLSearchParams(); if(q) params.set('q', q); if(pc) params.set('preferredCurrency', pc); const { data } = await api.get(`/companies?${params.toString()}`); setRows(data||[]);
                  }}><Trash2 size={16} /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10,25,50,100]}
        />
      </Card>

      {/* Create/Edit Dialog */}
      <CompanyDialog
        open={dlgOpen}
        initial={editing}
        onClose={async (changed)=>{
          setDlgOpen(false);
          setEditing(null);
          if(changed){
            const params = new URLSearchParams(); if(q) params.set('q', q); if(pc) params.set('preferredCurrency', pc); const { data } = await api.get(`/companies?${params.toString()}`); setRows(data||[]);
          }
        }}
        onSubmit={async (form)=>{
          if(editing?.id) await companyService.updateCompany(editing.id, form);
          else await companyService.createCompany(form);
        }}
      />

      {/* CSV Import Dialog with preview & dedupe */}
      <CompaniesCsvImportDialog
        open={csvDlgOpen}
        onClose={()=> setCsvDlgOpen(false)}
        onImported={async ()=>{
          const params = new URLSearchParams(); if(q) params.set('q', q); if(pc) params.set('preferredCurrency', pc); const { data } = await api.get(`/companies?${params.toString()}`); setRows(data||[]);
        }}
      />

      {/* Import JSON */}
      {importing && (
        <input type="file" accept="application/json" style={{ display:'none' }} id="comp-import" onChange={async (e)=>{
          const file = e.target.files?.[0];
          if(!file){ setImporting(false); return; }
          try {
            const text = await file.text();
            const json = JSON.parse(text);
            const companies = Array.isArray(json) ? json : (Array.isArray(json.companies) ? json.companies : []);
            if(!companies.length) alert('Geçerli bir companies JSON bekleniyor.');
            else {
              await companyService.importCompanies(companies);
              const params = new URLSearchParams(); if(q) params.set('q', q); if(pc) params.set('preferredCurrency', pc); const { data } = await api.get(`/companies?${params.toString()}`); setRows(data||[]);
            }
          } catch(err){
            alert('İçe aktarma hatası: ' + (err?.message||'bilinmiyor'));
          } finally {
            setImporting(false);
            e.target.value = '';
          }
        }} />
      )}
      {importing && setTimeout(()=>{
        const input = document.getElementById('comp-import');
        if(input) input.click();
      }, 0)}

      {/* Merge Dialog */}
      <Dialog open={mergeOpen} onClose={()=> setMergeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Şirket Birleştir</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={rows}
                getOptionLabel={(o)=> o?.name ? `${o.name}${o.code?` (${o.code})`:''}` : ''}
                onChange={(_,v)=> setMergeSource(v)}
                renderInput={(params)=> <TextField {...params} label="Kaynak (taşınacak)" placeholder="Şirket seçin" />}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={rows}
                getOptionLabel={(o)=> o?.name ? `${o.name}${o.code?` (${o.code})`:''}` : ''}
                onChange={(_,v)=> setMergeTarget(v)}
                renderInput={(params)=> <TextField {...params} label="Hedef (kalacak)" placeholder="Şirket seçin" />}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={1}>
                <Button disabled={!mergeSource || !mergeTarget || mergeSource?.id===mergeTarget?.id} onClick={async ()=>{
                  if(!mergeSource || !mergeTarget) return;
                  setMergeLoading(true);
                  try{
                    const p = await companyService.previewMergeCompanies(mergeSource.id, mergeTarget.id);
                    setMergePreview(p);
                  } catch(err){
                    alert('Önizleme hatası: ' + (err?.response?.data?.message || err?.message || 'bilinmiyor'));
                  } finally { setMergeLoading(false); }
                }}>Önizleme</Button>
                <Button variant="contained" color="error" disabled={!mergePreview || mergeSource?.id===mergeTarget?.id || mergeLoading} onClick={async ()=>{
                  if(!mergeSource || !mergeTarget) return;
                  if(!confirm(`${mergeSource.name} -> ${mergeTarget.name} birleştirilecek. Emin misiniz?`)) return;
                  setMergeLoading(true);
                  try{
                    await companyService.mergeCompanies(mergeSource.id, mergeTarget.id);
                    alert('Birleştirme tamamlandı.');
                    // refresh list
                    const params = new URLSearchParams(); if(q) params.set('q', q); if(pc) params.set('preferredCurrency', pc); const { data } = await api.get(`/companies?${params.toString()}`); setRows(data||[]);
                    setMergeOpen(false); setMergeSource(null); setMergeTarget(null); setMergePreview(null);
                    // Audit ekranını birleştirme kapsamıyla aç (paylaşılabilir ve izlenebilir)
                    const auditUrl = `/admin/audit?scope=companyMerge&q=${encodeURIComponent(String(mergeTarget?.name || ''))}`;
                    window.open(auditUrl, '_blank');
                  } catch(err){
                    alert('Birleştirme hatası: ' + (err?.response?.data?.message || err?.message || 'bilinmiyor'));
                  } finally { setMergeLoading(false); }
                }}>Birleştir ve Taşı</Button>
              </Stack>
            </Grid>
            {!!mergePreview && (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined"><CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Taşınacak Kayıtlar</Typography>
                  <Typography variant="body2">Proformalar: <b>{mergePreview?.counts?.proformas||0}</b></Typography>
                  <Typography variant="body2">Satınalma Siparişleri: <b>{mergePreview?.counts?.purchaseOrders||0}</b></Typography>
                  <Typography variant="body2">Teklifler: <b>{mergePreview?.counts?.quotes||0}</b></Typography>
                  <Typography variant="body2">RFQ Davetleri: <b>{mergePreview?.counts?.rfqInvites||0}</b></Typography>
                  <Typography variant="body2">İhale Kazanan (RFQ): <b>{mergePreview?.counts?.rfqsAwarded||0}</b></Typography>
                  <Typography variant="body2">Kullanıcılar: <b>{mergePreview?.counts?.users||0}</b></Typography>
                  <Typography variant="body2">Araştırma Kayıtları: <b>{mergePreview?.counts?.researchSaved||0}</b></Typography>
                </CardContent></Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setMergeOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
