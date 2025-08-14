import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Stack, CircularProgress, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import StatusChip from '../components/common/StatusChip';
import { DataGrid } from '@mui/x-data-grid';
import { Trash2 as DeleteIcon, Plus as AddIcon } from 'lucide-react';
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
  const [shipmentItems,setShipmentItems] = useState([]); // {purchaseOrderItemId, quantity}

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/purchase-orders/${id}`);
      setPo(data);
    } catch(e){ console.error('PO detail error', e); toast.error('PO detayı alınamadı'); } finally { setLoading(false); }
  }, [id]);
  useEffect(()=>{ load(); }, [load]);


  const remainingForItem = (item) => {
    const shipped = (po.shipments||[]).flatMap(s=>s.items||[]).filter(si=>si.purchaseOrderItemId===item.id).reduce((a,b)=>a+Number(b.quantity||0),0);
    return Number(item.quantity||0)-shipped;
  };
  const toggleShipmentItem = (poItem) => {
    const exists = shipmentItems.find(i=>i.purchaseOrderItemId===poItem.id);
    if(exists){ setShipmentItems(list=>list.filter(i=>i.purchaseOrderItemId!==poItem.id)); }
    else { const remaining = remainingForItem(poItem); if(remaining>0) setShipmentItems(list=>[...list,{ purchaseOrderItemId:poItem.id, quantity: remaining }]); }
  };
  const updateShipmentQuantity = (poItemId, qty) => {
    setShipmentItems(list=>list.map(it=>it.purchaseOrderItemId===poItemId?{...it,quantity:qty}:it));
  };
  const createShipment = async () => {
    try {
      await axios.post('/shipments', { purchaseOrderId: po.id, carrier: shipmentForm.carrier, trackingNumber: shipmentForm.trackingNumber, items: shipmentItems.map(i=>({ purchaseOrderItemId:i.purchaseOrderItemId, quantity:Number(i.quantity)||0 })) });
      toast.success('Sevkiyat oluşturuldu');
      setShipOpen(false); setShipmentForm({ carrier:'', trackingNumber:'' }); setShipmentItems([]);
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

  const doTransition = async(action)=>{
    try { await axios.post(`/purchase-orders/${id}/transition`, { action }); toast.success('Durum güncellendi'); load(); } catch(e){ toast.error(e?.response?.data?.error || 'Geçiş başarısız'); }
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
          <StatusChip status={po.status} />
          {po.status === 'draft' && <Button size="small" onClick={()=>doTransition('send')}>Gönder</Button>}
          {po.status === 'sent' && <Button size="small" onClick={()=>doTransition('confirm')}>Onayla</Button>}
          {['draft','sent','confirmed'].includes(po.status) && <Button size="small" color="error" onClick={()=>doTransition('cancel')}>İptal</Button>}
          <Button size="small" variant="outlined" onClick={()=>setShipOpen(true)}>Sevkiyat</Button>
          <Button size="small" variant="outlined" onClick={()=>setInvOpen(true)}>Fatura</Button>
        </Stack>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <MainCard title="Bilgi">
            <Stack gap={1}>
              <InfoRow k="PO No" v={po.poNumber} />
              <InfoRow k="Durum" v={<StatusChip status={po.status} />} />
              <InfoRow k="Toplam" v={po.totalAmount} />
              <InfoRow k="Tedarikçi" v={po.supplier?.name || '-'} />
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={8}>
          <MainCard title="Kalemler" secondary={<Button startIcon={<AddIcon/>} size="small" onClick={()=>{ setItemEditing(null); setItemForm({ description:'', quantity:'1', unitPrice:'0'}); setItemDialogOpen(true); }}>Ekle</Button>} content={false}>
            <Box sx={{ height: 310 }}>
              <DataGrid
                rows={po.items || []}
                columns={itemColumns}
                getRowId={(r)=>r.id}
                pageSizeOptions={[5]}
                initialState={{ pagination:{ paginationModel:{ pageSize:5 }}}}
                density="compact"
                sx={(theme)=>({
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  borderRadius: 2,
                  '& .MuiDataGrid-columnHeaders': { fontWeight:600 },
                  '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: theme.palette.mode==='dark'? 'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)' },
                  '& .MuiDataGrid-row.Mui-selected': { backgroundColor: theme.palette.action.selected, '&:hover': { backgroundColor: theme.palette.action.selected }},
                  '& .MuiDataGrid-cell': { outline: 'none !important' }
                })}
              />
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
      <Dialog open={shipOpen} onClose={()=>setShipOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Sevkiyat Oluştur</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <Stack direction="row" gap={2}>
            <TextField label="Taşıyıcı" value={shipmentForm.carrier} onChange={e=>setShipmentForm(f=>({...f, carrier:e.target.value}))} size="small" fullWidth />
            <TextField label="Takip No" value={shipmentForm.trackingNumber} onChange={e=>setShipmentForm(f=>({...f, trackingNumber:e.target.value}))} size="small" fullWidth />
          </Stack>
          <Typography variant="subtitle2" sx={{ mt:1 }}>PO Kalemleri</Typography>
          <Stack gap={1}>
            {(po.items||[]).map(it=>{
              const remaining = remainingForItem(it);
              const selected = shipmentItems.find(s=>s.purchaseOrderItemId===it.id);
              return <Box key={it.id} sx={{ p:1, border:'1px solid', borderColor: selected? 'primary.main':'divider', borderRadius:1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                  <Box onClick={()=>toggleShipmentItem(it)} style={{ cursor:'pointer', flex:1 }}>
                    <Typography variant="body2" fontWeight={500}>{it.description}</Typography>
                    <Typography variant="caption" color="text.secondary">Sipariş: {it.quantity} | Kalan: {remaining}</Typography>
                  </Box>
                  {selected && <TextField type="number" size="small" label="Miktar" value={selected.quantity} onChange={e=>updateShipmentQuantity(it.id,e.target.value)} inputProps={{ min:1, max:remaining }} sx={{ width:120 }} />}
                  <Button size="small" variant={selected? 'contained':'outlined'} onClick={()=>toggleShipmentItem(it)}>{selected? 'Çıkar':'Ekle'}</Button>
                </Stack>
              </Box>;
            })}
            {!po.items?.length && <Typography color="text.secondary">Kalem yok</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setShipOpen(false)}>İptal</Button>
          <Button onClick={createShipment} variant="contained" disabled={!shipmentForm.carrier || !shipmentItems.length}>Kaydet</Button>
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
