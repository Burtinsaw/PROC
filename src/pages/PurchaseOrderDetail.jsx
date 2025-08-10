import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Stack, CircularProgress, Typography, Chip, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from '../utils/axios';
import { toast } from 'sonner';
import MainCard from '../components/common/MainCard';

export default function PurchaseOrderDetail(){
  const { id } = useParams();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipOpen, setShipOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({ carrier:'', trackingNumber:'' });
  const [invoiceForm, setInvoiceForm] = useState({ subtotal:'', taxRate:'18', dueDate:'' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/purchase-orders/${id}`);
      setPo(data);
    } catch(e){ console.error('PO detail error', e); toast.error('PO detayı alınamadı'); } finally { setLoading(false); }
  }, [id]);
  useEffect(()=>{ load(); }, [load]);

  const statusColor = s => ({ draft:'default', sent:'info', confirmed:'success', delivered:'success', cancelled:'error' }[s] || 'primary');

  const createShipment = async () => {
    try {
  await axios.post('/shipments', { purchaseOrderId: po.id, carrier: shipmentForm.carrier, trackingNumber: shipmentForm.trackingNumber, items: [] });
      toast.success('Sevkiyat oluşturuldu');
      setShipOpen(false); setShipmentForm({ carrier:'', trackingNumber:'' });
      load();
    } catch(e){ console.error('Shipment create', e); toast.error(e?.response?.data?.error || 'Sevkiyat oluşturulamadı'); }
  };

  const createInvoice = async () => {
    try {
      const subtotal = parseFloat(invoiceForm.subtotal||'0');
      const taxRate = parseFloat(invoiceForm.taxRate||'0');
  await axios.post('/finance/invoices', { purchaseOrderId: po.id, subtotal, taxRate, dueDate: invoiceForm.dueDate });
      toast.success('Fatura oluşturuldu');
      setInvOpen(false); setInvoiceForm({ subtotal:'', taxRate:'18', dueDate:'' });
      load();
    } catch(e){ console.error('Invoice create', e); toast.error(e?.response?.data?.error || 'Fatura oluşturulamadı'); }
  };

  if (loading) return <Stack alignItems="center" justifyContent="center" sx={{ height:400 }}><CircularProgress/></Stack>;
  if (!po) return <Typography>PO bulunamadı</Typography>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:2 }}>
        <Typography variant="h5">PO Detayı</Typography>
        <Stack direction="row" gap={1}>
          <Chip label={po.status} color={statusColor(po.status)} variant="outlined" />
          <Button size="small" variant="outlined" onClick={()=>setShipOpen(true)}>Sevkiyat</Button>
          <Button size="small" variant="outlined" onClick={()=>setInvOpen(true)}>Fatura</Button>
        </Stack>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <MainCard title="Bilgi">
            <Stack gap={1}>
              <InfoRow k="PO No" v={po.poNumber} />
              <InfoRow k="Durum" v={po.status} />
              <InfoRow k="Toplam" v={po.totalAmount} />
              <InfoRow k="Tedarikçi" v={po.supplier?.name || '-'} />
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MainCard title="Kalemler">
            <Stack gap={1}>
              {po.items?.length? po.items.map(it=> <Stack key={it.id} direction="row" justifyContent="space-between"><Typography>{it.description}</Typography><Typography color="text.secondary">{it.quantity} x {it.unitPrice||0}</Typography></Stack>): <Typography color="text.secondary">Kayıt yok</Typography>}
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MainCard title="Sevkiyatlar">
            <Stack gap={1}>
              {po.shipments?.length? po.shipments.map(sh=> <Stack key={sh.id} direction="row" justifyContent="space-between"><Typography>{sh.shipmentNumber}</Typography><Typography color="text.secondary">{sh.status}</Typography></Stack>): <Typography color="text.secondary">Yok</Typography>}
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <MainCard title="Faturalar">
            <Stack gap={1}>
              {po.invoices?.length? po.invoices.map(inv=> <Stack key={inv.id} direction="row" justifyContent="space-between"><Typography>{inv.invoiceNumber}</Typography><Typography color="text.secondary">{inv.status}</Typography></Stack>): <Typography color="text.secondary">Yok</Typography>}
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      {/* Shipment Dialog */}
      <Dialog open={shipOpen} onClose={()=>setShipOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sevkiyat Oluştur</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <TextField label="Taşıyıcı" value={shipmentForm.carrier} onChange={e=>setShipmentForm(f=>({...f, carrier:e.target.value}))} size="small" />
          <TextField label="Takip No" value={shipmentForm.trackingNumber} onChange={e=>setShipmentForm(f=>({...f, trackingNumber:e.target.value}))} size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setShipOpen(false)}>İptal</Button>
          <Button onClick={createShipment} variant="contained" disabled={!shipmentForm.carrier}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={invOpen} onClose={()=>setInvOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Fatura Oluştur</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <TextField label="Ara Toplam" value={invoiceForm.subtotal} onChange={e=>setInvoiceForm(f=>({...f, subtotal:e.target.value}))} size="small" />
          <TextField label="Vergi Oranı (%)" value={invoiceForm.taxRate} onChange={e=>setInvoiceForm(f=>({...f, taxRate:e.target.value}))} size="small" />
          <TextField type="date" label="Vade" InputLabelProps={{ shrink:true }} value={invoiceForm.dueDate} onChange={e=>setInvoiceForm(f=>({...f, dueDate:e.target.value}))} size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setInvOpen(false)}>İptal</Button>
          <Button onClick={createInvoice} variant="contained" disabled={!invoiceForm.subtotal}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function InfoRow({ k, v }){ return <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">{k}</Typography><Typography>{v||'-'}</Typography></Stack>; }
