import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Stack, CircularProgress, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Switch, FormControlLabel, LinearProgress, Select, MenuItem, Tooltip } from '@mui/material';
import { Chip } from '@mui/material';
import StatusChip from '../components/common/StatusChip';
import { lazy, Suspense } from 'react';
import { Trash2 as DeleteIcon, Plus as AddIcon } from 'lucide-react';
import axios from '../utils/axios';
import { toast } from 'sonner';
import MainCard from '../components/common/MainCard';
import NotesPanel from '../components/common/NotesPanel';
import { useFeatures } from '../contexts/FeatureContext.jsx';
import { formatMoney } from '../utils/money';
import useAllowedCurrencies from '../hooks/useAllowedCurrencies';
const PurchaseOrderItemsGrid = lazy(() => import('../tables/PurchaseOrderItemsGrid'));

export default function PurchaseOrderDetail(){
  const { currencies: currencyOptions } = useAllowedCurrencies();
  const { id } = useParams();
  const { features } = useFeatures?.() || { features: {} };
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipOpen, setShipOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({ carrier:'', trackingNumber:'', incoterm:'' });
  const INCOTERMS = useMemo(() => ['EXW','FCA','FOB','CFR','CIF','CPT','CIP','DAP','DDP'], []);
  const [invoiceForm, setInvoiceForm] = useState({ subtotal:'', taxRate:'18', dueDate:'' });
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ description:'', quantity:'1', unitPrice:'0' });
  const [itemEditing, setItemEditing] = useState(null);
  const [shipmentItems,setShipmentItems] = useState([]); // {purchaseOrderItemId, quantity}
  // GRN (Teslim Alma)
  const [grnOpen, setGrnOpen] = useState(false);
  const [grnForm, setGrnForm] = useState({ supplierDeliveryNote: '' });
  const [grnItems, setGrnItems] = useState([]); // {purchaseOrderItemId, receivedQuantity}
  const [grnHideZeroRemaining, setGrnHideZeroRemaining] = useState(false);
  // GRN list + suggestion
  const [grns, setGrns] = useState([]);
  const [grnSuggestion, setGrnSuggestion] = useState(null); // { purchaseOrderId, items: [{purchaseOrderItemId, remaining, suggestedQuantity}] }
  // GRN detail
  const [grnDetailOpen, setGrnDetailOpen] = useState(false);
  const [grnDetail, setGrnDetail] = useState(null);
  // Three-Way Match summary
  const [twm, setTwm] = useState(null);
  const [twmOpen, setTwmOpen] = useState(false);
  const [twmHideMatched, setTwmHideMatched] = useState(false);

  const receivingProgress = useMemo(() => {
    if (!twm || !Array.isArray(twm.lines)) return { totalOrdered: 0, totalReceived: 0, percent: 0 };
    const totals = twm.lines.reduce((acc, l) => {
      acc.totalOrdered += Number(l.ordered || 0);
      acc.totalReceived += Number(l.received || 0);
      return acc;
    }, { totalOrdered: 0, totalReceived: 0 });
    const percent = totals.totalOrdered > 0 ? Math.min(100, Math.round((totals.totalReceived / totals.totalOrdered) * 100)) : 0;
    return { ...totals, percent };
  }, [twm]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/purchase-orders/${id}`);
      setPo(data);
    } catch(e){ console.error('PO detail error', e); toast.error('PO detayı alınamadı'); } finally { setLoading(false); }
  }, [id]);
  useEffect(()=>{ load(); }, [load]);

  const loadGrns = useCallback(async () => {
    try {
      const { data } = await axios.get(`/purchase-orders/${id}/grns`);
      setGrns(Array.isArray(data) ? data : []);
    } catch (e) {
      // feature kapalı olabilir; sessiz geç
      if (e?.response?.status !== 403) console.warn('GRN listesi alınamadı', e?.message);
    }
  }, [id]);

  const loadGrnSuggestion = useCallback(async () => {
    try {
      const { data } = await axios.get(`/purchase-orders/${id}/grn-suggestion`);
      setGrnSuggestion(data || null);
    } catch (e) {
      if (e?.response?.status !== 403) console.warn('GRN önerisi alınamadı', e?.message);
    }
  }, [id]);

  useEffect(() => { loadGrns(); loadGrnSuggestion(); }, [loadGrns, loadGrnSuggestion]);

  const loadGrnDetail = useCallback(async (grnId) => {
    try {
      const { data } = await axios.get(`/grns/${grnId}`);
      setGrnDetail(data || null);
      setGrnDetailOpen(true);
    } catch (e) {
      console.warn('GRN detayı alınamadı', e?.message);
      toast.error('GRN detayı alınamadı');
    }
  }, []);

  const loadThreeWayMatch = useCallback(async () => {
    try {
      const { data } = await axios.get(`/purchase-orders/${id}/three-way-match`);
      setTwm(data || null);
    } catch (e) {
      if (e?.response?.status !== 403) console.warn('3WM alınamadı', e?.message);
    }
  }, [id]);

  useEffect(() => { loadThreeWayMatch(); }, [loadThreeWayMatch]);


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
      await axios.post('/shipments', { purchaseOrderId: po.id, carrier: shipmentForm.carrier, trackingNumber: shipmentForm.trackingNumber, incoterm: shipmentForm.incoterm, items: shipmentItems.map(i=>({ purchaseOrderItemId:i.purchaseOrderItemId, quantity:Number(i.quantity)||0 })) });
      toast.success('Sevkiyat oluşturuldu');
      setShipOpen(false); setShipmentForm({ carrier:'', trackingNumber:'', incoterm:'' }); setShipmentItems([]);
      load();
    } catch(e){ console.error('Shipment create', e); toast.error(e?.response?.data?.error || 'Sevkiyat oluşturulamadı'); }
  };

  // GRN helpers
  const toggleGrnItem = (poItem) => {
    const exists = grnItems.find(i=>i.purchaseOrderItemId===poItem.id);
    if(exists){ setGrnItems(list=>list.filter(i=>i.purchaseOrderItemId!==poItem.id)); }
    else {
      const suggested = (grnSuggestion?.items||[]).find(x=>x.purchaseOrderItemId===poItem.id)?.suggestedQuantity;
      const defaultQty = (suggested ?? poItem.quantity) || 0;
      setGrnItems(list=>[...list,{ purchaseOrderItemId: poItem.id, receivedQuantity: defaultQty }]);
    }
  };
  const updateGrnQuantity = (poItemId, qty) => {
    setGrnItems(list=>list.map(it=>it.purchaseOrderItemId===poItemId?{...it,receivedQuantity:qty}:it));
  };
  const selectSuggestedGrnItems = () => {
    const items = (grnSuggestion?.items||[])
      .filter(it => Number(it.suggestedQuantity||0) > 0)
      .map(it => ({ purchaseOrderItemId: it.purchaseOrderItemId, receivedQuantity: it.suggestedQuantity }));
    setGrnItems(items);
  };
  const clearGrnSelection = () => setGrnItems([]);
  const createGrn = async () => {
    try {
      const payload = {
        purchaseOrderId: po.id,
        supplierDeliveryNote: grnForm.supplierDeliveryNote,
        items: grnItems.map(i=>({ purchaseOrderItemId: i.purchaseOrderItemId, receivedQuantity: Number(i.receivedQuantity)||0 }))
      };
      const { data } = await axios.post('/grns', payload);
      const policy = data?.policy;
      if (data?.warnings?.overReceipt?.length) {
        toast.warning(`GRN oluşturuldu (${policy}). Over‑receipt: ${data.warnings.overReceipt.length} satır`);
      } else if (data?.adjustments?.capped?.length) {
        toast.info(`GRN oluşturuldu (${policy}). Kısılan satır: ${data.adjustments.capped.length}`);
      } else {
        toast.success(`GRN oluşturuldu (${policy||'normal'})`);
      }
      setGrnOpen(false); setGrnForm({ supplierDeliveryNote: '' }); setGrnItems([]);
  // PO detayı, GRN listesi/önerisi ve 3WM özetini yenile
  load();
  loadGrns();
  loadGrnSuggestion();
  loadThreeWayMatch();
    } catch(e){
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'GRN oluşturulamadı';
      toast.error(msg);
    }
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
          <Button size="small" variant="outlined" onClick={()=>setGrnOpen(true)}>Teslim Al (GRN)</Button>
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
              <InfoRow k="Toplam" v={formatMoney(po.totalAmount, po.currency||'TRY')} />
              <InfoRow k="Tedarikçi" v={po.supplier?.name || '-'} />
              {/* Para birimi (çoklu para birimi özelliği açıksa düzenlenebilir) */}
              {features?.multiCurrency ? (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Para Birimi</Typography>
                  <Select
                    size="small"
                    value={po.currency || 'TRY'}
                    onChange={async (e)=>{
                      const currency = e.target.value;
                      try{
                        await axios.put(`/purchase-orders/${po.id}`, { currency });
                        setPo(prev=> ({ ...prev, currency }));
                        toast.success('Para birimi güncellendi');
                        // 3WM özetini para birimi için tazele
                        try { await loadThreeWayMatch(); } catch { /* ignore refresh error */ }
                      } catch(err){ toast.error(err?.response?.data?.error || 'Para birimi güncellenemedi'); }
                    }}
                    sx={{ minWidth: 120 }}
                  >
                    {currencyOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </Stack>
              ) : (
                <InfoRow k="Para Birimi" v={po.currency || 'TRY'} />
              )}
              {po.deliveredDate && <InfoRow k="Teslim Tarihi" v={new Date(po.deliveredDate).toLocaleString()} />}
              {twm && (
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Teslimat</Typography>
                  <LinearProgress variant="determinate" value={receivingProgress.percent} sx={{ height: 6, borderRadius: 1, mt: 0.5 }} />
                  <Typography variant="caption">{receivingProgress.totalReceived}/{receivingProgress.totalOrdered} ({receivingProgress.percent}%)</Typography>
                </Box>
              )}
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={8}>
          <MainCard title="Kalemler" secondary={<Button startIcon={<AddIcon/>} size="small" onClick={()=>{ setItemEditing(null); setItemForm({ description:'', quantity:'1', unitPrice:'0'}); setItemDialogOpen(true); }}>Ekle</Button>} content={false}>
            <Box sx={{ height: 310 }}>
              <Suspense fallback={<Stack alignItems="center" justifyContent="center" sx={{ height:'100%' }}><CircularProgress size={22} /></Stack>}>
                <PurchaseOrderItemsGrid rows={po.items || []} columns={itemColumns} />
              </Suspense>
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
        {twm && (
          <Grid item xs={12} md={6}>
            <MainCard title="Üçlü Mutabakat (PO-GRN-Fatura)">
              <Stack gap={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">PO Tutarı</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatMoney(twm.po?.totalAmount ?? '-', twm.grn?.meta?.currency || po.currency || 'TRY')}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Fatura Toplam</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatMoney(twm.invoice?.totalAmount ?? '-', twm.grn?.meta?.currency || po.currency || 'TRY')}</Typography>
                </Stack>
                <Stack direction="row" gap={1} alignItems="center">
                  <Typography variant="body2">Kontroller:</Typography>
                  <StatusChip status={twm.checks?.amountMatched? 'ok':'mismatch'} />
                  <Typography variant="caption" color="text.secondary">Tutar</Typography>
                  <StatusChip status={twm.checks?.qtyMatched? 'ok':'mismatch'} />
                  <Typography variant="caption" color="text.secondary">Miktar</Typography>
                </Stack>
                {!!twm.grn?.meta?.policies && (
                  <Stack gap={0.5}>
                    <Typography variant="body2">GRN Politikaları</Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      {['allow','warn','cap','reject'].map(k => (
                        <ChipMini key={k} label={`${k}: ${twm.grn.meta.policies[k]||0}`} />
                      ))}
                    </Stack>
                  </Stack>
                )}
                {!!twm.grn?.meta?.channels?.passengerDutyFree && (
                  <Stack gap={0.5}>
                    <Typography variant="body2">Yolcu Beraberi</Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                      <ChipMini label={`adet: ${twm.grn.meta.channels.passengerDutyFree}`} />
                      <Typography variant="caption" color="text.secondary">toplam: {twm.grn.meta.passengerDutyFreeTotalValue} {twm.grn.meta.currency || ''}</Typography>
                      {!!twm.grn.meta.passengerDutyFreePaidByPassengerCount && (
                        <ChipMini
                          label={`Ödeme (Yolcu): ${twm.grn.meta.passengerDutyFreePaidByPassengerCount}`}
                          tooltip={(twm.grn.meta.passengerDutyFreePaidByExamples?.passenger||[]).length
                            ? (twm.grn.meta.passengerDutyFreePaidByExamples.passenger)
                                .map(e=>`${e.grnNumber||`#${e.grnId}`}`)
                                .join(', ')
                            : undefined}
                        />
                      )}
                      {!!twm.grn.meta.passengerDutyFreePaidByCompanyCount && (
                        <ChipMini
                          label={`Ödeme (Şirket): ${twm.grn.meta.passengerDutyFreePaidByCompanyCount}`}
                          tooltip={(twm.grn.meta.passengerDutyFreePaidByExamples?.company||[]).length
                            ? (twm.grn.meta.passengerDutyFreePaidByExamples.company)
                                .map(e=>`${e.grnNumber||`#${e.grnId}`}`)
                                .join(', ')
                            : undefined}
                        />
                      )}
                      {!!twm.grn.meta.dutyFreeCurrencyMismatchCount && (
                        <ChipMini
                          label={`Kur Uyuşmazlığı: ${twm.grn.meta.dutyFreeCurrencyMismatchCount}`}
                          tooltip={(twm.grn.meta.dutyFreeCurrencyMismatchExamples||[]).length
                            ? (twm.grn.meta.dutyFreeCurrencyMismatchExamples||[])
                                .map(e=>`${e.grnNumber||`#${e.grnId}`}: ${e.dutyFreeCurrency || '?'}≠${e.poCurrency || '?'}`)
                                .join(', ')
                            : undefined}
                        />
                      )}
                    </Stack>
                  </Stack>
                )}
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Satır Özeti</Typography>
                  <Stack gap={0.5}>
                    {(twm.lines||[]).slice(0,5).map(l => (
                      <Stack key={l.itemId} direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>{l.description}</Typography>
                        <Typography variant="caption">{l.received}/{l.ordered} · kalan: {l.remaining}</Typography>
                      </Stack>
                    ))}
                    {(twm.lines||[]).length>5 && <Typography variant="caption" color="text.secondary">… {twm.lines.length - 5} satır daha</Typography>}
                  </Stack>
                </Box>
                <Stack direction="row" justifyContent="flex-end">
                  <Button size="small" variant="outlined" onClick={()=>setTwmOpen(true)}>Detay</Button>
                </Stack>
              </Stack>
            </MainCard>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <MainCard title="GRN'ler">
            <Stack gap={1}>
              {grns?.length ? grns.map(g => (
                <Stack key={g.id} direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                  <Box sx={{ minWidth: 120 }}>
                    <Typography>{g.grnNumber || `GRN#${g.id}`}</Typography>
                    <Typography variant="caption" color="text.secondary">{g.status || '-'} · {g.receivingMeta?.policy || 'n/a'}</Typography>
                  </Box>
                  <Button size="small" variant="outlined" onClick={()=>loadGrnDetail(g.id)}>Detay</Button>
                </Stack>
              )) : <Typography color="text.secondary">Yok</Typography>}
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <NotesPanel base="/purchase-orders" entityId={id} />
      </Grid>

      {/* Shipment Dialog */}
      <Dialog open={shipOpen} onClose={()=>setShipOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Sevkiyat Oluştur</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <Stack direction="row" gap={2}>
            <TextField label="Taşıyıcı" value={shipmentForm.carrier} onChange={e=>setShipmentForm(f=>({...f, carrier:e.target.value}))} size="small" fullWidth />
            <TextField label="Takip No" value={shipmentForm.trackingNumber} onChange={e=>setShipmentForm(f=>({...f, trackingNumber:e.target.value}))} size="small" fullWidth />
            <Select size="small" value={shipmentForm.incoterm||''} displayEmpty fullWidth onChange={e=>setShipmentForm(f=>({...f, incoterm:e.target.value}))}
              renderValue={(v)=> v || 'Incoterm'}>
              <MenuItem value=""><em>Seçiniz</em></MenuItem>
              {INCOTERMS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </Select>
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

      {/* GRN Dialog */}
      <Dialog open={grnOpen} onClose={()=>setGrnOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Teslim Al (GRN)</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <TextField label="İrsaliye No" value={grnForm.supplierDeliveryNote} onChange={e=>setGrnForm(f=>({...f, supplierDeliveryNote:e.target.value}))} size="small" fullWidth />
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" gap={1}>
              <Button size="small" variant="outlined" onClick={selectSuggestedGrnItems} disabled={!grnSuggestion?.items?.length}>Önerilenleri seç</Button>
              <Button size="small" onClick={clearGrnSelection} disabled={!grnItems.length}>Temizle</Button>
            </Stack>
            <FormControlLabel control={<Switch size="small" checked={grnHideZeroRemaining} onChange={(_,v)=>setGrnHideZeroRemaining(v)} />} label="Sıfır kalanları gizle" />
          </Stack>
          <Typography variant="subtitle2" sx={{ mt:1 }}>PO Kalemleri</Typography>
          <Stack gap={1}>
            {(
              (po.items||[])
                .filter(it => {
                  const remaining = (grnSuggestion?.items||[]).find(x=>x.purchaseOrderItemId===it.id)?.remaining;
                  return !grnHideZeroRemaining || Number(remaining||0) > 0;
                })
            ).map(it=>{
              const selected = grnItems.find(s=>s.purchaseOrderItemId===it.id);
      const remaining = (grnSuggestion?.items||[]).find(x=>x.purchaseOrderItemId===it.id)?.remaining;
              return <Box key={it.id} sx={{ p:1, border:'1px solid', borderColor: selected? 'primary.main':'divider', borderRadius:1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                  <Box onClick={()=>toggleGrnItem(it)} style={{ cursor:'pointer', flex:1 }}>
                    <Typography variant="body2" fontWeight={500}>{it.description}</Typography>
        <Typography variant="caption" color="text.secondary">Sipariş: {it.quantity}{remaining!==undefined? ` · Kalan: ${remaining}`: ''}</Typography>
                  </Box>
                  {selected && <TextField type="number" size="small" label="Teslim Miktarı" value={selected.receivedQuantity} onChange={e=>updateGrnQuantity(it.id,e.target.value)} inputProps={{ min:0 }} sx={{ width:150 }} />}
                  <Button size="small" variant={selected? 'contained':'outlined'} onClick={()=>toggleGrnItem(it)}>{selected? 'Çıkar':'Ekle'}</Button>
                </Stack>
              </Box>;
            })}
            {!po.items?.length && <Typography color="text.secondary">Kalem yok</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setGrnOpen(false)}>İptal</Button>
          <Button onClick={createGrn} variant="contained" disabled={!grnItems.length}>Kaydet</Button>
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

      {/* Three-Way Match Detail Dialog */}
      <Dialog open={!!twm && twmOpen} onClose={()=>setTwmOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Üçlü Mutabakat Detayı</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          {!!twm && (
            <>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <ChipMini label={`PO: ${formatMoney(twm.po?.totalAmount ?? '-', twm.grn?.meta?.currency || po.currency || 'TRY')}`} />
                <ChipMini label={`Fatura: ${formatMoney(twm.invoice?.totalAmount ?? '-', twm.grn?.meta?.currency || po.currency || 'TRY')}`} />
                <ChipMini label={`Para Birimi: ${twm.grn?.meta?.currency || 'TRY'}`} />
                <ChipMini label={`GRN: ${twm.grn?.count ?? 0}`} />
                <ChipMini label={`OverReceipt: ${twm.grn?.meta?.overReceiptEntries ?? 0}`} />
                <ChipMini label={`Adjustments: ${twm.grn?.meta?.adjustmentsEntries ?? 0}`} />
                <ChipMini label={`Kalan Satır: ${twm.checks?.linesOutstandingCount ?? 0}`} />
                <ChipMini label={`Aşırı Teslim Satır: ${twm.checks?.linesOverReceivedCount ?? 0}`} />
                {!!twm.grn?.meta?.dutyFreeCurrencyMismatchCount && (
                  <ChipMini
                    label={`DF Kur Uyuşmazlığı: ${twm.grn.meta.dutyFreeCurrencyMismatchCount}`}
                    tooltip={(twm.grn.meta.dutyFreeCurrencyMismatchExamples||[]).length
                      ? (twm.grn.meta.dutyFreeCurrencyMismatchExamples||[])
                          .map(e=>`${e.grnNumber||`#${e.grnId}`}: ${e.dutyFreeCurrency || '?'}≠${e.poCurrency || '?'}`)
                          .join(', ')
                      : undefined}
                  />
                )}
                {!!twm.grn?.meta?.passengerDutyFreePaidByPassengerCount && (
                  <ChipMini
                    label={`Ödeme (Yolcu): ${twm.grn.meta.passengerDutyFreePaidByPassengerCount}`}
                    tooltip={(twm.grn.meta.passengerDutyFreePaidByExamples?.passenger||[]).length
                      ? (twm.grn.meta.passengerDutyFreePaidByExamples.passenger)
                          .map(e=>`${e.grnNumber||`#${e.grnId}`}`)
                          .join(', ')
                      : undefined}
                  />
                )}
                {!!twm.grn?.meta?.passengerDutyFreePaidByCompanyCount && (
                  <ChipMini
                    label={`Ödeme (Şirket): ${twm.grn.meta.passengerDutyFreePaidByCompanyCount}`}
                    tooltip={(twm.grn.meta.passengerDutyFreePaidByExamples?.company||[]).length
                      ? (twm.grn.meta.passengerDutyFreePaidByExamples.company)
                          .map(e=>`${e.grnNumber||`#${e.grnId}`}`)
                          .join(', ')
                      : undefined}
                  />
                )}
              </Stack>
              {!!twm.grn?.meta?.policies && (
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {['allow','warn','cap','reject'].map(k => (
                    <ChipMini key={k} label={`${k}: ${twm.grn.meta.policies[k]||0}`} />
                  ))}
                </Stack>
              )}
              <FormControlLabel sx={{ mt: 1 }} control={<Switch size="small" checked={twmHideMatched} onChange={(_,v)=>setTwmHideMatched(v)} />} label="Tam eşleşenleri gizle" />
              <Box>
                <Typography variant="subtitle2" sx={{ mb:1 }}>Satırlar</Typography>
                <Stack gap={0.75}>
                  {(twm.lines||[])
                    .filter(l => !twmHideMatched || !(Number(l.remaining||0)===0 && Number(l.diff||0)===0))
                    .map(l => {
                      const mismatch = Number(l.remaining||0) !== 0 || Number(l.diff||0) !== 0;
                      return (
                        <Stack key={l.itemId} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" noWrap sx={{ maxWidth: 260, color: mismatch? 'error.main': undefined }}>{l.description}</Typography>
                          <Stack direction="row" gap={2}>
                            <Typography variant="caption">Sipariş: {l.ordered}</Typography>
                            <Typography variant="caption" sx={{ color: mismatch? 'error.main': undefined }}>Teslim: {l.received}</Typography>
                            <Typography variant="caption" sx={{ color: Number(l.remaining||0) !== 0? 'error.main': undefined }}>Kalan: {l.remaining}</Typography>
                            <Typography variant="caption" sx={{ color: Number(l.diff||0) !== 0? 'error.main': undefined }}>Fark: {l.diff}</Typography>
                          </Stack>
                        </Stack>
                      );
                    })}
                </Stack>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setTwmOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* GRN Detail Dialog */}
      <Dialog open={grnDetailOpen} onClose={()=>{ setGrnDetailOpen(false); setGrnDetail(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>GRN Detayı</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:1.5, mt:1 }}>
          {grnDetail ? (
            <>
              <Stack gap={0.5}>
                <InfoRow k="GRN No" v={grnDetail.grnNumber || `GRN#${grnDetail.id}`} />
                <InfoRow k="Durum" v={grnDetail.status || '-'} />
                <InfoRow k="İrsaliye" v={grnDetail.supplierDeliveryNote || '-'} />
                <InfoRow k="Politika" v={grnDetail.receivingMeta?.policy || '-'} />
                {grnDetail.receivingMeta?.channel === 'passengerDutyFree' && (
                  <Stack direction="row" alignItems="center" gap={1}>
                    <ChipMini label="Yolcu Beraberi" />
                    <Typography variant="caption" color="text.secondary">
                      {grnDetail.receivingMeta?.passengerDutyFree?.passenger?.name || grnDetail.receivingMeta?.passengerDutyFree?.passenger?.passportNo || ''}
                    </Typography>
                    {!!grnDetail.receivingMeta?.passengerDutyFree?.currency && (
                      <ChipMini label={grnDetail.receivingMeta.passengerDutyFree.currency} />
                    )}
                    {!!grnDetail.receivingMeta?.passengerDutyFree?.paidBy && (
                      <ChipMini label={`Ödeme: ${grnDetail.receivingMeta.passengerDutyFree.paidBy==='company'?'Şirket':'Yolcu'}`} />
                    )}
                  </Stack>
                )}
              </Stack>
              <Box>
                <Typography variant="subtitle2" sx={{ mb:0.5 }}>Kalemler</Typography>
                <Stack gap={0.5}>
                  {(grnDetail.items||[]).length ? (
                    (grnDetail.items||[]).map(it => (
                      <Stack key={it.id} direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>{it.description || it.purchaseOrderItem?.description || `Kalem#${it.purchaseOrderItemId}`}</Typography>
                        <Typography variant="caption">Teslim: {it.receivedQuantity ?? it.quantity ?? '-'}</Typography>
                      </Stack>
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">Yok</Typography>
                  )}
                </Stack>
              </Box>
              {!!grnDetail.receivingMeta && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb:0.5 }}>Politika Özeti</Typography>
                  <Stack gap={0.5}>
                    {grnDetail.receivingMeta?.warnings?.overReceipt?.length ? (
                      <Typography variant="caption" color="warning.main">Uyarı (over‑receipt): {grnDetail.receivingMeta.warnings.overReceipt.length} satır</Typography>
                    ) : null}
                    {grnDetail.receivingMeta?.adjustments?.capped?.length ? (
                      <Typography variant="caption" color="text.secondary">Kısılan: {grnDetail.receivingMeta.adjustments.capped.length} satır</Typography>
                    ) : null}
                  </Stack>
                </Box>
              )}
            </>
          ) : (
            <Typography color="text.secondary">Yükleniyor…</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{ setGrnDetailOpen(false); setGrnDetail(null); }}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function InfoRow({ k, v }){ return <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">{k}</Typography><Typography>{v||'-'}</Typography></Stack>; }

function ChipMini({ label, tooltip }){
  const chip = <Chip size="small" variant="outlined" label={label} sx={{ height: 22 }} />;
  return tooltip ? (
    <Tooltip title={tooltip} arrow>
      <span>{chip}</span>
    </Tooltip>
  ) : chip;
}
