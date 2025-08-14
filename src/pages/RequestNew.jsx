import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, Button, Grid, IconButton, Paper, Stack, TextField, Typography, Tooltip, Divider, Chip } from '@mui/material';
import { Trash2 as DeleteOutlineIcon, Plus as AddIcon, Copy as ContentCopyIcon, GripVertical as DragIndicatorIcon } from 'lucide-react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/useAuth';
// Drawer tabanlı yeni form düzeni
import FormDrawer from '../components/common/FormDrawer';
import { useLanguage } from '../contexts/LanguageContext';
import MainCard from '../components/common/MainCard';
import NeutralBadge from '../components/common/NeutralBadge';
import { FilePlus2 } from 'lucide-react';
import BulkImportDialog from '../components/bulk/BulkImportDialog';

const emptyProduct = { name: '', quantity: 1, unit: 'adet', brand: '', articleNumber: '' };

export default function RequestNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [externalCompanyName, setExternalCompanyName] = useState('');
  const [externalRequesterName, setExternalRequesterName] = useState('');
  const [department, setDepartment] = useState('Satın Alma'); // could map later
  const [products, setProducts] = useState([{ ...emptyProduct }]);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [clipboardPrime, setClipboardPrime] = useState(null); // holds detected clipboard content for dialog prefill
  const disabled = useMemo(() => !title || !externalCompanyName || products.some(p => !p.name || !p.quantity || !p.unit), [title, externalCompanyName, products]);

  const productErrors = (p) => ({
    name: !p.name,
    quantity: !p.quantity || Number(p.quantity) <= 0,
    unit: !p.unit
  });

  const addProduct = () => setProducts((arr) => [...arr, { ...emptyProduct }]);
  const removeProduct = (idx) => setProducts((arr) => arr.filter((_, i) => i !== idx));
  const updateProduct = (idx, key, value) => setProducts((arr) => arr.map((p, i) => i === idx ? { ...p, [key]: value } : p));

  // Şirket önerilerini getir
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingCompanies(true);
        const { data } = await axios.get('/talepler/companies');
        if (active) setCompanies(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Firma listesi alınamadı:', e);
      } finally {
        if (active) setLoadingCompanies(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const submit = async () => {
    try {
      const payload = {
        title,
        description,
        externalCompanyName,
        externalRequesterName,
        internalRequester: { id: user?.id, department },
        products: products.map(p => ({
          ...p,
          quantity: Number(p.quantity) > 0 ? Number(p.quantity) : 1
        }))
      };
      const { data } = await axios.post('/talepler', payload);
      toast.success('Talep oluşturuldu');
      // Clear draft after successful save
  try { localStorage.removeItem('requestNewDraft_v1'); } catch { /* ignore */ }
      navigate(`/requests/${data.id}`);
    } catch (e) {
      console.error('Talep oluşturma hatası:', e);
      toast.error(e?.response?.data?.message || 'Talep oluşturulamadı');
    }
  };

  // Autosave & restore
  useEffect(() => {
    // Restore on mount
    try {
      const raw = localStorage.getItem('requestNewDraft_v1');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && !title && products.length === 1 && !products[0].name) {
          setTitle(draft.title || '');
          setDescription(draft.description || '');
          setExternalCompanyName(draft.externalCompanyName || '');
          setExternalRequesterName(draft.externalRequesterName || '');
          setDepartment(draft.department || 'Satın Alma');
          if (Array.isArray(draft.products) && draft.products.length) setProducts(draft.products);
          toast.info('Taslak yüklendi');
        }
      }
  } catch { /* ignore restore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const draft = {
      title,
      description,
      externalCompanyName,
      externalRequesterName,
      department,
      products
    };
  try { localStorage.setItem('requestNewDraft_v1', JSON.stringify(draft)); } catch { /* ignore persist */ }
  }, [title, description, externalCompanyName, externalRequesterName, department, products]);

  // Clipboard auto-open (Step E)
  useEffect(() => {
    function looksTabular(text){
      if(!text) return false;
      const lines = text.split(/\r?\n/).filter(l=>l.trim());
      if(lines.length < 2) return false; // need header + 1 line at least
      const delimiterCandidates = ['\t',';','|',','];
      let del = ',';
      let bestScore = 0;
      for(const d of delimiterCandidates){
        const counts = lines.slice(0,5).map(l=>l.split(d).length);
        const variance = counts.reduce((a,c)=>a+c,0)/counts.length - 1;
        if(Math.min(...counts) > 1 && variance >= bestScore){ bestScore = variance; del = d; }
      }
      const firstCols = lines[0].split(del).length;
      const secondCols = lines[1].split(del).length;
      return firstCols > 1 && secondCols === firstCols; // simple heuristic
    }
    const handler = async (e) => {
      try {
        const text = e.clipboardData?.getData('text/plain');
        if(!text) return;
        if(!bulkOpen && looksTabular(text)){
          // Avoid interrupting when user is focused in an input inside the bulk dialog (not open now anyway)
          setClipboardPrime(text);
          setBulkOpen(true);
        }
      } catch {/* ignore */}
    };
    window.addEventListener('paste', handler, { passive: true });
    return () => window.removeEventListener('paste', handler);
  }, [bulkOpen]);

  const clearDraft = () => {
  try { localStorage.removeItem('requestNewDraft_v1'); } catch { /* ignore clear */ }
    toast.success('Taslak temizlendi');
  };

  // Drawer açık/kapalı durumu (sayfaya girince otomatik aç)
  const [open, setOpen] = useState(true);
  const closeAndExit = () => { setOpen(false); setTimeout(()=>navigate('/requests'), 180); };

  const actions = (
    <>
      <Button variant="text" onClick={closeAndExit}>{t('request.action.cancel')}</Button>
      <Button variant="text" color="secondary" onClick={clearDraft}>{t('request.action.clearDraft')}</Button>
      <Button variant="outlined" onClick={()=>setBulkOpen(true)}>{t('request.action.bulkImport')}</Button>
      <Button variant="contained" disabled={disabled} onClick={submit}>{t('request.action.save')}</Button>
    </>
  );

  return (
    <>
      <FormDrawer
        open={open}
        onClose={closeAndExit}
        width="lg"
        title={t('request.new.title')}
        description={t('request.new.desc')}
        actions={actions}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={5} lg={5}>
            <Stack gap={2}>
              <TextField label={t('request.field.title')} value={title} required onChange={(e) => setTitle(e.target.value)} fullWidth />
              <TextField label={t('request.field.description')} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />
              <Autocomplete
                freeSolo
                loading={loadingCompanies}
                options={[...new Set((companies || []).map((c) => c?.name).filter(Boolean))]}
                inputValue={externalCompanyName}
                onInputChange={(e, val) => setExternalCompanyName(val)}
                renderInput={(params) => (
                  <TextField {...params} label={t('request.field.company')} required fullWidth />
                )}
              />
              <TextField label={t('request.field.requesterName')} value={externalRequesterName} onChange={(e) => setExternalRequesterName(e.target.value)} fullWidth />
              <TextField label={t('request.field.department')} value={department} onChange={(e) => setDepartment(e.target.value)} fullWidth />
              <Divider flexItem sx={{ my: 1 }}/>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <NeutralBadge label={`${t('request.badge.productCount')}: ${products.length}`} />
                {!disabled && <NeutralBadge label={t('request.badge.ready')} variant="subtle" sx={{ bgcolor: (t)=>t.palette.success.light+'33', color: 'success.main' }} />}
                {disabled && <NeutralBadge label={t('request.badge.missing')} variant="outlined" sx={{ color: 'warning.main', borderColor: 'warning.light' }} />}
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={7} lg={7}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Stack direction="row" gap={1} alignItems="center">
                  <Chip size="small" label={`${products.length} kalem`} />
                </Stack>
                <Stack direction="row" gap={1}>
                  <Button startIcon={<AddIcon />} onClick={addProduct} variant="soft">{t('request.action.addProduct')}</Button>
                  <Button onClick={()=>setBulkOpen(true)} variant="outlined" size="small">{t('request.action.bulkImport')}</Button>
                </Stack>
              </Stack>
              <Stack gap={2.5}>
                {products.map((p, idx) => {
                  const errs = productErrors(p);
                  return (
                    <Paper
                      key={idx}
                      variant="outlined"
                      sx={(t) => ({
                        p: 1.5,
                        borderRadius: 2,
                        position: 'relative',
                        borderColor: Object.values(errs).some(Boolean) ? t.palette.warning.light : undefined,
                        background: t.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))'
                          : 'linear-gradient(135deg,#fff,#f8fafc)'
                      })}
                    >
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={3.8} md={4}>
                          <TextField
                            label={`${t('request.field.productName')} #${idx+1}`}
                            value={p.name}
                            onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                            required
                            error={errs.name}
                            helperText={errs.name ? t('request.helper.required') : ''}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={4} sm={1.7} md={1.5}>
                          <TextField
                            label={t('request.field.quantity')}
                            type="number"
                            value={p.quantity}
                            onChange={(e) => updateProduct(idx, 'quantity', Number(e.target.value))}
                            required
                            error={errs.quantity}
                            helperText={errs.quantity ? t('request.helper.quantityInvalid') : ''}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={4} sm={1.7} md={1.5}>
                          <TextField
                            label={t('request.field.unit')}
                            value={p.unit}
                            onChange={(e) => updateProduct(idx, 'unit', e.target.value)}
                            required
                            error={errs.unit}
                            helperText={errs.unit ? t('request.helper.required') : ''}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={4} sm={1.7} md={1.5}>
                          <TextField label={t('request.field.brand')} value={p.brand} onChange={(e) => updateProduct(idx, 'brand', e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={10} sm={2.8} md={2.5}>
                          <TextField label={t('request.field.model')} value={p.articleNumber} onChange={(e) => updateProduct(idx, 'articleNumber', e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={2} sm={0.8} md={0.7} sx={{ display: 'flex', justifyContent: 'flex-end', gap: .5 }}>
                          <Tooltip title="Kopyala"><IconButton size="small" onClick={() => setProducts(arr => [...arr.slice(0, idx+1), { ...p }, ...arr.slice(idx+1)])}><ContentCopyIcon fontSize="inherit" /></IconButton></Tooltip>
                          <Tooltip title="Sil"><span><IconButton size="small" color="error" disabled={products.length===1} onClick={() => removeProduct(idx)}><DeleteOutlineIcon fontSize="inherit" /></IconButton></span></Tooltip>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ opacity: 0.25 }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                            {Object.values(errs).some(Boolean) && <Chip size="small" color="warning" label={t('request.badge.missingItem')} />}
                            {!Object.values(errs).some(Boolean) && <Chip size="small" color="success" label={t('request.badge.ok')} />}
                            <Chip size="small" variant="outlined" icon={<DragIndicatorIcon fontSize="inherit" />} label={t('request.helper.dragSoon')} />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })}
              </Stack>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button startIcon={<AddIcon />} onClick={addProduct} variant="outlined">{t('request.action.addAnotherProduct')}</Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </FormDrawer>
      <BulkImportDialog
        open={bulkOpen}
        existing={products}
        onClose={()=>setBulkOpen(false)}
        initialRaw={clipboardPrime || ''}
        onApply={(merged)=>{ setProducts(merged); setBulkOpen(false); setClipboardPrime(null); toast.success('Ürünler eklendi'); }}
      />
    </>
  );
}
