import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Stack, CircularProgress, Typography, Chip, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
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
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ description:'', quantity:'1', unitPrice:'0' });
  const [itemEditing, setItemEditing] = useState(null);

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

  const saveItem = async () => {
    try {
      const payload = { description: itemForm.description, quantity: parseFloat(itemForm.quantity||'0'), unitPrice: parseFloat(itemForm.unitPrice||'0') };
      if (itemEditing) {
        await axios.put(`/purchase-orders/${po.id}/items/${itemEditing.id}`, payload);
        toast.success('Kalem güncellendi');
      } else {
        await axios.post(`/purchase-orders/${po.id}/items`, payload);
        toast.success('Kalem eklendi');
      }
      setItemDialogOpen(false); setItemEditing(null); setItemForm({ description:'', quantity:'1', unitPrice:'0' });
      load();
    } catch(e){ console.error('Item save', e); toast.error(e?.response?.data?.error || 'Kalem kaydedilemedi'); }
  };

  const deleteItem = async (row) => {
    if (!window.confirm('Kalemi silmek istediğinize emin misiniz?')) return;
    try { await axios.delete(`/purchase-orders/${po.id}/items/${row.id}`); toast.success('Kalem silindi'); load(); } catch{ toast.error('Kalem silinemedi'); }
  };

  const itemColumns = [
    { field:'description', headerName:'Açıklama', flex:1, minWidth:180 },
    { field:'quantity', headerName:'Miktar', flex:0.4, minWidth:100 },
    { field:'unitPrice', headerName:'Birim Fiyat', flex:0.5, minWidth:120 },
    { field:'totalPrice', headerName:'Tutar', flex:0.5, minWidth:120 },
    { field:'actions', headerName:'', width:110, sortable:false, filterable:false, renderCell:(params)=>(
      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={()=>{ setItemEditing(params.row); setItemForm({ description: params.row.description, quantity:String(params.row.quantity), unitPrice:String(params.row.unitPrice) }); setItemDialogOpen(true); }}>Düzenle</Button>
        <IconButton size="small" color="error" onClick={()=>deleteItem(params.row)}><DeleteIcon fontSize="inherit" /></IconButton>
      </Stack>
    ) }
  ];

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
        <Grid item xs={12} md={8}>
          <MainCard title="Kalemler" secondary={<Button startIcon={<AddIcon/>} size="small" onClick={()=>{ setItemEditing(null); setItemForm({ description:'', quantity:'1', unitPrice:'0'}); setItemDialogOpen(true); }}>Ekle</Button>} content={false}>
            <Box sx={{ height: 310 }}>
              <DataGrid rows={po.items || []} columns={itemColumns} getRowId={(r)=>r.id} pageSizeOptions={[5]} initialState={{ pagination:{ paginationModel:{ pageSize:5 }}}} />
            </Box>
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

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onClose={()=>setItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{itemEditing? 'Kalem Düzenle' : 'Kalem Ekle'}</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <TextField label="Açıklama" value={itemForm.description} onChange={e=>setItemForm(f=>({...f, description:e.target.value}))} size="small" />
          <Stack direction="row" gap={2}>
            <TextField label="Miktar" value={itemForm.quantity} onChange={e=>setItemForm(f=>({...f, quantity:e.target.value}))} size="small" fullWidth />
            <TextField label="Birim Fiyat" value={itemForm.unitPrice} onChange={e=>setItemForm(f=>({...f, unitPrice:e.target.value}))} size="small" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setItemDialogOpen(false)}>İptal</Button>
          <Button onClick={saveItem} variant="contained" disabled={!itemForm.description}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function InfoRow({ k, v }){ return <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">{k}</Typography><Typography>{v||'-'}</Typography></Stack>; }
