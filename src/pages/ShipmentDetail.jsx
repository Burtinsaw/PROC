import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Chip, Divider, Grid, CircularProgress, Button, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import AuthContext from '../contexts/AuthContext';
import MainCard from '../components/common/MainCard';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import axios from '../utils/axios';
import { toast } from 'sonner';
import NotesPanel from '../components/common/NotesPanel';

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [legs, setLegs] = useState([]);
  const [events, setEvents] = useState([]);
  const [charges, setCharges] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  // Notes handled by NotesPanel
  // quick add states
  const [newLeg, setNewLeg] = useState({ mode: 'road', origin: '', destination: '', eta: '' });
  const [newEvent, setNewEvent] = useState({ status: 'in_transit', location: '', eventTime: '' });
  const [newCharge, setNewCharge] = useState({ type: 'freight', amount: '', currency: 'USD' });
  const [newException, setNewException] = useState({ code: 'delay', severity: 'low', message: '' });
  const [editExceptions, setEditExceptions] = useState({});

  const code = shipment?.trackingNo || shipment?.code || `#${id}`;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, l, ev, ch, ex] = await Promise.all([
        axios.get(`/shipments/${id}`),
        axios.get(`/shipments/${id}/legs`).catch(()=>({ data: [] })),
        axios.get(`/shipments/${id}/events`).catch(()=>({ data: [] })),
        axios.get(`/shipments/${id}/charges`).catch(()=>({ data: [] })),
        axios.get(`/shipments/${id}/exceptions`).catch(()=>({ data: [] })),
      ]);
  const sh = s.data?.shipment || s.data;
  setShipment(sh);
      setLegs(l.data?.legs || l.data || []);
      setEvents(ev.data?.events || ev.data || []);
      setCharges(ch.data?.charges || ch.data || []);
  setExceptions(ex.data?.exceptions || ex.data || []);
    } catch(e) {
      console.error('Shipment load error', e);
      toast.error('Sevkiyat detayları alınamadı');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(()=>{ loadAll(); }, [loadAll]);

  const groupedEvents = useMemo(() => {
    const arr = [...(events||[])].filter(Boolean).map(ev => ({ ...ev, ts: ev.eventTime ? new Date(ev.eventTime) : null }));
    arr.sort((a,b) => (a.ts?.getTime()||0) - (b.ts?.getTime()||0));
    const map = new Map();
    for(const ev of arr){
      const key = ev.ts ? ev.ts.toISOString().slice(0,10) : 'NA';
      if(!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return Array.from(map.entries());
  }, [events]);

  const totals = useMemo(() => {
    const sum = (arr, k) => (arr||[]).reduce((a,b)=> a + (Number(b[k])||0), 0);
    return {
      chargeTotal: sum(charges, 'amount'),
      exceptionCount: (exceptions||[]).length
    };
  }, [charges, exceptions]);

  const fmtDate = (d) => {
    try { return d ? new Date(d).toLocaleString('tr-TR') : '-'; } catch { return '-'; }
  };

  const addLeg = async () => {
    try {
      if(!newLeg.origin || !newLeg.destination){ toast.error('Origin ve destination gerekli'); return; }
      const payload = { ...newLeg };
      if(!payload.eta) delete payload.eta;
      await axios.post(`/shipments/${id}/legs`, payload);
      toast.success('Bacak eklendi');
      setNewLeg({ mode: newLeg.mode || 'road', origin: '', destination: '', eta: '' });
      const l = await axios.get(`/shipments/${id}/legs`).catch(()=>({ data: [] }));
      setLegs(l.data?.legs || l.data || []);
    } catch(e){ console.error(e); toast.error('Bacak eklenemedi'); }
  };

  const addEvent = async () => {
    try {
      if(!newEvent.status){ toast.error('Durum gerekli'); return; }
      const { location, ...rest } = newEvent;
      const payload = { ...rest };
      if(location) payload.description = location; // geçici olarak lokasyonu açıklamada sakla
      if(!payload.eventTime) payload.eventTime = new Date().toISOString();
      await axios.post(`/shipments/${id}/events`, payload);
      toast.success('Olay eklendi');
      setNewEvent({ status: newEvent.status || 'in_transit', location: '', eventTime: '' });
      const ev = await axios.get(`/shipments/${id}/events`).catch(()=>({ data: [] }));
      setEvents(ev.data?.events || ev.data || []);
    } catch(e){ console.error(e); toast.error('Olay eklenemedi'); }
  };

  const addCharge = async () => {
    try {
      const amt = Number(newCharge.amount);
      if(!newCharge.type || !amt){ toast.error('Masraf türü ve tutar gerekli'); return; }
      const payload = { type: newCharge.type, amount: amt, currency: newCharge.currency || 'USD' };
      await axios.post(`/shipments/${id}/charges`, payload);
      toast.success('Masraf eklendi');
      setNewCharge({ type: newCharge.type || 'freight', amount: '', currency: newCharge.currency || 'USD' });
      const ch = await axios.get(`/shipments/${id}/charges`).catch(()=>({ data: [] }));
      setCharges(ch.data?.charges || ch.data || []);
    } catch(e){ console.error(e); toast.error('Masraf eklenemedi'); }
  };

  const addException = async () => {
    try {
      if(!newException.code){ toast.error('Özel durum kodu gerekli'); return; }
      const payload = { ...newException };
      await axios.post(`/shipments/${id}/exceptions`, payload);
      toast.success('Özel durum eklendi');
      setNewException({ code: newException.code || 'delay', severity: 'low', message: '' });
      const ex = await axios.get(`/shipments/${id}/exceptions`).catch(()=>({ data: [] }));
      setExceptions(ex.data?.exceptions || ex.data || []);
    } catch(e){ console.error(e); toast.error('Özel durum eklenemedi'); }
  };

  const startEditException = (x) => {
    setEditExceptions((m) => ({ ...m, [x.id]: { severity: x.severity || 'low', message: x.message || '' } }));
  };
  const commitEditException = async (x) => {
    try {
      const draft = editExceptions[x.id];
      if(!draft) return;
      await axios.patch(`/shipments/${id}/exceptions/${x.id}`, { severity: draft.severity, message: draft.message });
      const ex = await axios.get(`/shipments/${id}/exceptions`).catch(()=>({ data: [] }));
      setExceptions(ex.data?.exceptions || ex.data || []);
      setEditExceptions((m)=>{ const n={...m}; delete n[x.id]; return n; });
      toast.success('Özel durum güncellendi');
    } catch(e){ console.error(e); toast.error('Güncelleme başarısız'); }
  };
  const cancelEditException = (id) => {
    setEditExceptions((m)=>{ const n={...m}; delete n[id]; return n; });
  };

  // Auth context available if needed later

  return (
    <Box>
      <PageHeader
        title={`Sevkiyat ${code}`}
        description="Zaman çizelgesi, çoklu bacaklar ve özel durumlar"
        right={<Stack direction="row" spacing={1}><Button onClick={()=>navigate(-1)} variant="outlined">Geri</Button><Button onClick={loadAll} variant="contained">Yenile</Button></Stack>}
      />
      <MainCard sx={{ mt: 1 }}>
        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        )}

        {!loading && shipment && (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <NotesPanel base="/shipments" entityId={id} />
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5">{code}</Typography>
                  <StatusChip status={shipment.status} />
                  {shipment.incoterm && <Chip size="small" label={shipment.incoterm} />}
                </Stack>
                <Typography variant="body2" color="text.secondary">Taşıyıcı: {shipment.carrier || '-'}</Typography>
                <Typography variant="body2" color="text.secondary">ETA: {shipment.eta ? new Date(shipment.eta).toLocaleString('tr-TR') : '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Chip color="primary" variant="outlined" label={`Toplam Masraf: ${totals.chargeTotal.toFixed(2)}`} />
                  <Chip color="warning" variant="outlined" label={`Özel durum: ${totals.exceptionCount}`} />
                </Stack>
              </Grid>
            </Grid>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Bacaklar</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems={{ xs:'stretch', sm:'center' }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Mod</InputLabel>
                        <Select label="Mod" value={newLeg.mode} onChange={e=>setNewLeg(l=>({ ...l, mode: e.target.value }))}>
                          <MenuItem value="road">Kara</MenuItem>
                          <MenuItem value="air">Hava</MenuItem>
                          <MenuItem value="sea">Deniz</MenuItem>
                          <MenuItem value="rail">Demiryolu</MenuItem>
                          <MenuItem value="courier">Kurye</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Origin" value={newLeg.origin} onChange={e=>setNewLeg(l=>({ ...l, origin: e.target.value }))} />
                      <TextField size="small" label="Destination" value={newLeg.destination} onChange={e=>setNewLeg(l=>({ ...l, destination: e.target.value }))} />
                      <TextField size="small" type="datetime-local" label="ETA" InputLabelProps={{ shrink: true }} value={newLeg.eta} onChange={e=>setNewLeg(l=>({ ...l, eta: e.target.value }))} />
                      <Button variant="contained" onClick={addLeg}>Ekle</Button>
                    </Stack>
                  </Paper>
                  {(legs||[]).map((l, idx) => (
                    <Paper key={l.id || idx} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2">{l.mode || 'MODE'}: {l.origin || '-'} → {l.destination || '-'}</Typography>
                        <Typography variant="body2" color="text.secondary">{l.eta ? new Date(l.eta).toLocaleDateString('tr-TR') : '-'}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                  {(!legs || legs.length===0) && <Typography variant="body2" color="text.secondary">Henüz bacak yok.</Typography>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Çizelge</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems={{ xs:'stretch', sm:'center' }}>
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Durum</InputLabel>
                        <Select label="Durum" value={newEvent.status} onChange={e=>setNewEvent(ev=>({ ...ev, status: e.target.value }))}>
                          <MenuItem value="created">Oluşturuldu</MenuItem>
                          <MenuItem value="picked_up">Alındı</MenuItem>
                          <MenuItem value="in_transit">Yolda</MenuItem>
                          <MenuItem value="customs">Gümrük</MenuItem>
                          <MenuItem value="delayed">Gecikme</MenuItem>
                          <MenuItem value="delivered">Teslim</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Not/Lokasyon" value={newEvent.location} onChange={e=>setNewEvent(ev=>({ ...ev, location: e.target.value }))} />
                      <TextField size="small" type="datetime-local" label="Zaman" InputLabelProps={{ shrink: true }} value={newEvent.eventTime} onChange={e=>setNewEvent(ev=>({ ...ev, eventTime: e.target.value }))} />
                      <Button variant="contained" onClick={addEvent}>Ekle</Button>
                    </Stack>
                  </Paper>
                  {groupedEvents.length === 0 && (
                    <Typography variant="body2" color="text.secondary">Henüz olay yok.</Typography>
                  )}
                  {groupedEvents.map(([dateKey, evs]) => (
                    <Box key={dateKey} sx={{}}
                    >
                      <Typography variant="subtitle2" sx={{ mt: 0.5, mb: 0.5 }}>
                        {dateKey === 'NA' ? 'Tarih yok' : new Date(dateKey).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Stack spacing={1} sx={{ pl: 1 }}>
                        {evs.map((ev, idx) => (
                          <Box key={ev.id || idx} sx={{ position: 'relative', pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                            <Box sx={{ position: 'absolute', left: -5, top: 8, width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" fontWeight={600}>{ev.status || ev.eventType || 'EVENT'}</Typography>
                              <Typography variant="caption" color="text.secondary">{ev.eventTime ? new Date(ev.eventTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}</Typography>
                            </Stack>
                            {ev.description && <Typography variant="caption" color="text.secondary">{ev.description}</Typography>}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Masraflar</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems={{ xs:'stretch', sm:'center' }}>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Tür</InputLabel>
                        <Select label="Tür" value={newCharge.type} onChange={e=>setNewCharge(c=>({ ...c, type: e.target.value }))}>
                          <MenuItem value="freight">Navlun</MenuItem>
                          <MenuItem value="insurance">Sigorta</MenuItem>
                          <MenuItem value="customs">Gümrük</MenuItem>
                          <MenuItem value="handling">Elleçleme</MenuItem>
                          <MenuItem value="other">Diğer</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Tutar" value={newCharge.amount} onChange={e=>setNewCharge(c=>({ ...c, amount: e.target.value }))} sx={{ width: 120 }} />
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Para Birimi</InputLabel>
                        <Select label="Para Birimi" value={newCharge.currency} onChange={e=>setNewCharge(c=>({ ...c, currency: e.target.value }))}>
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="EUR">EUR</MenuItem>
                          <MenuItem value="TRY">TRY</MenuItem>
                        </Select>
                      </FormControl>
                      <Button variant="contained" onClick={addCharge}>Ekle</Button>
                    </Stack>
                  </Paper>
                  {(charges||[]).map((c, idx) => (
                    <Paper key={c.id || idx} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2">{c.type || 'CHARGE'}</Typography>
                        <Typography variant="body2" color="text.secondary">{Number(c.amount||0).toFixed(2)} {c.currency || ''}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                  {(!charges || charges.length===0) && <Typography variant="body2" color="text.secondary">Henüz masraf yok.</Typography>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Özel Durumlar</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems={{ xs:'stretch', sm:'center' }}>
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Kod</InputLabel>
                        <Select label="Kod" value={newException.code} onChange={e=>setNewException(x=>({ ...x, code: e.target.value }))}>
                          <MenuItem value="delay">Gecikme</MenuItem>
                          <MenuItem value="damage">Hasar</MenuItem>
                          <MenuItem value="lost">Kayıp</MenuItem>
                          <MenuItem value="customs_hold">Gümrük Blokaj</MenuItem>
                          <MenuItem value="other">Diğer</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Önem</InputLabel>
                        <Select label="Önem" value={newException.severity} onChange={e=>setNewException(x=>({ ...x, severity: e.target.value }))}>
                          <MenuItem value="low">Düşük</MenuItem>
                          <MenuItem value="medium">Orta</MenuItem>
                          <MenuItem value="high">Yüksek</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Mesaj" value={newException.message} onChange={e=>setNewException(x=>({ ...x, message: e.target.value }))} sx={{ flex: 1 }} />
                      <Button variant="contained" onClick={addException}>Ekle</Button>
                    </Stack>
                  </Paper>
                  {(exceptions||[]).map((x, idx) => {
                    const draft = editExceptions[x.id];
                    return (
                      <Paper key={x.id || idx} variant="outlined" sx={{ p: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2">{x.code || 'EXCEPTION'}</Typography>
                            {/* Önem (severity) ve durum rozetleri */}
                            {x.severity && (
                              <Chip size="small" color={x.severity==='high' ? 'error' : x.severity==='medium' ? 'warning' : 'default'} variant="outlined" label={`Önem: ${x.severity}`} />
                            )}
                            <Chip size="small" color={x.resolvedAt ? 'success' : 'warning'} variant="outlined" label={x.resolvedAt ? `Çözüldü • ${fmtDate(x.resolvedAt)}` : 'Açık'} />
                          </Stack>
                          {!draft ? (
                            <Button size="small" variant="text" onClick={()=>startEditException(x)}>Düzenle</Button>
                          ) : (
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="outlined" onClick={()=>commitEditException(x)}>Kaydet</Button>
                              <Button size="small" variant="text" onClick={()=>cancelEditException(x.id)}>Vazgeç</Button>
                            </Stack>
                          )}
                        </Stack>
                        {!draft ? (
                          <>
                            {x.message && <Typography variant="body2" color="text.secondary">{x.message}</Typography>}
                            <FormControlLabel sx={{ mt: 0.5 }} control={<Switch size="small" checked={!!x.resolvedAt} onChange={async (e)=>{
                              try {
                                const body = e.target.checked ? { resolvedAt: new Date().toISOString() } : { resolvedAt: null };
                                await axios.patch(`/shipments/${id}/exceptions/${x.id}`, body);
                                const ex = await axios.get(`/shipments/${id}/exceptions`).catch(()=>({ data: [] }));
                                setExceptions(ex.data?.exceptions || ex.data || []);
                              } catch(err){ console.error(err); toast.error('Durum değiştirilemedi'); }
                            }} />} label={x.resolvedAt ? 'Çözüldü' : 'Açık'} />
                          </>
                        ) : (
                          <Stack direction={{ xs:'column', sm:'row' }} spacing={1} sx={{ mt: 1 }}>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                              <InputLabel>Önem</InputLabel>
                              <Select label="Önem" value={draft.severity} onChange={e=>setEditExceptions(m=>({ ...m, [x.id]: { ...m[x.id], severity: e.target.value } }))}>
                                <MenuItem value="low">Düşük</MenuItem>
                                <MenuItem value="medium">Orta</MenuItem>
                                <MenuItem value="high">Yüksek</MenuItem>
                              </Select>
                            </FormControl>
                            <TextField size="small" label="Mesaj" value={draft.message} onChange={e=>setEditExceptions(m=>({ ...m, [x.id]: { ...m[x.id], message: e.target.value } }))} sx={{ flex: 1 }} />
                          </Stack>
                        )}
                      </Paper>
                    );
                  })}
                  {(!exceptions || exceptions.length===0) && <Typography variant="body2" color="text.secondary">Henüz özel durum yok.</Typography>}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        )}

        {!loading && !shipment && (
          <Typography variant="body2" color="text.secondary">Kayıt bulunamadı.</Typography>
        )}
      </MainCard>
    </Box>
  );
}
