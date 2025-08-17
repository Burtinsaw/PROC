import React from 'react';
import { Box, Typography, Stack, Paper, Stepper, Step, StepLabel, Button, Chip, TextField, Divider, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, CircularProgress, Slider, FormControlLabel, Switch, Alert, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Autocomplete } from '@mui/material';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../utils/axios';
import { talepExtractFromText, talepExtractFromFiles, talepGetStaging, talepCommitStaging } from '../../api/talep';
import { toast } from 'sonner';
import useAllowedCurrencies from '../../hooks/useAllowedCurrencies';

const steps = ['Oluşturuldu','İnceleme','Onay','Satınalma','Tamamlandı'];

export default function TalepTakip(){
  const { currencies: allowedCurrencies } = useAllowedCurrencies();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id') || 'TLP-001';
  const [talep, setTalep] = React.useState(null);
  const [poForTalep, setPoForTalep] = React.useState(null);
  const activeStep = 2; // placeholder
  const [busy, setBusy] = React.useState(false);
  const [extractText, setExtractText] = React.useState('');
  const [staging, setStaging] = React.useState({ jobId:null, items:[], count:0 });
  const [selected, setSelected] = React.useState(new Set());
  const [uploading, setUploading] = React.useState(false);
  const [confThreshold, setConfThreshold] = React.useState(0.65); // 65%
  const [hideLow, setHideLow] = React.useState(false);
  const [confirmLowOpen, setConfirmLowOpen] = React.useState(false);
  // PO oluşturma diyaloğu
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [supplierOptions, setSupplierOptions] = React.useState([]);
  const [supplierLoading, setSupplierLoading] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({ supplier: null, currency: 'TRY', deliveryDate: '', terms: '' });

  const normalizeConf = (v)=>{
    if (v == null) return null;
    const n = Number(v);
    if (!isFinite(n)) return null;
    if (n > 1) return Math.min(1, Math.max(0, n/100));
    if (n < 0) return 0;
    return n;
  };

  const confChip = (c)=>{
    const val = normalizeConf(c);
    if (val == null) return <Chip size="small" label="-" variant="outlined" />;
    const color = val >= 0.75 ? 'success' : val >= 0.5 ? 'warning' : 'error';
    const pct = `${Math.round(val*100)}%`;
    return <Chip size="small" color={color} variant="outlined" label={pct} />;
  };

  React.useEffect(()=>{
    let mounted = true;
    (async ()=>{
  try {
        // If id looks like code (has dashes and letters), fetch by code; else by numeric id
        const byCode = /[A-Z]+-\d{4}-\d{4}-/.test(id);
        const url = byCode ? `/talepler/code/${encodeURIComponent(id)}` : `/talepler/${encodeURIComponent(id)}`;
        const { data } = await axios.get(url);
        if(mounted) setTalep(data);
        // Eğer talep bulunduysa, mevcut bir PO var mı kontrol et
        try {
          if (mounted && data?.id) {
            const { data: po } = await axios.get(`/purchase-orders/by-talep/${data.id}`);
            if (mounted) setPoForTalep(po);
          }
        } catch { /* yoksa sorun değil */ }
        // Staging'i getir (varsa)
        try {
          const s = await talepGetStaging(data?.id || id).catch(()=>null);
          if(mounted && s?.ok){
            const items = s.items||[];
            setStaging({ jobId: s.jobId, items, count: s.count||items.length||0 });
            // Auto-select high-confidence items
            const defSel = new Set(items.filter(it => (normalizeConf(it.confidence) ?? 0) >= confThreshold).map(it => it.id));
            setSelected(defSel);
          }
        } catch{/* ignore */}
      } catch {/* ignore */}
  finally { /* noop */ }
    })();
    return ()=>{ mounted = false; };
  }, [id, confThreshold]);

  // PO oluşturma diyaloğu açıldığında tedarikçileri getir
  const loadSuppliers = React.useCallback(async(q='')=>{
    try{
      setSupplierLoading(true);
      const params = new URLSearchParams();
      params.set('types','supplier');
      if(q && q.trim()) params.set('q', q.trim());
      const { data } = await axios.get(`/companies?${params.toString()}`);
      setSupplierOptions(Array.isArray(data)? data: []);
    } catch { setSupplierOptions([]); }
    finally{ setSupplierLoading(false); }
  }, []);

  const openCreateDialog = async ()=>{
    setCreateOpen(true);
    // Varsayılan para birimi TRY kalsın, öncelikli listeden seçilebilir
    if(!supplierOptions.length) loadSuppliers();
  };

  const submitCreatePO = async ()=>{
    if(!talep?.id) return toast.error('Talep yüklenemedi');
    if(!createForm.supplier?.id) return toast.warning('Tedarikçi seçin');
    try{
      setCreating(true);
      // Talep kalemlerinden PO item'ları oluştur (fiyatlar bilinmiyor)
      const items = (talep?.urunler||[]).map(u => ({ description: u.urunAdi || 'Ürün', quantity: Number(u.miktar)||1, unitPrice: 0, totalPrice: 0 }));
      const payload = {
        talepId: talep.id,
        supplierId: createForm.supplier.id,
        items,
        deliveryDate: createForm.deliveryDate || null,
        terms: createForm.terms || null,
        currency: (createForm.currency||'TRY')
      };
      const { data } = await axios.post('/purchase-orders/create-from-request', payload);
      toast.success('PO oluşturuldu');
      setCreateOpen(false);
      // Detaya git
      const poId = data?.purchaseOrder?.id;
      if (poId) navigate(`/purchase-orders/${poId}`);
      else if (talep?.id) navigate(`/purchase-orders`);
    } catch(e){ toast.error(e?.response?.data?.error || 'PO oluşturulamadı'); }
    finally{ setCreating(false); }
  };

  const onExtractFromText = async ()=>{
    if(!extractText.trim()) return toast.warning('Metin girin');
    try{
      setBusy(true);
      const res = await talepExtractFromText(talep?.id || id, extractText.trim());
      if(res?.ok){
        const items = res.items||[];
        setStaging({ jobId: res.jobId, items, count: res.count||items.length||0 });
        // Auto-select high-confidence items
        setSelected(new Set(items.filter(it => (normalizeConf(it.confidence) ?? 0) >= confThreshold).map(it=>it.id)));
        toast.success(`${res.count||0} satır çıkarıldı`);
      }
    } catch(e){ toast.error(e?.response?.data?.message || 'Çıkarım başarısız'); }
    finally{ setBusy(false); }
  };

  const onUploadFiles = async (files)=>{
    if(!files?.length) return;
    try{
      setUploading(true);
      const res = await talepExtractFromFiles(talep?.id || id, files);
      if(res?.ok){
        const items = res.items||[];
        setStaging({ jobId: res.jobId, items, count: res.count||items.length||0 });
        setSelected(new Set(items.filter(it => (normalizeConf(it.confidence) ?? 0) >= confThreshold).map(it=>it.id)));
        toast.success(`${res.count||0} satır çıkarıldı`);
      }
    } catch(e){ toast.error(e?.response?.data?.message || 'Dosya yükleme/çıkarım hatası'); }
    finally{ setUploading(false); }
  };

  const onCommit = async ()=>{
    if(!staging.jobId) return toast.warning('Önce çıkarım yapın');
    // If any selected has low confidence under threshold, ask confirmation
    const itemsById = new Map((staging.items||[]).map(it => [it.id, it]));
    const lowSelected = Array.from(selected).filter(id => (normalizeConf(itemsById.get(id)?.confidence) ?? 0) < confThreshold);
    if(lowSelected.length){
      setConfirmLowOpen(true);
      return;
    }
    try{
      setBusy(true);
      const itemIds = Array.from(selected);
      const res = await talepCommitStaging(talep?.id || id, staging.jobId, itemIds);
      if(res?.ok){ toast.success(`${res.committed||0} kalem işlendi`); }
    } catch(e){ toast.error(e?.response?.data?.message || 'Aktarım hatası'); }
    finally{ setBusy(false); }
  };

  const proceedCommitDespiteLow = async ()=>{
    setConfirmLowOpen(false);
    try{
      setBusy(true);
      const itemIds = Array.from(selected);
      const res = await talepCommitStaging(talep?.id || id, staging.jobId, itemIds);
      if(res?.ok){ toast.success(`${res.committed||0} kalem işlendi`); }
    } catch(e){ toast.error(e?.response?.data?.message || 'Aktarım hatası'); }
    finally{ setBusy(false); }
  };
  return (
    <Box p={3} sx={{ display:'flex', flexDirection:'column', gap:3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={2} alignItems="center">
          <Button size="small" variant="text" startIcon={<ArrowLeft size={16} />} onClick={()=>navigate('/talep')}>Geri</Button>
          <Typography variant="h4" fontWeight={600}>Talep Takip</Typography>
        </Stack>
        <Stack direction="row" gap={1} alignItems="center">
          {poForTalep?.id ? (
            <Button variant="outlined" size="small" onClick={()=> navigate(`/purchase-orders/${poForTalep.id}`)}>PO’ya git</Button>
          ) : (
            <Button variant="contained" size="small" disabled={!talep || (String(talep?.durum||'').toLowerCase()!=='onaylandı'.toLowerCase())} onClick={openCreateDialog}>PO oluştur</Button>
          )}
        </Stack>
      </Stack>
      <Paper elevation={0} sx={{ p:3, borderRadius:3, display:'flex', flexDirection:'column', gap:3 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="subtitle1" fontWeight={600}>{id}</Typography>
          {talep?.proformaNumber && (
            <Chip size="small" color="info" variant="outlined" label={talep.proformaNumber}
              onClick={()=> navigate(`/proforma/${encodeURIComponent(talep.proformaNumber)}`)} />
          )}
        </Stack>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* AI Maestro: Talep Extract Staging Paneli */}
        <Divider sx={{ my:1 }} />
  <Typography variant="h6" fontWeight={600}>Ürün Çıkarım (AI Maestro)</Typography>
        <Stack direction={{ xs:'column', md:'row' }} gap={2} alignItems={{ xs:'stretch', md:'flex-start' }}>
          <Box flex={1}>
            <TextField
              label="Metinden çıkar (her satır bir ürün olabilir)"
              multiline
              minRows={4}
              fullWidth
              value={extractText}
              onChange={(e)=>setExtractText(e.target.value)}
            />
            <Stack direction="row" gap={1} sx={{ mt:1 }}>
              <Button variant="contained" disabled={busy} onClick={onExtractFromText}>Metinden Çıkar</Button>
              <Button component="label" variant="outlined" startIcon={<Upload size={16} />} disabled={uploading}>
                Dosya Yükle
                <input type="file" multiple accept=".txt,.pdf,.doc,.docx,.xlsx,.xls,.csv,.tsv,.png,.jpg,.jpeg,.bmp,.tif,.tiff,.webp,.html,.htm" hidden onChange={(e)=>onUploadFiles(Array.from(e.target.files||[]))} />
              </Button>
              {busy || uploading ? <CircularProgress size={20} /> : null}
            </Stack>
          </Box>
          <Box flex={2}>
            <Typography variant="subtitle2" gutterBottom>Staging Kalemleri ({staging.count||0})</Typography>
            {/* Low confidence summary and controls */}
            {(() => {
              const items = staging.items||[];
              const lows = items.filter(i => (normalizeConf(i.confidence) ?? 0) < confThreshold);
              return items.length ? (
                <Stack direction={{ xs:'column', md:'row' }} alignItems={{ xs:'stretch', md:'center' }} justifyContent="space-between" sx={{ mb: 1 }}>
                  <Alert severity={lows.length ? 'warning' : 'success'} sx={{ flex: 1, mr: { md: 2 } }}>
                    {lows.length ? `${lows.length} düşük güvenli kalem gözden geçirilmeli` : 'Tüm kalemler eşik üzerinde görünüyor'}
                  </Alert>
                  <Stack direction="row" gap={2} alignItems="center" sx={{ mt: { xs: 1, md: 0 } }}>
                    <Typography variant="caption" color="text.secondary">Güven eşiği</Typography>
                    <Slider size="small" min={0} max={100} step={5}
                      value={Math.round(confThreshold*100)}
                      onChange={(_, v)=>{
                        const thr = (Array.isArray(v)? v[0]: v)/100;
                        setConfThreshold(thr);
                        // Reselect based on new threshold (keep user intent by only adding high ones)
                        setSelected(prev => {
                          const s = new Set(prev);
                          for(const it of items){
                            const val = (normalizeConf(it.confidence) ?? 0);
                            if(val >= thr) s.add(it.id); else s.delete(it.id);
                          }
                          return s;
                        });
                      }}
                      sx={{ width: 160 }}
                    />
                    <FormControlLabel control={<Switch size="small" checked={hideLow} onChange={e=> setHideLow(e.target.checked)} />} label={<Typography variant="caption">Düşük güvenlileri gizle</Typography>} />
                    <Button size="small" variant="outlined" onClick={()=> setSelected(new Set((staging.items||[]).filter(i => (normalizeConf(i.confidence) ?? 0) >= confThreshold).map(i=>i.id)))}>Yüksek güvenlileri seç</Button>
                  </Stack>
                </Stack>
              ) : null;
            })()}
            <Paper variant="outlined" sx={{ maxHeight: 360, overflow:'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox
                      indeterminate={selected.size>0 && selected.size<(staging.items?.length||0)}
                      checked={selected.size>0 && selected.size===(staging.items?.length||0)}
                      onChange={(e)=>{
                        if(e.target.checked) setSelected(new Set((staging.items||[]).map(i=>i.id)));
                        else setSelected(new Set());
                      }} /></TableCell>
                    <TableCell>Satır</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>Marka</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Artikel</TableCell>
                    <TableCell>Miktar</TableCell>
                    <TableCell>Birim</TableCell>
                    <TableCell>Güven</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(staging.items||[]).filter(it=> !hideLow || ((normalizeConf(it.confidence) ?? 0) >= confThreshold)).map(it=> {
                    const isLow = (normalizeConf(it.confidence) ?? 0) < confThreshold;
                    return (
                    <TableRow key={it.id} hover sx={isLow ? (theme)=> ({ background: theme.palette.mode==='dark' ? 'rgba(255,0,0,0.06)' : 'rgba(255,0,0,0.04)' }) : undefined}>
                      <TableCell padding="checkbox"><Checkbox checked={selected.has(it.id)} onChange={(e)=>{
                        setSelected(prev => { const s=new Set(prev); if(e.target.checked) s.add(it.id); else s.delete(it.id); return s; });
                      }} /></TableCell>
                      <TableCell>{it.rawLine || it.name || '-'}</TableCell>
                      <TableCell>{it.description || '-'}</TableCell>
                      <TableCell>{it.brand || '-'}</TableCell>
                      <TableCell>{it.model || '-'}</TableCell>
                      <TableCell>{it.article_code || it.articleCode || '-'}</TableCell>
                      <TableCell>{it.quantity || 1}</TableCell>
                      <TableCell>{it.unit || '-'}</TableCell>
                      <TableCell>{confChip(it.confidence)}</TableCell>
                    </TableRow>
                  );})}
                  {!(staging.items||[]).length && (
                    <TableRow><TableCell colSpan={9} align="center">Henüz staging yok</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
            <Stack direction="row" justifyContent="flex-end" sx={{ mt:1 }}>
              <Button variant="contained" disabled={!staging.jobId || selected.size===0 || busy} onClick={onCommit}>Seçilenleri İçe Aktar</Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Confirm low-confidence commit dialog */}
      <Dialog open={confirmLowOpen} onClose={()=> setConfirmLowOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Düşük güvenli satırlar seçili</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Seçiminizde güven eşiğinin altında kalemler var. Yine de aktarmak istiyor musunuz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setConfirmLowOpen(false)}>Vazgeç</Button>
          <Button variant="contained" color="warning" onClick={proceedCommitDespiteLow}>Evet, aktar</Button>
        </DialogActions>
      </Dialog>

      {/* PO Oluşturma Diyaloğu */}
      <Dialog open={createOpen} onClose={()=> setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>PO oluştur</DialogTitle>
        <DialogContent dividers>
          <Stack gap={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={supplierOptions}
              loading={supplierLoading}
              getOptionLabel={(o)=> o?.name || ''}
              onOpen={()=> { if(!supplierOptions.length) loadSuppliers(); }}
              onInputChange={(_, v)=>{ if(v && v.length>=2) loadSuppliers(v); }}
              value={createForm.supplier}
              onChange={(_, v)=> setCreateForm(f=> ({ ...f, supplier: v, currency: (v?.preferredCurrency || f.currency) }))}
              renderInput={(params)=> (
                <TextField {...params} label="Tedarikçi" placeholder="Tedarikçi ara..." size="small" />
              )}
            />
            <TextField select size="small" label="Para Birimi" value={createForm.currency} onChange={e=> setCreateForm(f=> ({ ...f, currency: e.target.value }))}>
              {allowedCurrencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Teslim Tarihi" type="date" InputLabelProps={{ shrink: true }} value={createForm.deliveryDate} onChange={e=> setCreateForm(f=> ({ ...f, deliveryDate: e.target.value }))} />
            <TextField size="small" label="Şartlar/Notlar" multiline minRows={2} value={createForm.terms} onChange={e=> setCreateForm(f=> ({ ...f, terms: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setCreateOpen(false)}>Vazgeç</Button>
          <Button variant="contained" disabled={creating || !createForm.supplier} onClick={submitCreatePO}>{creating? 'Oluşturuluyor…':'Oluştur'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
