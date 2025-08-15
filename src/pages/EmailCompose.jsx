import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Paper, Stack, TextField, Typography, Alert, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import RichTextEditor from '../components/RichTextEditor';
import dayjs from 'dayjs';
import { upsertDraft, sendNow, scheduleSend, lockDraft, unlockDraft, getDraft, uploadDraftAttachment, listDraftAttachments, deleteDraftAttachment, joinDraftPresence, leaveDraftPresence, getDraftPresence, patchDraft, listAccounts } from '../api/email';
import { useChat } from '../contexts/ChatContext';

function useQuery(){
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function EmailCompose(){
  const query = useQuery();
  const navigate = useNavigate();
  const draftIdParam = query.get('id');
  const [draftId, setDraftId] = useState(draftIdParam ? Number(draftIdParam) : null);
  const [form, setForm] = useState({ to:'', cc:'', bcc:'', subject:'', bodyText:'', bodyHtml:'' });
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const autosaveTimer = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [collab, setCollab] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const chat = useChat();

  // Load existing draft if id provided
  useEffect(() => {
    let mounted = true;
    async function load(){
      try{
        if (!draftIdParam) return;
        const { item } = await getDraft(Number(draftIdParam));
        if (mounted && item){
          setDraftId(item.id);
          setForm({ to:item.to||'', cc:item.cc||'', bcc:item.bcc||'', subject:item.subject||'', bodyText:item.bodyText||'', bodyHtml:item.bodyHtml||'' });
          setAccountId(item.accountId || '');
          try { const { items } = await listDraftAttachments(item.id); if(mounted) setAttachments(items||[]); } catch { /* ignore */ }
        }
        try { await lockDraft(Number(draftIdParam)); } catch { /* ignore */ }
        // presence join + socket oda katılımı
  try { await joinDraftPresence(Number(draftIdParam)); } catch { /* ignore */ }
  try { chat?.socket?.emit?.('draft:join', Number(draftIdParam)); } catch { /* ignore */ }
  try { const { users } = await getDraftPresence(Number(draftIdParam)); if(mounted) setCollab(users||[]); } catch { /* ignore */ }
      } catch(e){ setError(e.message || 'Taslak yüklenemedi'); }
    }
    load();
    return () => {
      mounted = false;
      if (draftIdParam) { unlockDraft(Number(draftIdParam)).catch(()=>{}); }
      if (draftIdParam) { leaveDraftPresence(Number(draftIdParam)).catch(()=>{}); }
  try { chat?.socket?.emit?.('draft:leave', Number(draftIdParam)); } catch { /* ignore */ }
    };
  }, [draftIdParam, chat?.socket]);

  // Hesapları yükle ve gerekirse varsayılanı ata
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { items } = await listAccounts();
        if (!mounted) return;
        setAccounts(items || []);
        if (!accountId && items && items.length > 0) setAccountId(items[0].id);
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [accountId]);

  // Auto-save every 2s after change
  useEffect(() => {
    if (busy) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
  const data = { ...form };
    autosaveTimer.current = setTimeout(async () => {
      try {
    const payload = { id: draftId, ...data, accountId: accountId || undefined };
        const { item } = await upsertDraft(payload);
        if (!draftId) setDraftId(item.id);
        setInfo(`Taslak kaydedildi ${dayjs(item.updatedAt).format('HH:mm:ss')}`);
        setError('');
        // Patch yayını (best-effort, diğer istemciler için)
  try { if (draftId) await patchDraft(draftId, data); } catch { /* ignore */ }
  try { chat?.socket?.emit?.('email:draft:typing', { id: draftId }); } catch { /* ignore */ }
      } catch(e){ setError(e.message || 'Taslak kaydedilemedi'); }
    }, 2000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [form, busy, draftId, chat?.socket, accountId]);

  const onChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // Socket presence/patch dinleyicileri
  useEffect(() => {
    if (!chat?.socket || !draftId) return;
    const onPresence = (p) => { if(p?.id===draftId) setCollab(p.users||[]); };
    const onPatch = (ev) => {
      if (ev?.id !== draftId) return;
      // başka kullanıcıdan gelen güncellemeleri form'a uygula (basit merge)
      setForm(f => ({ ...f, ...ev.updates }));
    };
    chat.socket.on('email:draft:presence', onPresence);
    chat.socket.on('email:draft:patch', onPatch);
    return () => { chat.socket.off?.('email:draft:presence', onPresence); chat.socket.off?.('email:draft:patch', onPatch); };
  }, [chat?.socket, draftId]);

  // Ek yükleme
  const onPickFile = async (e) => {
    try{
      const file = e.target.files?.[0];
      if(!file || !draftId) return;
      const { attachments: list } = await uploadDraftAttachment(draftId, file);
      setAttachments(list||[]);
    } catch(err){ setError(err.message || 'Ek yüklenemedi'); }
  };
  const removeAttachment = async (p) => {
    try{ if(!draftId) return; const { attachments: list } = await deleteDraftAttachment(draftId, p); setAttachments(list||[]); } catch { /* ignore */ }
  };

  async function handleSend(){
    try{
      setBusy(true); setError(''); setInfo('');
  const res = await sendNow({ draftId, accountId: accountId || undefined });
      if (res.success){
        setInfo('Gönderildi');
        navigate('/email/sent');
      } else { setError(res.error || 'Gönderilemedi'); }
    } catch(e){ setError(e.message || 'Gönderilemedi'); }
    finally { setBusy(false); }
  }

  async function handleSchedule(){
    try{
      if(!scheduledAt) { setError('Plan tarihi seçin'); return; }
      setBusy(true); setError(''); setInfo('');
  const res = await scheduleSend({ draftId, scheduledAt, accountId: accountId || undefined });
      if (res.success){ setInfo('Planlandı'); }
      else setError(res.error || 'Planlanamadı');
    } catch(e){ setError(e.message || 'Planlanamadı'); }
    finally { setBusy(false); }
  }

  async function handleSave(){
    try{
      setBusy(true); setError('');
      const payload = { id: draftId, ...form, accountId: accountId || undefined };
      const { item } = await upsertDraft(payload);
      if (!draftId) setDraftId(item.id);
      setInfo('Taslak kaydedildi');
    } catch(e){ setError(e.message || 'Kaydedilemedi'); }
    finally { setBusy(false); }
  }

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Yeni E-Posta</Typography>
      <Paper variant="outlined">
        <Box p={2}>
          <Stack spacing={2}>
            {info && <Alert severity="success">{info}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Kime" placeholder="user@example.com, ..." value={form.to} onChange={onChange('to')} fullWidth />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField label="Cc" value={form.cc} onChange={onChange('cc')} fullWidth /></Grid>
              <Grid item xs={12} md={6}><TextField label="Bcc" value={form.bcc} onChange={onChange('bcc')} fullWidth /></Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField label="Konu" value={form.subject} onChange={onChange('subject')} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="compose-account">Hesap</InputLabel>
                  <Select
                    labelId="compose-account"
                    label="Hesap"
                    value={accountId || ''}
                    onChange={(e)=> setAccountId(e.target.value)}
                  >
                    {(accounts||[]).map(a => (
                      <MenuItem key={a.id} value={a.id}>{a.emailAddress || a.username || `Hesap #${a.id}`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box>
              <Typography variant="subtitle2" gutterBottom>İçerik (Zengin Metin)</Typography>
              <RichTextEditor value={form.bodyHtml} onChange={(html)=> setForm(f => ({ ...f, bodyHtml: html }))} />
              <Typography variant="caption" color="text.secondary">Gerekirse düz metin için (bodyText) alanı kullanılır.</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" component="label">Ek Ekle
                <input type="file" hidden onChange={onPickFile} />
              </Button>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {attachments.map((a) => (
                  <Chip key={a.path} label={a.filename} onDelete={()=> removeAttachment(a.path)} variant="outlined" />
                ))}
              </Stack>
              <Box flex={1} />
              {collab && collab.length>0 && (
                <Stack direction="row" spacing={1}>
                  {collab.map(u => (<Chip key={u.id} size="small" label={u.name||`Kişi #${u.id}`} color="info" />))}
                </Stack>
              )}
            </Stack>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField type="datetime-local" label="Planla (tarih/saat)" InputLabelProps={{ shrink: true }} value={scheduledAt} onChange={(e)=> setScheduledAt(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} md={7}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={()=> navigate(-1)} disabled={busy}>İptal</Button>
                  <Button variant="outlined" color="info" onClick={handleSave} disabled={busy}>Taslak olarak kaydet</Button>
                  <Button variant="contained" color="secondary" onClick={handleSchedule} disabled={busy || !draftId}>Planla</Button>
                  <Button variant="contained" onClick={handleSend} disabled={busy || !draftId}>Gönder</Button>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
