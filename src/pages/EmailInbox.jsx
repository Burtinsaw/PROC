import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { listInbox, seedInbox, listAccounts, imapSyncNow, updateMessageFlags, moveMessage } from '../api/email';
import { markSpam, markHam } from '../api/email';
import {
  Box, Stack, Divider, Typography, TextField, IconButton, Button, Chip,
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
import ContentContainer from '../components/layout/ContentContainer';
import { useChat } from '../contexts/ChatContext';

const COMPANY_COLORS = { BN: '#1f77b4', YN: '#ff7f0e', AL: '#2ca02c', TG: '#d62728', OT: '#9467bd', NZ: '#8c564b' };

export default function EmailInbox(){
  const qc = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const chat = useChat();
  const [q, setQ] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  // hesap yönetimi bu sayfada değil; Ayarlar'a taşındı
  const [showPreview, setShowPreview] = useState(true);
  const [compact, setCompact] = useState(false);
  const [folder, setFolder] = useState('INBOX');
  const [customFolders, setCustomFolders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('email.customFolders')||'[]'); } catch { return []; }
  });
  const [newFolder, setNewFolder] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [emailCountsVersion, setEmailCountsVersion] = useState(0);

  // Kullanıcı tercihlerini yükle
  useEffect(() => {
    try {
      const defCompanies = JSON.parse(localStorage.getItem('email.defaultCompanies') || '[]');
      if (Array.isArray(defCompanies)) setCompanies(defCompanies);
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
      setPage(0);
    } catch { /* ignore */ }
  }, [location.search]);

  // (refetch'e bağlı effectler useQuery tanımının altına taşındı)

  // Global email counts change → refresh spam chip immediately
  useEffect(()=>{
    const onChange = ()=> setEmailCountsVersion(v => v + 1);
    window.addEventListener('email-counts-changed', onChange);
    return ()=> window.removeEventListener('email-counts-changed', onChange);
  }, []);

  // Hesaplarım
  const { data: accData } = useQuery({ queryKey:['email-accounts'], queryFn: ()=>listAccounts() });
  const accounts = accData?.items || [];

  // Inbox veri
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['email-inbox', q, companies.join(','), accounts.map(a=>a.id).join(','), folder, page, limit],
    queryFn: ()=>{
      const isStarred = folder === 'STARRED';
      const f = isStarred ? undefined : folder;
      return listInbox({ limit, offset: page*limit, q, companies, folder: f, flagged: isStarred ? true : undefined });
    }
  });
  const items = useMemo(()=> data?.items || [], [data]);
  const total = data?.total || 0;
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
  useEffect(()=>{
    const onCounts = ()=> { refetch(); };
    window.addEventListener('email-counts-changed', onCounts);
    const onSockCounts = ()=> { refetch(); };
  chat?.socket?.on?.('email:counts_changed', onSockCounts);
  return ()=> { window.removeEventListener('email-counts-changed', onCounts); chat?.socket?.off?.('email:counts_changed', onSockCounts); };
  }, [refetch, chat]);

  // q değişince URL ?q= parametresini güncel tut
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      if ((sp.get('q') || '') !== (q || '')) {
        if (q) sp.set('q', q); else sp.delete('q');
    const url = `${location.pathname}${sp.toString() ? `?${sp.toString()}` : ''}`;
        window.history.replaceState(null, '', url);
      }
    } catch { /* ignore */ }
  }, [q, location.pathname, location.search]);

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
          <Stack direction="row" spacing={1} alignItems="center">
            {Object.keys(COMPANY_COLORS).map(code => (
              <Chip key={code} size="small" label={code}
                color={companies.includes(code) ? 'primary' : 'default'}
                variant={companies.includes(code) ? 'filled' : 'outlined'}
                onClick={()=> setCompanies(v => v.includes(code) ? v.filter(x=>x!==code) : [...v, code])}
              />
            ))}
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

  {/* İçerik: Sol (hesaplar) | Orta (liste) | Sağ (önizleme) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: showPreview ? '280px 1fr 38%' : '300px 1fr', height: '100%' }}>
          {/* Sol panel */}
      <Box sx={{ borderRight: '1px solid', borderColor: 'divider', p: 1.5, overflow: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Klasörler</Typography>
            <List dense>
              {['INBOX','SENT','SPAM','TRASH','STARRED','ARCHIVE'].map(f => (
                <ListItemButton key={f} selected={folder===f} onClick={()=>{ setFolder(f); setPage(0); try{ const slug=f.toLowerCase(); window.history.replaceState(null, '', `/email/${slug}`);}catch{/* noop */} }} sx={{ borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width:'100%' }}>
                        <span>{({INBOX:'Gelen Kutusu', SENT:'Gönderilen', SPAM:'Spam', TRASH:'Çöp', STARRED:'Yıldızlı', ARCHIVE:'Arşiv'})[f]}</span>
                        {f==='SPAM' && (window.__emailCounts?.spamUnread > 0) ? (
                          <Chip key={emailCountsVersion} size="small" color="error" label={window.__emailCounts.spamUnread} />
                        ) : null}
                      </Stack>
                    }
                  />
                </ListItemButton>
              ))}
              {customFolders.map(f => (
                <ListItemButton key={f} selected={folder===f} onClick={()=>{ setFolder(f); setPage(0); try{ const slug=f.toLowerCase(); window.history.replaceState(null, '', `/email/${slug}`);}catch{/* noop */} }} sx={{ borderRadius: 1 }}>
                  <ListItemText primary={f} />
                </ListItemButton>
              ))}
            </List>
            <Stack direction="row" spacing={1} sx={{ mt: .5 }}>
              <TextField size="small" placeholder="Yeni klasör" value={newFolder} onChange={(e)=> setNewFolder(e.target.value)} />
              <Button size="small" variant="outlined" onClick={()=>{
                const f = String(newFolder||'').trim(); if(!f) return;
                const F = f.toUpperCase();
                setCustomFolders(prev => {
                  if(prev.includes(F)) return prev; const next = [...prev, F];
                  try{ localStorage.setItem('email.customFolders', JSON.stringify(next)); }catch{/* ignore */}
                  return next;
                });
                setNewFolder('');
              }}>Ekle</Button>
            </Stack>

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
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ pr: 1 }}>
                            <Typography sx={{ fontWeight: 700, flex: 1, minWidth: 0 }} noWrap>{m.subject || '(Konu yok)'}</Typography>
                            <Typography variant="caption" color="text.secondary">{m.date ? new Date(m.date).toLocaleString() : ''}</Typography>
                          </Stack>
                        }
                        secondary={
                          <>
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
                                {m.snippet || m.bodyText?.slice(0,140)}
                              </Typography>
                            <Typography variant="caption" color="text.secondary">From: {m.from} • To: {m.to}</Typography>
                          </>
                        }
                      />
                      <Tooltip title={m.flagged ? 'Yıldızlı' : 'Yıldızla'}>
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
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{selected.subject || '(Konu yok)'}</Typography>
                      </Stack>
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">From: {selected.from}</Typography>
                        <Typography variant="caption" color="text.secondary">To: {selected.to}</Typography>
                        <Typography variant="caption" color="text.secondary">Tarih: {selected.date ? new Date(selected.date).toLocaleString() : ''}</Typography>
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
 
