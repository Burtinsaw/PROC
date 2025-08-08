import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, Button, Grid, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/useAuth';

const emptyProduct = { name: '', quantity: 1, unit: 'adet', brand: '', articleNumber: '' };

export default function RequestNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [externalCompanyName, setExternalCompanyName] = useState('');
  const [externalRequesterName, setExternalRequesterName] = useState('');
  const [department, setDepartment] = useState('Satın Alma');
  const [products, setProducts] = useState([{ ...emptyProduct }]);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const disabled = useMemo(() => !title || !externalCompanyName || products.some(p => !p.name || !p.quantity || !p.unit), [title, externalCompanyName, products]);

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
      navigate(`/requests/${data.id}`);
    } catch (e) {
      console.error('Talep oluşturma hatası:', e);
      toast.error(e?.response?.data?.message || 'Talep oluşturulamadı');
    }
  };

  return (
    <Box sx={{ pt: 2, pr: 2, pb: 2, pl: '9px' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={2}>
        <Typography variant="h5">Yeni Talep</Typography>
        <Stack direction="row" gap={1}>
          <Button variant="outlined" onClick={() => navigate('/requests')}>İptal</Button>
          <Button variant="contained" disabled={disabled} onClick={submit}>Kaydet</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Genel Bilgiler</Typography>
            <Stack gap={2}>
              <TextField label="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
              <TextField label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />
              <Autocomplete
                freeSolo
                loading={loadingCompanies}
                options={[...new Set((companies || []).map((c) => c?.name).filter(Boolean))]}
                inputValue={externalCompanyName}
                onInputChange={(e, val) => setExternalCompanyName(val)}
                renderInput={(params) => (
                  <TextField {...params} label="Firma" fullWidth />
                )}
              />
              <TextField label="Talep Sahibi Adı" value={externalRequesterName} onChange={(e) => setExternalRequesterName(e.target.value)} fullWidth />
              <TextField label="Departman" value={department} onChange={(e) => setDepartment(e.target.value)} fullWidth />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1">Ürünler</Typography>
              <Button startIcon={<AddIcon />} onClick={addProduct}>Ürün Ekle</Button>
            </Stack>
            <Stack gap={2}>
              {products.map((p, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 1.5 }}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} sm={5}><TextField label="Ürün Adı" value={p.name} onChange={(e) => updateProduct(idx, 'name', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={4} sm={2}><TextField label="Miktar" type="number" value={p.quantity} onChange={(e) => updateProduct(idx, 'quantity', Number(e.target.value))} fullWidth /></Grid>
                    <Grid item xs={4} sm={2}><TextField label="Birim" value={p.unit} onChange={(e) => updateProduct(idx, 'unit', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={4} sm={2}><TextField label="Marka" value={p.brand} onChange={(e) => updateProduct(idx, 'brand', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={10} sm={1}><TextField label="Model" value={p.articleNumber} onChange={(e) => updateProduct(idx, 'articleNumber', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={2} sm={0.5} sx={{ textAlign: 'right' }}>
                      <IconButton color="error" onClick={() => removeProduct(idx)}><DeleteOutlineIcon /></IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
