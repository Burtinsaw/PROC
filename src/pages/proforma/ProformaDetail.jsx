import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Stack, Divider, Chip, CircularProgress, Button } from '@mui/material';
import axios from '../../utils/axios';

export default function ProformaDetail(){
  const { number } = useParams();
  const navigate = useNavigate();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(()=>{
    let mounted = true;
    setLoading(true);
    axios.get(`/proformas/by-number/${encodeURIComponent(number)}`)
      .then(({ data })=> { if(mounted){ setData(data); setError(''); } })
      .catch((e)=> { if(mounted){ setError(e?.response?.data?.error || 'Proforma getirilemedi'); } })
      .finally(()=> { if(mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [number]);

  if (loading) {
    return (
      <Box p={3} sx={{ display:'grid', placeItems:'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="outlined" onClick={()=> navigate(-1)}>Geri</Button>
      </Box>
    );
  }

  const proforma = data?.proforma;
  const items = proforma?.ProformaInvoiceItems || [];
  const company = proforma?.Company;
  const talepId = data?.meta?.talepId;

  const handleGoToPO = async () => {
    if (!talepId) return;
    try {
      const { data: po } = await axios.get(`/purchase-orders/by-talep/${talepId}`);
      if (po?.id) {
        navigate(`/purchase-orders/${po.id}`);
      }
    } catch {
      console.warn('PO bulunamadı veya getirilemedi');
    }
  };

  return (
    <Box p={3} sx={{ display:'flex', flexDirection:'column', gap:2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight={700}>Proforma {proforma?.proformaNumber}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={proforma?.status || 'draft'} color={proforma?.status==='sent' ? 'info' : 'default'} />
          {talepId && (
            <Button variant="contained" size="small" onClick={handleGoToPO}>PO’ya git</Button>
          )}
        </Stack>
      </Stack>
      <Paper variant="outlined" sx={{ p:2 }}>
        <Stack direction={{ xs:'column', md:'row' }} spacing={2} divider={<Divider flexItem orientation="vertical" /> }>
          <Box>
            <Typography variant="subtitle2">Firma</Typography>
            <Typography>{company?.name || '-'}</Typography>
            <Typography variant="body2" color="text.secondary">{company?.email} • {company?.phone}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Para Birimi</Typography>
            <Typography>{proforma?.currency}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Toplam</Typography>
            <Typography>{proforma?.totalAmount}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Vergi</Typography>
            <Typography>{proforma?.taxAmount}</Typography>
          </Box>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p:2 }}>
        <Typography variant="h6" gutterBottom>Kalemler ({items.length})</Typography>
        <Box component="ul" sx={{ listStyle:'none', p:0, m:0, display:'grid', gap:1 }}>
          {items.map(it => (
            <Box key={it.id} component="li" sx={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:1, alignItems:'center' }}>
              <Typography>{it.productName}</Typography>
              <Typography variant="body2" color="text.secondary">{it.quantity} {it.unit}</Typography>
              <Typography variant="body2">{it.unitPrice}</Typography>
              <Typography variant="body2" fontWeight={600}>{it.lineTotal}</Typography>
            </Box>
          ))}
          {items.length === 0 && <Typography color="text.secondary">Kalem yok</Typography>}
        </Box>
      </Paper>
    </Box>
  );
}
