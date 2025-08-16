import React, { useEffect, useState } from 'react';
import { Box, Paper, Stack, Typography, Divider, TextField, Switch, FormControlLabel, Button, Alert, Breadcrumbs, Link, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText } from '@mui/material';
import ContentContainer from '../../components/layout/ContentContainer';
import { getAutoReply, updateAutoReply, listAutoReplyLogs, listSignatures } from '../../api/email';

// Not: Backend endpoint'leri henüz tanımlı değilse bu sayfa sadece taslak olarak kalır.
// Örn. beklenen API:
// GET /email/auto-reply -> { enabled, subject, message, startAt, endAt, internalOnly }
// PUT /email/auto-reply -> body: aynı alanlar

export default function EmailAutoReply(){
  const [enabled, setEnabled] = useState(false);
  const [subject, setSubject] = useState('Ofis Dışındayım');
  const [message, setMessage] = useState('Merhaba, şu an ofis dışında olduğum için e-postanıza hemen dönüş yapamayacağım. Dönüş tarihimde yanıtlayacağım.');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [internalOnly, setInternalOnly] = useState(false);
  // Advanced policy
  const [excludeDomainsText, setExcludeDomainsText] = useState('');
  const [minIntervalHours, setMinIntervalHours] = useState(24);
  const [replyScope, setReplyScope] = useState('perSender');
  const [includeOriginal, setIncludeOriginal] = useState(false);
  const [signatureId, setSignatureId] = useState('');
  const [signatures, setSignatures] = useState([]);
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Logs
  const [logs, setLogs] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsSender, setLogsSender] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const item = await getAutoReply();
        if (!mounted) return;
        setEnabled(!!item.enabled);
        setSubject(item.subject ?? 'Ofis Dışındayım');
        setMessage(item.message ?? '');
        setStartAt(item.startAt ? new Date(item.startAt).toISOString().slice(0,16) : '');
        setEndAt(item.endAt ? new Date(item.endAt).toISOString().slice(0,16) : '');
        setInternalOnly(!!item.internalOnly);
        // Advanced defaults
        setExcludeDomainsText(Array.isArray(item.excludeDomains) ? item.excludeDomains.join(', ') : '');
        setMinIntervalHours(Number.isFinite(item.minIntervalHours) ? item.minIntervalHours : 24);
        setReplyScope(item.replyScope || 'perSender');
        setIncludeOriginal(!!item.includeOriginal);
        setSignatureId(item.signatureId || '');
        // Load signatures for selector
        const sigs = await listSignatures();
        if (!mounted) return;
        setSignatures(Array.isArray(sigs?.items) ? sigs.items : sigs || []);
        // Initial logs
        await loadLogs({ reset: true });
      } catch (e) {
        console.warn('Auto-reply fetch failed:', e?.message || e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLogs = async ({ reset = false } = {}) => {
    try {
      setLogsLoading(true);
      const { items, nextCursor: nc } = await listAutoReplyLogs({ cursor: reset ? undefined : nextCursor, sender: logsSender || undefined, limit: 50 });
      if (reset) {
        setLogs(items);
      } else {
        setLogs((prev) => [...prev, ...items]);
      }
      setNextCursor(nc);
    } catch (e) {
      console.warn('Auto-reply logs fetch failed:', e?.message || e);
    } finally {
      setLogsLoading(false);
    }
  };

  const onSave = async () => {
    try{
      setSaving(true);
      const excludeDomains = excludeDomainsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const payload = {
        enabled,
        subject,
        message,
        startAt: startAt || null,
        endAt: endAt || null,
        internalOnly,
        excludeDomains,
        minIntervalHours: Number(minIntervalHours) || 0,
        replyScope,
        includeOriginal,
        signatureId: signatureId || null
      };
      await updateAutoReply(payload);
      setInfo('Kaydedildi');
    } catch(e){ alert(e.message || 'Kaydedilemedi'); }
    finally { setSaving(false); }
  };

  return (
    <ContentContainer>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 12 }}>
          <Link underline="hover" color="inherit" href="/settings">Ayarlar</Link>
          <Link underline="hover" color="inherit" href="/settings/email">E-Posta</Link>
          <Typography color="text.primary" sx={{ fontSize: 12 }}>Otomatik Yanıt</Typography>
        </Breadcrumbs>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Otomatik Yanıt</Typography>
      </Stack>
      <Paper variant="outlined" sx={{ p: 2, opacity: loading ? 0.6 : 1, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Ofis Dışı / Otomatik Cevap</Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          <FormControlLabel control={<Switch checked={enabled} onChange={(e)=> setEnabled(e.target.checked)} disabled={loading || saving} />} label="Etkin" />
          <TextField size="small" label="Konu" value={subject} onChange={(e)=> setSubject(e.target.value)} sx={{ maxWidth: 520 }} disabled={loading || saving} />
          <TextField size="small" label="Mesaj" value={message} onChange={(e)=> setMessage(e.target.value)} multiline minRows={4} sx={{ maxWidth: 720 }} disabled={loading || saving} />
          <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
            <TextField size="small" type="datetime-local" label="Başlangıç" InputLabelProps={{ shrink: true }} value={startAt} onChange={(e)=> setStartAt(e.target.value)} sx={{ maxWidth: 280 }} disabled={loading || saving} />
            <TextField size="small" type="datetime-local" label="Bitiş" InputLabelProps={{ shrink: true }} value={endAt} onChange={(e)=> setEndAt(e.target.value)} sx={{ maxWidth: 280 }} disabled={loading || saving} />
          </Stack>
          <FormControlLabel control={<Switch checked={internalOnly} onChange={(e)=> setInternalOnly(e.target.checked)} disabled={loading || saving} />} label="Sadece iç gönderenlere yanıtla" />

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, opacity: 0.8 }}>Gelişmiş</Typography>
          <TextField size="small" label="Hariç Tutulan Domainler (virgül ile)" value={excludeDomainsText} onChange={(e)=> setExcludeDomainsText(e.target.value)} placeholder="example.com, test.org" sx={{ maxWidth: 720 }} disabled={loading || saving} />
          <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
            <TextField size="small" type="number" label="Minimum Aralık (saat)" value={minIntervalHours} onChange={(e)=> setMinIntervalHours(e.target.value)} sx={{ maxWidth: 220 }} disabled={loading || saving} />
            <FormControl size="small" sx={{ minWidth: 220 }} disabled={loading || saving}>
              <InputLabel id="reply-scope-label">Kapsam</InputLabel>
              <Select labelId="reply-scope-label" value={replyScope} label="Kapsam" onChange={(e)=> setReplyScope(e.target.value)}>
                <MenuItem value="perSender">Gönderen Bazlı</MenuItem>
                <MenuItem value="perThread">Konuşma Bazlı</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 260 }} disabled={loading || saving}>
              <InputLabel id="signature-id-label">İmza</InputLabel>
              <Select labelId="signature-id-label" value={signatureId} label="İmza" onChange={(e)=> setSignatureId(e.target.value)} displayEmpty>
                <MenuItem value="">(İmza yok)</MenuItem>
                {signatures?.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name || `İmza #${s.id}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <FormControlLabel control={<Switch checked={includeOriginal} onChange={(e)=> setIncludeOriginal(e.target.checked)} disabled={loading || saving} />} label="Orijinal mesajı ekle" />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={onSave} disabled={loading || saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
          </Stack>
          {info && <Alert severity="success" onClose={()=> setInfo('')}>{info}</Alert>}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Otomatik Yanıt Logları</Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems={{ sm:'center' }}>
            <TextField size="small" label="Gönderen filtresi" value={logsSender} onChange={(e)=> setLogsSender(e.target.value)} sx={{ maxWidth: 320 }} />
            <Button variant="outlined" onClick={()=> loadLogs({ reset: true })} disabled={logsLoading}>Filtrele</Button>
          </Stack>
          <List dense>
            {logs.map((it) => (
              <ListItem key={it.id || `${it.sender || 'x'}_${it.sentAt || it.createdAt || Math.random()}`}
                disablePadding secondaryAction={null}>
                <ListItemText
                  primary={`${it.sender || it.from || it.fromEmail || 'Bilinmeyen Gönderen'} → ${it.to || it.toEmail || ''}`.trim()}
                  secondary={`${it.sentAt || it.createdAt || ''} ${it.subject ? '• ' + it.subject : ''}`}
                />
              </ListItem>
            ))}
            {(!logs || logs.length === 0) && (
              <ListItem><ListItemText primary="Kayıt bulunamadı" /></ListItem>
            )}
          </List>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={()=> loadLogs()} disabled={logsLoading || !nextCursor}>{nextCursor ? 'Daha Fazla' : 'Sonuç Bitti'}</Button>
          </Stack>
        </Stack>
      </Paper>
    </ContentContainer>
  );
}
