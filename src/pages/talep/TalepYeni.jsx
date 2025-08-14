import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Stack, Button, Paper, TextField, Grid, Chip, IconButton, Divider, Tooltip, Autocomplete, Alert, LinearProgress, Stepper, Step, StepLabel } from '@mui/material';
import { Save, ArrowLeft, Plus, Copy, Trash2, GripVertical, ArrowUp, ArrowDown, CloudUpload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import BulkImportDialog from '../../components/bulk/BulkImportDialog';
import ExtractReviewDialog from '../../components/bulk/ExtractReviewDialog';
import usePermissions from '../../hooks/usePermissions';
import { toast } from 'sonner';

const emptyProduct = { name: '', quantity: 1, unit: 'adet', brand: '', articleNumber: '' };

export default function TalepYeni(){
  const navigate = useNavigate();
  const { any } = usePermissions();
  const canCreate = any(['requests:create']);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [requester, setRequester] = useState('');
  const [department, setDepartment] = useState('Satın Alma');
  const [products, setProducts] = useState([{ ...emptyProduct }]);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [clipboardPrime, setClipboardPrime] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importInfo, setImportInfo] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewItems, setReviewItems] = useState([]);
  const [activeStep, setActiveStep] = useState(0); // 0: Bilgiler, 1: Ürünler, 2: Özet

  const productErrors = (p) => ({
    name: !p.name,
    quantity: !p.quantity || Number(p.quantity) <= 0,
    unit: !p.unit
  });
  const disabled = useMemo(()=> !title || !company || products.some(p=> Object.values(productErrors(p)).some(Boolean)), [title, company, products]);
  const canNextFromStep = (step) => {
    if(step===0){
      return !!title && !!company;
    }
    if(step===1){
      return products.length>0 && products.every(p=> !Object.values(productErrors(p)).some(Boolean));
    }
    return true;
  };
  const goNext = () => { if(canNextFromStep(activeStep)) setActiveStep(s=> Math.min(2, s+1)); };
  const goBack = () => setActiveStep(s=> Math.max(0, s-1));

  const addProduct = () => setProducts(arr => [...arr, { ...emptyProduct }]);
  const removeProduct = (idx) => setProducts(arr => arr.filter((_,i)=> i!==idx));
  const updateProduct = (idx, key, value) => setProducts(arr => arr.map((p,i)=> i===idx ? { ...p, [key]: value } : p));

  // Şirket önerileri
  useEffect(()=>{
    let active = true;
    (async ()=>{
      try {
        setLoadingCompanies(true);
        const { data } = await axios.get('/talepler/companies');
        if(active) setCompanies(Array.isArray(data)? data: []);
  } catch{ /* ignore */ }
      finally { if(active) setLoadingCompanies(false); }
    })();
    return ()=>{ active=false; };
  }, []);

  // Autosave restore
  useEffect(()=>{
    try {
      const raw = localStorage.getItem('talepYeniDraft_v1');
      if(raw){
        const draft = JSON.parse(raw);
        if(draft && !title){
          setTitle(draft.title||'');
          setDescription(draft.description||'');
          setCompany(draft.company||'');
          setRequester(draft.requester||'');
          setDepartment(draft.department||'Satın Alma');
          if(Array.isArray(draft.products) && draft.products.length) setProducts(draft.products);
          // Taslak sessizce yüklensin; bilgi tostu göstermiyoruz
        }
      }
    } catch{/* ignore */}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=>{
    const draft = { title, description, company, requester, department, products };
    try { localStorage.setItem('talepYeniDraft_v1', JSON.stringify(draft)); } catch{/* ignore */}
  }, [title, description, company, requester, department, products]);

  // Clipboard bulk detect
  useEffect(()=>{
    function looksTabular(text){
      if(!text) return false;
      const lines = text.split(/\r?\n/).filter(l=>l.trim());
      if(lines.length < 2) return false;
      const delimiterCandidates = ['\t',';','|',','];
      let del = ','; let bestScore = 0;
      for(const d of delimiterCandidates){
        const counts = lines.slice(0,5).map(l=>l.split(d).length);
        const variance = counts.reduce((a,c)=>a+c,0)/counts.length - 1;
        if(Math.min(...counts) > 1 && variance >= bestScore){ bestScore = variance; del = d; }
      }
      const firstCols = lines[0].split(del).length;
      const secondCols = lines[1].split(del).length;
      return firstCols > 1 && secondCols === firstCols;
    }
    const handler = (e) => {
      try {
        const text = e.clipboardData?.getData('text/plain');
        if(!text) return;
        if(!bulkOpen && looksTabular(text)){
          setClipboardPrime(text);
          setBulkOpen(true);
        }
      } catch{/* ignore */}
    };
    window.addEventListener('paste', handler, { passive:true });
    return ()=> window.removeEventListener('paste', handler);
  }, [bulkOpen]);

  const clearDraft = () => { try { localStorage.removeItem('talepYeniDraft_v1'); } catch { /* ignore */ } toast.success('Taslak temizlendi'); };

  const submit = async () => {
    if(disabled) return;
    try {
      const payload = {
        title,
        description,
        externalCompanyName: company,
        externalRequesterName: requester,
        internalRequester: { department },
        products: products.map(p=>({ ...p, quantity: Number(p.quantity)||1 }))
      };
      const { data } = await axios.post('/talepler', payload);
      toast.success('Talep oluşturuldu');
  try { localStorage.removeItem('talepYeniDraft_v1'); } catch { /* ignore */ }
      navigate(`/talep/takip?id=${data.id || ''}`);
    } catch(e){
      toast.error(e?.response?.data?.message || 'Talep oluşturulamadı');
    }
  };

  // File import -> backend extraction
  const handleFiles = async (files) => {
    if(!files?.length) return;
    const file = files[0];
    const form = new FormData();
    form.append('file', file);
    try {
      setImportBusy(true);
      setImportInfo(null);
      const { data } = await axios.post('/talepler/extract', form, { headers: { 'Content-Type':'multipart/form-data' } });
      const rows = Array.isArray(data.products)? data.products: [];
      if(!rows.length){ toast.warning('Dosyadan ürün çıkarılamadı veya desteklenmiyor'); return; }
      // Auto-merge extracted items into the product list
      setProducts(prev => {
        const mapped = rows.map(r=>({
          name: r.name || '',
          quantity: Number(r.quantity)||1,
          unit: r.unit || 'adet',
          brand: r.brand || '',
          articleNumber: r.articleNumber || ''
        }));
        const isPrevEmptySingle = prev.length===1 && !prev[0].name && !prev[0].brand && !prev[0].articleNumber && ((Number(prev[0].quantity)||1)===1) && ((prev[0].unit||'adet')==='adet');
        return isPrevEmptySingle ? mapped : [...prev, ...mapped];
      });
      setImportInfo({ filename: data.filename, count: rows.length, type: data.type });
      toast.success(`${rows.length} ürün eklendi`);
    } catch(e){
      const msg = e?.response?.data?.message || e?.message || 'Dosya işleme hatası';
      toast.error(msg);
    } finally {
      setImportBusy(false);
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragActive(false); };
  const onDrop = (e) => { e.preventDefault(); setIsDragActive(false); const files = Array.from(e.dataTransfer.files||[]); handleFiles(files); };
  const onFileChange = (e) => { const files = Array.from(e.target.files||[]); handleFiles(files); e.target.value = ''; };

  return (
    <Box p={3} sx={{ display:'flex', flexDirection:'column', gap:3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={2} alignItems="center">
          <Button size="small" variant="text" startIcon={<ArrowLeft size={16} />} onClick={()=>navigate('/talep')}>Geri</Button>
          <Typography variant="h4" fontWeight={600}>Yeni Talep</Typography>
        </Stack>
        <Stack direction="row" gap={1}>
          <Button variant="text" size="small" onClick={clearDraft}>Taslağı Temizle</Button>
          <Button variant="outlined" size="small" onClick={()=>setBulkOpen(true)}>Toplu Ekle</Button>
          <Button variant="contained" startIcon={<Save size={18} />} disabled={!canCreate || disabled} onClick={submit}>{canCreate? 'Kaydet':'Yetki Yok'}</Button>
        </Stack>
      </Stack>
      {/* Wizard Header */}
      <Paper elevation={0} sx={{ p:2.5, borderRadius:3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {['Talep Bilgileri','Ürünler','Özet'].map((label)=> (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step 0: Talep Bilgileri */}
      {activeStep===0 && (
        <Paper elevation={0} sx={{ p:3, borderRadius:3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb:2 }}>
            <Typography variant="h6" fontWeight={600}>Talep Bilgileri</Typography>
            <Typography variant="caption" color="text.secondary">Zorunlu alanlar * ile işaretlidir</Typography>
          </Stack>
          {/* Top row: 4 equal columns via 12-col CSS Grid (minmax to allow shrink) */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(12, minmax(0, 1fr))',
              sm: 'repeat(12, minmax(0, 1fr))',
              md: 'repeat(12, minmax(0, 1fr))'
            },
            gap: 2.5,
            mb: 1
          }}>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
              <TextField fullWidth size="medium" label="Başlık" value={title} onChange={(e)=>setTitle(e.target.value)} required />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
              <Autocomplete
                fullWidth
                freeSolo
                loading={loadingCompanies}
                options={[...new Set((companies||[]).map(c=>c?.name).filter(Boolean))]}
                inputValue={company}
                onInputChange={(e,val)=>setCompany(val)}
                renderInput={(params)=>(<TextField {...params} size="medium" label="Şirket" required fullWidth />)}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
              <TextField fullWidth size="medium" label="Talep Eden" value={requester} onChange={(e)=>setRequester(e.target.value)} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
              <TextField fullWidth size="medium" label="Departman" value={department} onChange={(e)=>setDepartment(e.target.value)} />
            </Box>
          </Box>

          {/* Bottom row: Description full width */}
          <Box>
            <TextField
              fullWidth
              size="medium"
              label="Açıklama"
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              multiline
              minRows={6}
            />
          </Box>
          <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ mt:2 }}>
            <Button variant="contained" onClick={goNext} disabled={!canNextFromStep(0)}>Devam Et</Button>
          </Stack>
        </Paper>
      )}
  {activeStep===1 && (
    <Paper elevation={0} sx={{ p:3, borderRadius:3 }}>
  <Paper
        variant="outlined"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
    onDrop={onDrop}
    onClick={()=>{ const el = document.getElementById('req-import-input'); if(el) el.click(); }}
        sx={(t)=>({
          borderStyle:'dashed',
          borderWidth:2,
          borderColor: isDragActive? t.palette.primary.main : t.palette.divider,
          bgcolor: isDragActive? (t.palette.mode==='dark' ? 'rgba(33,150,243,0.06)' : 'rgba(33,150,243,0.06)') : (t.palette.mode==='dark'? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
          borderRadius:3,
          p:3,
          mb:2,
          cursor:'pointer',
          transition:'all .2s ease',
          '&:hover': { borderColor: t.palette.primary.main }
        })}
      >
    <input type="file" accept=".xlsx,.xls,.csv,.tsv,.pdf,.docx,.txt,.html,.htm,.png,.jpg,.jpeg,.bmp,.tif,.tiff,.webp" onChange={onFileChange} style={{ display:'none' }} id="req-import-input" />
          <Stack direction={{ xs:'column', sm:'row' }} alignItems="center" justifyContent="space-between" gap={2}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Box sx={(t)=>({ width:48, height:48, borderRadius:2, display:'grid', placeItems:'center', bgcolor: t.palette.mode==='dark'?'#0f2033':'#e8f3ff', color: t.palette.primary.main })}>
                <CloudUpload size={24} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>Dosya İçe Aktarma</Typography>
                <Typography variant="body2" color="text.secondary">Sürükleyip bırakın veya tıklayın</Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              {['Excel','CSV','PDF','DOCX','TXT','HTML','Görsel'].map((t,i)=> (
                <Chip key={i} size="small" variant="outlined" label={t} />
              ))}
      <Button variant="contained" size="small" onClick={(e)=>{ e.stopPropagation(); const el = document.getElementById('req-import-input'); if(el) el.click(); }}>Dosya Seç</Button>
            </Stack>
          </Stack>
      </Paper>
      {importBusy && (
        <Box sx={{ mb:2 }}>
          <LinearProgress />
          <Typography variant="caption">Dosya işleniyor…</Typography>
        </Box>
      )}
      {importInfo && (
        <Alert severity="success" sx={{ mb:2 }}>
          {importInfo.filename} içinden {importInfo.count} ürün çıkarıldı
        </Alert>
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>Ürünler</Typography>
        <Stack direction="row" gap={1}>
          <Button size="small" variant="soft" startIcon={<Plus size={16} />} onClick={addProduct}>Ürün Ekle</Button>
          <Button size="small" variant="outlined" onClick={()=>setBulkOpen(true)}>Toplu</Button>
        </Stack>
      </Stack>
      <Stack gap={2.5}>
        {products.map((p, idx)=>{
          const errs = productErrors(p);
          const hasErr = Object.values(errs).some(Boolean);
          return (
            <Paper
              key={idx}
              variant="outlined"
              sx={(t)=>(
                {
                  p:1.5,
                  borderRadius:2,
                  position:'relative',
                  borderColor: hasErr? t.palette.warning.main : undefined,
                  bgcolor: hasErr? (t.palette.mode==='dark' ? 'rgba(255,193,7,0.06)' : 'rgba(255,193,7,0.06)') : undefined,
                  '&:before': hasErr? {
                    content:'""',
                    position:'absolute',
                    left:0,
                    top:0,
                    bottom:0,
                    width:4,
                    borderTopLeftRadius:8,
                    borderBottomLeftRadius:8,
                    bgcolor: t.palette.warning.main
                  } : undefined
                }
              )}
            >
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField label={`Ürün #${idx+1}`} value={p.name} onChange={(e)=>updateProduct(idx,'name', e.target.value)} required error={errs.name} fullWidth />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField label="Miktar" type="number" value={p.quantity} onChange={(e)=>updateProduct(idx,'quantity', Number(e.target.value))} required error={errs.quantity} fullWidth />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField label="Birim" value={p.unit} onChange={(e)=>updateProduct(idx,'unit', e.target.value)} required error={errs.unit} fullWidth />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField label="Marka" value={p.brand} onChange={(e)=>updateProduct(idx,'brand', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={10} sm={2}>
                  <TextField label="Model" value={p.articleNumber} onChange={(e)=>updateProduct(idx,'articleNumber', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={2} sm={0.8} sx={{ display:'flex', justifyContent:'flex-end', gap:.5 }}>
                  <Tooltip title="Yukarı Taşı"><span><IconButton size="small" disabled={idx===0} onClick={()=> setProducts(arr => { const copy=[...arr]; const [it]=copy.splice(idx,1); copy.splice(idx-1,0,it); return copy; })}><ArrowUp size={16} /></IconButton></span></Tooltip>
                  <Tooltip title="Aşağı Taşı"><span><IconButton size="small" disabled={idx===products.length-1} onClick={()=> setProducts(arr => { const copy=[...arr]; const [it]=copy.splice(idx,1); copy.splice(idx+1,0,it); return copy; })}><ArrowDown size={16} /></IconButton></span></Tooltip>
                  <Tooltip title="Kopyala"><IconButton size="small" onClick={()=> setProducts(arr => [...arr.slice(0,idx+1), { ...p }, ...arr.slice(idx+1)])}><Copy size={16} /></IconButton></Tooltip>
                  <Tooltip title="Sil"><span><IconButton size="small" color="error" disabled={products.length===1} onClick={()=>removeProduct(idx)}><Trash2 size={16} /></IconButton></span></Tooltip>
                </Grid>
                {/* Bottom helper chips removed by request */}
              </Grid>
            </Paper>
          );
        })}
      </Stack>
      <Box sx={{ mt:3, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Button startIcon={<Plus size={16} />} onClick={addProduct} variant="outlined">Ürün Ekle</Button>
        <Stack direction="row" gap={1}>
          <Button variant="text" onClick={goBack}>Geri</Button>
          <Button variant="contained" onClick={goNext} disabled={!canNextFromStep(1)}>Devam Et</Button>
        </Stack>
      </Box>
    </Paper>
  )}
  {/* Step 2: Özet ve Gönder */}
      {activeStep===2 && (
        <Paper elevation={0} sx={{ p:3, borderRadius:3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb:2 }}>Özet</Typography>
          <Grid container spacing={2} sx={{ mb:2 }}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                <Typography variant="subtitle2" color="text.secondary">Talep</Typography>
                <Typography variant="body1"><b>Başlık:</b> {title||'-'}</Typography>
                <Typography variant="body1"><b>Şirket:</b> {company||'-'}</Typography>
                <Typography variant="body1"><b>Talep Eden:</b> {requester||'-'}</Typography>
                <Typography variant="body1"><b>Departman:</b> {department||'-'}</Typography>
                {description && <Typography variant="body2" sx={{ mt:1 }}><b>Açıklama:</b> {description}</Typography>}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                <Typography variant="subtitle2" color="text.secondary">Ürünler</Typography>
                <Typography variant="body2">Toplam {products.length} kalem</Typography>
                <Stack sx={{ mt:1 }} gap={0.5}>
                  {products.slice(0,5).map((p,i)=> (
                    <Typography key={i} variant="body2">• {p.quantity} {p.unit} {p.name}{p.brand? `, ${p.brand}`:''}{p.articleNumber? `, ${p.articleNumber}`:''}</Typography>
                  ))}
                  {products.length>5 && (
                    <Typography variant="caption" color="text.secondary">+{products.length-5} daha…</Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="space-between">
            <Button variant="text" onClick={goBack}>Geri</Button>
            <Button variant="contained" startIcon={<Save size={18} />} disabled={!canCreate || disabled} onClick={submit}>{canCreate? 'Kaydet':'Yetki Yok'}</Button>
          </Stack>
        </Paper>
      )}

      <BulkImportDialog
        open={bulkOpen}
        existing={products}
        onClose={()=>setBulkOpen(false)}
        initialRaw={clipboardPrime||''}
        onApply={(merged)=>{ setProducts(merged); setBulkOpen(false); setClipboardPrime(null); toast.success('Ürünler eklendi'); }}
      />
      <ExtractReviewDialog
        open={reviewOpen}
        items={reviewItems}
        onCancel={()=>{ setReviewOpen(false); setReviewItems([]); }}
        onApply={(selected)=>{
          if(!selected?.length){ setReviewOpen(false); return; }
          setProducts(prev => [...prev, ...selected.map(r=>({
            name: r.name || '',
            quantity: Number(r.quantity)||1,
            unit: r.unit || 'adet',
            brand: r.brand || '',
            articleNumber: r.articleNumber || ''
          }))]);
          setReviewOpen(false);
          setReviewItems([]);
          toast.success(`${selected.length} ürün eklendi`);
        }}
      />
    </Box>
  );
}
