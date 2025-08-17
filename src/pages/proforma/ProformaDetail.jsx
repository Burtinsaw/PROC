import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Stack, Divider, Chip, CircularProgress, Button } from '@mui/material';
import { toast } from 'sonner';
import axios from '../../utils/axios';
import ImportDryRunDialog from '../../components/common/ImportDryRunDialog';

export default function ProformaDetail(){
  const { number } = useParams();
  const navigate = useNavigate();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [importing, setImporting] = React.useState(false);
  const [dryRunOpen, setDryRunOpen] = React.useState(false);
  const [dryReport, setDryReport] = React.useState(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(()=>{
    let mounted = true;
    setLoading(true);
    axios.get(`/proformas/by-number/${encodeURIComponent(number)}`)
      .then(({ data })=> { if(mounted){ setData(data); setError(''); } })
  .catch(()=> { if(mounted){ setError('Proforma getirilemedi'); } })
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

  const handleExportCSV = async () => {
    try {
      const res = await axios.get('/proformas/export.csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'proformas.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
  } catch {
      toast.error('CSV dışa aktarım başarısız');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await axios.get('/proformas/_template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'proforma_template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
  } catch {
      toast.error('Şablon indirilemedi');
    }
  };

  const triggerImport = () => fileInputRef.current?.click();
  const onDryRun = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const { data: resp } = await axios.post('/proformas/import?dryRun=1', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setDryReport(resp);
    setDryRunOpen(true);
    return resp;
  };
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      // Önce dry-run
      const report = await onDryRun(file);
      // Onay Import işlemi dialog içinden yapılacak
      // Dosyayı geçici olarak state'te tutmak yerine closure'la kullanacağız
      const doImport = async () => {
        const fd = new FormData(); fd.append('file', file);
        const { data: resp } = await axios.post('/proformas/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success(`İçe aktarıldı: ${resp.created} yeni, ${resp.updated} güncellendi, ${resp.itemCreated} kalem`);
        setDryRunOpen(false); setDryReport(null);
      };
      // onConfirm callback'ini dialog’a geçir
      setDryRunOpen(true);
      setDryReport({ ...report, __doImport: doImport });
    } catch {
      toast.error('İçe aktarma başarısız');
    } finally {
      setImporting(false);
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
          <Button variant="outlined" size="small" onClick={handleExportCSV}>CSV Dışa Aktar</Button>
          <Button variant="outlined" size="small" onClick={handleDownloadTemplate}>Şablon</Button>
          <Button variant="contained" size="small" disabled={importing} onClick={triggerImport}>{importing ? 'İçe aktarılıyor…' : 'İçe Aktar'}</Button>
          <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".csv,.xlsx" style={{ display:'none' }} />
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
      <ImportDryRunDialog
        open={dryRunOpen}
        report={dryReport}
        onClose={()=> { setDryRunOpen(false); setDryReport(null); }}
        onConfirm={async ()=>{ if(dryReport?.__doImport) await dryReport.__doImport(); }}
      />
    </Box>
  );
}
