import React from 'react';
import { Box, Stepper, Step, StepLabel, Button, Stack, Typography, Paper, Chip, TextField, IconButton, Grid, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRFQWizardStore } from '../../stores/rfqWizardStore';
import { suggestSuppliers as suggestSuppliersApi } from '../../services/aiService';
import axios from '../../utils/axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../../components/FileUpload';
import KeyValueEditor from '../../components/KeyValueEditor';
import { UniversalPageHeader } from '../../components/universal';

const steps = ['Kalemler', 'Tedarikçiler', 'Şartlar', 'Önizleme'];

export default function RFQWizard(){
  const navigate = useNavigate();
  const { step, setStep, items, suppliers, terms, addItem, addItemsBulk, addSupplier, addSuppliersBulk, updateTerms, buildPayload, reset } = useRFQWizardStore();
  const [submitting, setSubmitting] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);

  const canNext = () => {
    if (step === 0) return items.length > 0;
    if (step === 1) return suppliers.length > 0;
    if (step === 2) return !!terms.currency;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = buildPayload();
      const { data } = await axios.post('/rfqs/wizard', payload); // baseURL already /api
      toast.success('RFQ taslağı oluşturuldu');
      reset();
      navigate(`/rfqs/${data.id}`);
  } catch {
      toast.error('RFQ oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const suggestSuppliers = async () => {
    if (!items.length) { toast.info('Önce kalem ekleyin'); return; }
    setAiLoading(true);
    try {
      // Build a simple query from current items (first 3 descriptions)
      const query = items.slice(0,3).map(i=> `${i.description} x${i.qty} ${i.uom}`).join('; ');
      const { success, suppliers: list, error } = await suggestSuppliersApi({ query });
      if (!success || !list.length) { toast.error(error || 'Öneri bulunamadı'); return; }
      // Normalize to store shape
      const mapped = list.map(s => ({ name: s.name || s.company || 'Tedarikçi', email: s.email }));
      addSuppliersBulk(mapped);
      toast.success(`${mapped.length} öneri eklendi`);
  } catch {
      toast.error('AI öneri hatası');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Box>
      <UniversalPageHeader
        title="Yeni RFQ Sihirbazı"
        subtitle="Adım adım RFQ oluşturma rehberi"
      />
      
      <Box px={3}>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
        </Stepper>

        <Paper sx={{ p:2.5, borderRadius:3, minHeight:260 }}>
        {/* Basit placeholder içerikleri: ileride ayrı komponentlere bölünecek */}
        {step === 0 && (
          <Stack gap={2}>
            <Typography variant="subtitle1" fontWeight={600}>Kalemler</Typography>
            <FileUpload
              enableAI
              aiOptions={{ productExtraction: true }}
              showPreview
              onProductsExtracted={(prods)=>{
                // Map normalized extraction to store items
                const mapped = (prods||[]).map(p=> ({
                  description: p.description || 'Ürün',
                  qty: Number(p.qty||1),
                  uom: p.uom || 'ADET',
                  brand: p.brand, model: p.model, articleNumber: p.articleNumber, productType: p.productType,
                  meta: p.meta
                }));
                if (mapped.length) addItemsBulk(mapped);
              }}
            />
            <Button size="small" variant="outlined" onClick={()=>addItem({ description:'Örnek Kalem', qty:1, uom:'ADET' })}>Örnek Kalem Ekle</Button>
            <Stack gap={1}>
              {items.map((it,i)=>{
                const onField = (field)=> (e)=>{
                  let v = e.target.value;
                  if (field === 'qty') v = Number(v || 0);
                  const patch = { [field]: field==='qty'? Number.isFinite(v)? v: it.qty : v };
                  useRFQWizardStore.getState().updateItem(i, patch);
                };
                const onMetaAttr = (obj)=>{
                  useRFQWizardStore.getState().updateItem(i, { meta: { ...(it.meta||{}), attributes: obj } });
                };
                return (
                  <Paper key={i} variant="outlined" sx={{ p:1.5, borderRadius:2 }}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField size="small" fullWidth label={`#${i+1} Açıklama`} value={it.description}
                          onChange={onField('description')} />
                      </Grid>
                      <Grid size={{ xs: 4, md: 1.5 }}>
                        <TextField size="small" type="number" label="Adet" value={it.qty}
                          onChange={onField('qty')} fullWidth />
                      </Grid>
                      <Grid size={{ xs: 4, md: 1.5 }}>
                        <TextField size="small" label="Birim" value={it.uom}
                          onChange={onField('uom')} fullWidth />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField size="small" label="Marka" value={it.brand || ''}
                          onChange={onField('brand')} fullWidth />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField size="small" label="Model" value={it.model || ''}
                          onChange={onField('model')} fullWidth />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField size="small" label="Artikel/Parça No" value={it.articleNumber || ''}
                          onChange={onField('articleNumber')} fullWidth />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField size="small" label="Ürün Tipi" value={it.productType || ''}
                          onChange={onField('productType')} fullWidth />
                      </Grid>
                      <Grid size={{ xs: true }}>
                        <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-end">
                          {typeof it?.meta?.aiConfidence === 'number' && (
                            <Chip size="small" label={`AI ${(it.meta.aiConfidence*100).toFixed(0)}%`} />
                          )}
                          {it.brand && <Chip size="small" label={it.brand} />}
                          {it.articleNumber && <Chip size="small" variant="outlined" label={it.articleNumber} />}
                          <Tooltip title="Kalemi sil">
                            <IconButton size="small" onClick={()=> useRFQWizardStore.getState().removeItem(i)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <KeyValueEditor
                          title="Öznitelikler"
                          value={it?.meta?.attributes || {}}
                          onChange={onMetaAttr}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        )}
        {step === 1 && (
          <Stack gap={1}>
            <Typography variant="subtitle1" fontWeight={600}>Tedarikçiler</Typography>
            <Stack direction="row" gap={1}>
              <Button size="small" variant="outlined" onClick={()=>addSupplier({ name:'Tedarikçi '+(suppliers.length+1) })}>Örnek Tedarikçi Ekle</Button>
              <Button size="small" variant="contained" disabled={aiLoading || items.length===0} onClick={suggestSuppliers}>
                {aiLoading ? 'AI Öneriyor...' : 'AI: Tedarikçi Öner'}
              </Button>
            </Stack>
            {suppliers.map((s,i)=>(<Typography key={i} variant="body2">{s.name}</Typography>))}
          </Stack>
        )}
        {step === 2 && (
          <Stack gap={1}>
            <Typography variant="subtitle1" fontWeight={600}>Şartlar</Typography>
            <Button size="small" variant="outlined" onClick={()=>updateTerms({ currency: terms.currency === 'EUR' ? 'USD':'EUR' })}>Para Birimi Değiştir ({terms.currency})</Button>
          </Stack>
        )}
        {step === 3 && (
          <Stack gap={1}>
            <Typography variant="subtitle1" fontWeight={600}>Önizleme</Typography>
            <Typography variant="body2">Kalem: {items.length} | Tedarikçi: {suppliers.length} | Para Birimi: {terms.currency}</Typography>
          </Stack>
        )}
      </Paper>

      <Stack direction="row" justifyContent="space-between">
        <Button disabled={step===0} onClick={()=> setStep(step-1)}>Geri</Button>
        {step < steps.length -1 && (
          <Button variant="contained" disabled={!canNext()} onClick={()=> setStep(step+1)}>İleri</Button>
        )}
        {step === steps.length -1 && (
          <Button variant="contained" onClick={submit} disabled={submitting}>{submitting? 'Oluşturuluyor...':'Oluştur'}</Button>
        )}
      </Stack>
      </Box>
    </Box>
  );
}
