import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { listInbox, seedInbox, listAccounts, imapSyncNow, updateMessageFlags, moveMessage } from '../api/email';
import { markSpam, markHam } from '../api/email';
import {
  Box, Stack, Divider, Typography, TextField, IconButton, Button,
  List, ListItemButton, ListItemText, Tooltip,
  Switch, FormControlLabel, Paper
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import CreateIcon from '@mui/icons-material/Create';
import PushPinIcon from '@mui/icons-material/PushPin';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import ContentContainer from '../components/layout/ContentContainer';
import { useChat } from '../contexts/ChatContext';

// Şirket renkleri artık üstte chip olarak kullanılmıyor; sol panelde şirket listesi için tutulabilir.
const COMPANY_COLORS = { BN: '#1f77b4', YN: '#ff7f0e', AL: '#2ca02c', TG: '#d62728', OT: '#9467bd', NZ: '#8c564b' };

export default function EmailInbox(){
  const qc = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const chat = useChat();
  const [q, setQ] = useState('');
  // Basit debounce helper
  const useDebounce = (val, delay) => {
    const [d, setD] = useState(val);
    useEffect(() => {
      const id = setTimeout(() => setD(val), delay);
      return () => clearTimeout(id);
    }, [val, delay]);
    return d;
  };
  const qDebounced = useDebounce(q, 300);
  // Üst çubuk: Bugünkü okunmayanlar ve Pin'ler
  const [todayUnread, setTodayUnread] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const todayUnreadDebounced = useDebounce(todayUnread, 150);
  const showPinsDebounced = useDebounce(showPins, 150);
  // Sol panelde tek seçimli şirket filtresi
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  // hesap yönetimi bu sayfada değil; Ayarlar'a taşındı
  const [showPreview, setShowPreview] = useState(true);
  const [compact, setCompact] = useState(false);
  const [folder, setFolder] = useState('INBOX');
  // Klasör UI'ı bu sayfadan kaldırıldı; sadece URL'den okunur.
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);

  // Kullanıcı tercihlerini yükle
  useEffect(() => {
    try {
      setShowPreview(localStorage.getItem('email.previewPane') !== 'false');
      setCompact(localStorage.getItem('email.listDensity') === 'compact');
    } catch { /* ignore */ }
  }, []);

  // URL'den klasör seçimi (örn: /email/sent) ve URL değişince güncelle
  useEffect(() => {
    try{
      const parts = location.pathname.split('/');
      const f = String(parts[2] || '').toUpperCase();
      if (f) setFolder(f);
    }catch{/* ignore */}
  }, [location.pathname]);

  // URL'den arama parametresi (?q=) oku ve değişince uygula
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      const v = sp.get('q') || '';
      setQ(v);
  const comp = sp.get('company');
  setSelectedCompany(comp || null);
      setPage(0);
    } catch { /* ignore */ }
  }, [location.search]);

  // (refetch'e bağlı effectler useQuery tanımının altına taşındı)

  // Global email counts değişince listeyi tazelemek için ayrı bir state tutmaya gerek yok.

  // Hesaplarım
  const { data: accData } = useQuery({ queryKey:['email-accounts'], queryFn: ()=>listAccounts() });
  const accounts = accData?.items || [];

  // Inbox veri
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['email-inbox', qDebounced, selectedCompany || '', accounts.map(a=>a.id).join(','), folder, page, limit, todayUnreadDebounced, showPinsDebounced],
    queryFn: ({ signal })=>{
      const isStarred = folder === 'STARRED';
      const f = isStarred ? undefined : folder;
      const companiesParam = selectedCompany ? [selectedCompany] : undefined;
      const flaggedParam = showPinsDebounced ? true : (isStarred ? true : undefined);
      const unreadParam = todayUnreadDebounced ? true : undefined;
      return listInbox({ limit, offset: page*limit, q: qDebounced, companies: companiesParam, folder: f, flagged: flaggedParam, unread: unreadParam }, { signal });
    },
    keepPreviousData: true,
    retry: false,
  });
  // İstemci tarafı "bugün" süzgeci (API'den unread=true gelir; tarih kontrolü burada yapılır)
  const rawItems = useMemo(()=> data?.items || [], [data]);
  const items = useMemo(()=> {
    if (!todayUnread) return rawItems;
    const today = dayjs();
    return rawItems.filter(m => m?.date && dayjs(m.date).isSame(today, 'day') && (m.unread === true));
  }, [rawItems, todayUnread]);
  const total = items.length;
  const selected = useMemo(()=> items.find(x=> (x.id||x.messageId) === selectedId ) || items[0], [items, selectedId]);

  // Hesap CRUD artık Ayarlar > E-Posta sayfasında yönetiliyor

  // Otomatik yenileme (ayar: email.autoRefreshSec)
  useEffect(() => {
    let timer;
    try {
      const sec = parseInt(localStorage.getItem('email.autoRefreshSec') || '0', 10) || 0;
      if (sec > 0) {
        timer = setInterval(() => { refetch(); }, Math.max(5, sec) * 1000);
      }
    } catch {/* ignore */}
    return () => { if (timer) clearInterval(timer); };
  }, [refetch]);

  // Email counts real-time → listeyi tazele (spam taşıma vb. sonrası)
  const refetchTimer = useRef(null);
  const scheduleRefetch = useCallback(() => {
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => { refetch(); }, 250);
  }, [refetch]);
  useEffect(()=>{
    const onCounts = ()=> { scheduleRefetch(); };
    window.addEventListener('email-counts-changed', onCounts);
    const onSockCounts = ()=> { scheduleRefetch(); };
  chat?.socket?.on?.('email:counts_changed', onSockCounts);
  return ()=> { window.removeEventListener('email-counts-changed', onCounts); chat?.socket?.off?.('email:counts_changed', onSockCounts); if (refetchTimer.current) clearTimeout(refetchTimer.current); };
  }, [refetch, chat, scheduleRefetch]);

  // q değişince URL ?q= parametresini güncel tut
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      if ((sp.get('q') || '') !== (q || '')) {
        if (q) sp.set('q', q); else sp.delete('q');
    if (selectedCompany) sp.set('company', selectedCompany); else sp.delete('company');
    const url = `${location.pathname}${sp.toString() ? `?${sp.toString()}` : ''}`;
        window.history.replaceState(null, '', url);
      }
    } catch { /* ignore */ }
  }, [q, selectedCompany, location.pathname, location.search]);

  return (
  <ContentContainer disableGutters>
      <Paper variant="outlined" sx={{ height: 'calc(100vh - 160px)', display: 'grid', gridTemplateRows: '56px 1fr' }}>
        {/* Üst araç çubuğu */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <InboxIcon fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 2 }}>Gelen Kutusu</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 560 }}>
            <SearchIcon fontSize="small" />
            <TextField
              size="small"
              fullWidth
              placeholder="Ara (konu, içerik, gönderen)"
              value={q}
              onChange={(e)=> setQ(e.target.value)}
            />
          </Box>
          {/* Üst filtreler: ikon butonları */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title="Bugün • Okunmayanlar">
              <span>
                <IconButton size="small" color={todayUnread ? 'primary' : 'default'} onClick={()=> { setTodayUnread(v=>!v); setPage(0); }}>
                  <MarkEmailUnreadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Pin'ler">
              <span>
                <IconButton size="small" color={showPins ? 'primary' : 'default'} onClick={()=> { setShowPins(v=>!v); setPage(0); setFolder('INBOX'); }}>
                  <PushPinIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      <Tooltip title="IMAP Senkron">
            <span>
        <IconButton size="small" onClick={async()=> { await imapSyncNow(); refetch(); }}><SyncIcon /></IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Yenile">
            <span>
              <IconButton size="small" onClick={()=> refetch()} disabled={isFetching}><RefreshIcon /></IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Yeni E-Posta">
            <span>
              <IconButton size="small" color="primary" onClick={()=> navigate('/email/compose')}><CreateIcon /></IconButton>
            </span>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <FormControlLabel sx={{ ml: 1 }} control={<Switch size="small" checked={showPreview} onChange={(e)=>{
            const v = e.target.checked; setShowPreview(v); try { localStorage.setItem('email.previewPane', String(v)); } catch { /* ignore */ }
          }} />} label={<Typography variant="caption">Önizleme</Typography>} />
          <FormControlLabel sx={{ ml: .5 }} control={<Switch size="small" checked={compact} onChange={(e)=>{
            const v = e.target.checked; setCompact(v); try { localStorage.setItem('email.listDensity', v ? 'compact' : 'comfortable'); } catch { /* ignore */ }
          }} />} label={<Typography variant="caption">Kompakt</Typography>} />
        </Stack>

  {/* İçerik: Sol (şirket gelen kutuları) | Orta (liste) | Sağ (önizleme) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: showPreview ? '240px 1fr 38%' : '260px 1fr', height: '100%' }}>
          {/* Sol panel */}
          <Box sx={{ borderRight: '1px solid', borderColor: 'divider', p: 1.5, overflow: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Gelen Kutuları</Typography>
            <List dense>
              <ListItemButton selected={!selectedCompany} onClick={()=> { setSelectedCompany(null); setPage(0); setFolder('INBOX'); try{ window.history.replaceState(null, '', `/email/inbox`);}catch{/* noop */} }} sx={{ borderRadius: 1 }}>
                <ListItemText primary="Ortak Gelen Kutusu" />
              </ListItemButton>
            </List>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: .5 }}>Firma Gelen Kutuları</Typography>
            <List dense>
              {Array.from(new Set((accounts||[]).map(a=>a.companyCode).filter(Boolean))).map(code => (
                <ListItemButton key={code} selected={selectedCompany===code} onClick={()=> { setSelectedCompany(code); setPage(0); setFolder('INBOX'); try{ window.history.replaceState(null, '', `/email/inbox?company=${encodeURIComponent(code)}`);}catch{/* noop */} }} sx={{ borderRadius: 1 }}>
                  <ListItemText primaryTypographyProps={{ component:'div' }} primary={
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width:'100%' }}>
                      <span>{code}</span>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COMPANY_COLORS[code] || 'divider' }} />
                    </Stack>
                  } />
                </ListItemButton>
              ))}
              {Array.from(new Set((accounts||[]).map(a=>a.companyCode).filter(Boolean))).length === 0 && (
                <ListItemButton disabled><ListItemText primary="Kayıtlı firma bulunamadı" /></ListItemButton>
              )}
            </List>

            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Hesap Yönetimi</Typography>
            <Button size="small" variant="outlined" onClick={()=> { try{ window.location.href = '/settings/email'; } catch {/* noop */} }}>Ayarlar› E‑Posta</Button>

            {import.meta?.env?.MODE !== 'production' && (
              <Button fullWidth variant="outlined" size="small" sx={{ mt: 1 }} onClick={async ()=>{ await seedInbox(); refetch(); }}>Mock Doldur</Button>
            )}
          </Box>

          {/* Orta liste */}
          <Box sx={{ overflow: 'auto' }}>
            {/* Liste başlık çubuğu (opsiyonel) */}
            <Stack direction="row" spacing={1} sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{folder==='INBOX'?'Gelen Kutusu': folder==='SENT'?'Gönderilen': folder==='SPAM'?'Spam': folder==='STARRED'?'Yıldızlı': folder==='ARCHIVE'?'Arşiv': folder}</Typography>
            </Stack>
            {isLoading ? (
              <Box sx={{ p: 2 }}><Typography>Yükleniyor...</Typography></Box>
            ) : (
              <List dense={compact}>
                {items.map(m => {
                  const selectedNow = selected && (m.id||m.messageId)===(selected.id||selected.messageId);
                  return (
                    <ListItemButton
                      key={m.id || m.messageId}
                      onClick={()=> setSelectedId(m.id||m.messageId)}
                      selected={!!selectedNow}
                      sx={{ alignItems: 'flex-start', borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ pr: 1 }}>
                            <Typography component="div" sx={{ fontWeight: 700, flex: 1, minWidth: 0 }} noWrap>{m.subject || '(Konu yok)'}</Typography>
                            <Typography component="span" variant="caption" color="text.secondary">{m.date ? new Date(m.date).toLocaleString() : ''}</Typography>
                          </Stack>
                        }
                        secondary={
                          <>
                            <Typography component="div" variant="body2" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
                              {m.snippet || m.bodyText?.slice(0,140)}
                            </Typography>
                            <Typography component="div" variant="caption" color="text.secondary">From: {m.from} • To: {m.to}</Typography>
                          </>
                        }
                      />
                      <Tooltip title={m.flagged ? 'Pinned' : 'Pinle'}>
                        <IconButton size="small" edge="end" sx={{ ml: 1 }} onClick={async (e)=>{ e.stopPropagation(); await updateMessageFlags(m.id||m.messageId, { flagged: !m.flagged }); qc.invalidateQueries({ queryKey:['email-inbox'] }); }}>
              {m.flagged ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                        </IconButton>
            </Tooltip>
                    </ListItemButton>
                  );
                })}
                {items.length === 0 && (
                  <Box sx={{ p: 2 }}><Typography color="text.secondary">Kayıt bulunamadı.</Typography></Box>
                )}
              </List>
            )}
            {/* Sayfalama */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">Toplam {total} kayıt</Typography>
              <Stack direction="row" spacing={1}>
                <TextField size="small" select label="Sayfa boyutu" value={limit} onChange={(e)=>{ const v = parseInt(e.target.value,10)||50; setLimit(v); setPage(0);} } sx={{ width: 140 }}>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </TextField>
                <Button size="small" disabled={page===0} onClick={()=> setPage(p=> Math.max(0, p-1))}>Önceki</Button>
                <Button size="small" disabled={(page+1)*limit >= total} onClick={()=> setPage(p=> p+1)}>Sonraki</Button>
              </Stack>
            </Stack>
          </Box>

          {/* Sağ önizleme */}
          {showPreview && (
            <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', p: 2, overflow: 'auto' }}>
              {!selected ? (
                <Typography color="text.secondary">Bir mail seçin.</Typography>
              ) : (
                <Box>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography component="div" variant="h6" sx={{ fontWeight: 700 }}>{selected.subject || '(Konu yok)'}</Typography>
                      </Stack>
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography component="div" variant="caption" color="text.secondary">From: {selected.from}</Typography>
                        <Typography component="div" variant="caption" color="text.secondary">To: {selected.to}</Typography>
                        <Typography component="div" variant="caption" color="text.secondary">Tarih: {selected.date ? new Date(selected.date).toLocaleString() : ''}</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Button size="small" variant="outlined" onClick={async ()=>{ if (selected.id) { await updateMessageFlags(selected.id, { unread: false }); qc.invalidateQueries({ queryKey:['email-inbox'] }); } }}>Okundu</Button>
                    <Button size="small" variant="outlined" onClick={async ()=>{ if (selected.id) { await updateMessageFlags(selected.id, { unread: true }); qc.invalidateQueries({ queryKey:['email-inbox'] }); } }}>Okunmadı</Button>
                    <Button size="small" variant="outlined" onClick={async ()=>{ if (selected.id) { await moveMessage(selected.id, 'ARCHIVE'); setFolder('ARCHIVE'); qc.invalidateQueries({ queryKey:['email-inbox'] }); } }}>Arşive Taşı</Button>
                    {folder !== 'TRASH' ? (
                      <Button size="small" color="error" variant="outlined" onClick={async ()=>{ if (selected.id) { await moveMessage(selected.id, 'TRASH'); setFolder('TRASH'); qc.invalidateQueries({ queryKey:['email-inbox'] }); } }}>Çöpe Taşı</Button>
                    ) : (
                      <Button size="small" variant="outlined" onClick={async ()=>{ if (selected.id) { await moveMessage(selected.id, 'INBOX'); setFolder('INBOX'); qc.invalidateQueries({ queryKey:['email-inbox'] }); } }}>Gelen’e Geri Al</Button>
                    )}
                    {folder === 'SPAM' ? (
                      <Button size="small" variant="outlined" onClick={async ()=>{ if (selected.id) { await markHam(selected.id); setFolder('INBOX'); qc.invalidateQueries({ queryKey:['email-inbox'] }); } }}>Spam Değil</Button>
                    ) : (
                      <Button size="small" variant="outlined" onClick={async ()=>{ if (selected.id) { await markSpam(selected.id); setFolder('SPAM'); qc.invalidateQueries({ queryKey:['email-inbox'] }); } }}>Spam</Button>
                    )}
                  </Stack>
                  {selected.bodyHtml ? (
                    <Box dangerouslySetInnerHTML={{ __html: selected.bodyHtml }} />
                  ) : (
                    <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selected.bodyText || selected.snippet}</Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
  </ContentContainer>
  );
}
 
