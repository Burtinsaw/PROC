import React, { useState } from 'react';
import { Box, Paper, Stack, Typography, Divider, TextField, Switch, FormControlLabel, Button, Alert, MenuItem } from '@mui/material';
import ContentContainer from '../components/layout/ContentContainer';
import axios from '../utils/axios';
import { createAccount, listAccounts, deleteAccount, listRules, createRule, deleteRule, applyRule, updateRule } from '../api/email';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function EmailSettings(){
  const [smtp, setSmtp] = useState({ host:'', port:465, secure:true, user:'', pass:'', from:'' });
  const [imap, setImap] = useState({ host:'', port:993, secure:true, username:'', password:'' });
  const [outResult, setOutResult] = useState(null);
  const [inResult, setInResult] = useState(null);
  const [fullResult, setFullResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: 'Kişisel Hesap', emailAddress: '', companyCode: '', color: '#2563eb', isShared: false,
    protocol: 'IMAP'
  });
  const [addResult, setAddResult] = useState(null);
  const qc = useQueryClient();
  const { data: accData, isLoading: accLoading } = useQuery({ queryKey:['email-accounts'], queryFn: ()=> listAccounts() });
  const accounts = accData?.items || [];
  const { data: rulesData, isLoading: rulesLoading } = useQuery({ queryKey:['email-rules'], queryFn: ()=> listRules() });
  const rules = rulesData?.items || [];
  const [ruleDraft, setRuleDraft] = useState({ name:'Yeni Kural', enabled:true, matchType:'ALL', accountId:null, conditions:[], actions:[] });
  const [ruleBusy, setRuleBusy] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);

  const testOutgoing = async () => {
    setBusy(true); setOutResult(null);
    try{
      const { data } = await axios.post('/email/accounts/test-outgoing', { smtpHost: smtp.host, smtpPort: smtp.port, smtpSecure: smtp.secure, smtpUser: smtp.user, smtpPass: smtp.pass, fromAddress: smtp.from, sendSelfTest: true });
      setOutResult({ ok: data.success, data });
    }catch(e){ setOutResult({ ok:false, error: e.response?.data?.error || e.message }); }
    finally{ setBusy(false); }
  };
  const testIncoming = async () => {
    setBusy(true); setInResult(null);
    try{
      const { data } = await axios.post('/email/accounts/test-incoming', { host: imap.host, port: imap.port, secure: imap.secure, username: imap.username, password: imap.password });
      setInResult({ ok: data.success, data });
    }catch(e){ setInResult({ ok:false, error: e.response?.data?.error || e.message }); }
    finally{ setBusy(false); }
  };
  const fullTest = async () => {
    setBusy(true); setFullResult(null);
    try{
      const { data } = await axios.post('/email/accounts/full-test', { smtpHost: smtp.host, smtpPort: smtp.port, smtpSecure: smtp.secure, smtpUser: smtp.user, smtpPass: smtp.pass, fromAddress: smtp.from, host: imap.host, port: imap.port, secure: imap.secure, username: imap.username, password: imap.password });
      setFullResult({ ok: data.success && data.delivered, data });
    }catch(e){ setFullResult({ ok:false, error: e.response?.data?.error || e.message }); }
    finally{ setBusy(false); }
  };

  const addAccount = async () => {
    setBusy(true); setAddResult(null);
    try{
      // Önce incoming/outgoing testlerini dene (IMAP zorunlu; POP desteği henüz sağlanmıyor)
      const imapOk = await axios.post('/email/accounts/test-incoming', { host: imap.host, port: imap.port, secure: imap.secure, username: imap.username, password: imap.password }).then(r=>r.data.success).catch(()=>false);
      const smtpOk = await axios.post('/email/accounts/test-outgoing', { smtpHost: smtp.host, smtpPort: smtp.port, smtpSecure: smtp.secure, smtpUser: smtp.user, smtpPass: smtp.pass, fromAddress: smtp.from }).then(r=>r.data.success).catch(()=>false);
      if (!imapOk || !smtpOk) {
        const parts = [];
        if (!imapOk) parts.push('IMAP');
        if (!smtpOk) parts.push('SMTP');
        setAddResult({ ok:false, error: `Doğrulama başarısız: ${parts.join(', ')}` });
        return;
      }
      const payload = {
        name: accountForm.name,
        provider: 'custom',
        protocol: accountForm.protocol || 'IMAP',
        host: imap.host,
        port: imap.port,
        secure: imap.secure,
        username: imap.username,
        password: imap.password,
        emailAddress: accountForm.emailAddress || imap.username,
        companyCode: accountForm.companyCode || null,
        color: accountForm.color || '#2563eb',
        isShared: !!accountForm.isShared,
        active: true
      };
      const res = await createAccount(payload);
      setAddResult({ ok: res?.success, data: res?.item });
    }catch(e){ setAddResult({ ok:false, error: e.response?.data?.message || e.message }); }
    finally{ setBusy(false); }
  };

  const removeAccount = async (id) => {
    try{
      await deleteAccount(id);
      qc.invalidateQueries({ queryKey:['email-accounts'] });
    }catch{/* noop */}
  };

  const addCondition = () => setRuleDraft(d => ({ ...d, conditions: [...(d.conditions||[]), { field:'subject', operator:'contains', value:'' }] }));
  const removeCondition = (idx) => setRuleDraft(d => ({ ...d, conditions: (d.conditions||[]).filter((_,i)=> i!==idx) }));
  const addAction = () => setRuleDraft(d => ({ ...d, actions: [...(d.actions||[]), { type:'move', folder:'ARCHIVE' }] }));
  const removeAction = (idx) => setRuleDraft(d => ({ ...d, actions: (d.actions||[]).filter((_,i)=> i!==idx) }));
  const resetDraft = () => { setRuleDraft({ name:'Yeni Kural', enabled:true, matchType:'ALL', accountId:null, conditions:[], actions:[] }); setEditingRuleId(null); };
  const saveRule = async () => {
    setRuleBusy(true);
    try{
      if (editingRuleId) {
        await updateRule(editingRuleId, ruleDraft);
      } else {
        await createRule(ruleDraft);
      }
      resetDraft();
      qc.invalidateQueries({ queryKey:['email-rules'] });
    } finally { setRuleBusy(false); }
  };
  const removeRule = async (id) => {
    await deleteRule(id); qc.invalidateQueries({ queryKey:['email-rules'] });
  };
  const runRule = async (id) => {
    setRuleBusy(true);
    try {
      const r = await applyRule(id, 1000);
      alert(`Uygulandı: ${r.applied} mesaj`);
    } finally { setRuleBusy(false); }
  };
  const editRule = (r) => {
    // Güvenli kopya ile formu doldur
    const copy = {
      name: r.name,
      enabled: !!r.enabled,
      matchType: r.matchType || 'ALL',
      accountId: r.accountId ?? null,
      conditions: Array.isArray(r.conditions) ? r.conditions.map(c => ({ ...c })) : [],
      actions: Array.isArray(r.actions) ? r.actions.map(a => ({ ...a })) : []
    };
    setRuleDraft(copy);
    setEditingRuleId(r.id);
  };
  const duplicateRule = async (r) => {
    setRuleBusy(true);
    try{
      const payload = {
        name: `${r.name} (Kopya)`,
        enabled: !!r.enabled,
        matchType: r.matchType || 'ALL',
        accountId: r.accountId ?? null,
        conditions: r.conditions || [],
        actions: r.actions || []
      };
      await createRule(payload);
      qc.invalidateQueries({ queryKey:['email-rules'] });
    } finally { setRuleBusy(false); }
  };

  return (
    <ContentContainer>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>E-Posta Ayarları</Typography>
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Hesap Bilgileri</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <TextField size="small" label="Hesap Adı" value={accountForm.name} onChange={(e)=> setAccountForm({ ...accountForm, name:e.target.value })} />
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="E-posta adresi" value={accountForm.emailAddress} onChange={(e)=> setAccountForm({ ...accountForm, emailAddress:e.target.value })} sx={{ flex: 1 }} />
              <TextField size="small" select label="Protokol" value={accountForm.protocol} onChange={(e)=> setAccountForm({ ...accountForm, protocol:e.target.value })} sx={{ width: 160 }}>
                <MenuItem value="IMAP">IMAP</MenuItem>
                <MenuItem value="POP" disabled>POP (yakında)</MenuItem>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField size="small" select label="Şirket" value={accountForm.companyCode} onChange={(e)=> setAccountForm({ ...accountForm, companyCode:e.target.value })} sx={{ width: 180 }}>
                <MenuItem value=""></MenuItem>
                {['BN','YN','AL','TG','OT','NZ'].map(c=> <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField size="small" type="color" label="Renk" value={accountForm.color} onChange={(e)=> setAccountForm({ ...accountForm, color:e.target.value })} sx={{ width: 120 }} />
              <FormControlLabel control={<Switch checked={accountForm.isShared} onChange={(e)=> setAccountForm({ ...accountForm, isShared:e.target.checked })} />} label="Paylaşımlı" />
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>SMTP (Giden)</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <TextField size="small" label="Host" value={smtp.host} onChange={(e)=> setSmtp({ ...smtp, host:e.target.value })} />
            <Stack direction="row" spacing={1}>
              <TextField size="small" type="number" label="Port" value={smtp.port} onChange={(e)=> setSmtp({ ...smtp, port: parseInt(e.target.value,10)||465 })} sx={{ width: 140 }} />
              <FormControlLabel control={<Switch checked={smtp.secure} onChange={(e)=> setSmtp({ ...smtp, secure: e.target.checked })} />} label="Secure" />
            </Stack>
            <TextField size="small" label="Kullanıcı" value={smtp.user} onChange={(e)=> setSmtp({ ...smtp, user:e.target.value })} />
            <TextField size="small" label="Parola/Uyg. Şifresi" type="password" value={smtp.pass} onChange={(e)=> setSmtp({ ...smtp, pass:e.target.value })} />
            <TextField size="small" label="Gönderen (from)" value={smtp.from} onChange={(e)=> setSmtp({ ...smtp, from:e.target.value })} />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" disabled={busy} onClick={testOutgoing}>Giden Postayı Test Et</Button>
            </Stack>
            {outResult && (outResult.ok ? (
              <Alert severity="success">SMTP OK {outResult.data?.messageId ? ` (messageId: ${outResult.data.messageId})` : ''}</Alert>
            ) : (
              <Alert severity="error">SMTP Hata: {outResult.error}</Alert>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>IMAP (Gelen)</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <TextField size="small" label="Host" value={imap.host} onChange={(e)=> setImap({ ...imap, host:e.target.value })} />
            <Stack direction="row" spacing={1}>
              <TextField size="small" type="number" label="Port" value={imap.port} onChange={(e)=> setImap({ ...imap, port: parseInt(e.target.value,10)||993 })} sx={{ width: 140 }} />
              <FormControlLabel control={<Switch checked={imap.secure} onChange={(e)=> setImap({ ...imap, secure: e.target.checked })} />} label="Secure" />
            </Stack>
            <TextField size="small" label="Kullanıcı adı" value={imap.username} onChange={(e)=> setImap({ ...imap, username:e.target.value })} />
            <TextField size="small" type="password" label="Parola/Uyg. Şifresi" value={imap.password} onChange={(e)=> setImap({ ...imap, password:e.target.value })} />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" disabled={busy} onClick={testIncoming}>Gelen Postayı Test Et</Button>
            </Stack>
            {inResult && (inResult.ok ? (
              <Alert severity="success">IMAP OK</Alert>
            ) : (
              <Alert severity="error">IMAP Hata: {inResult.error}</Alert>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Uçtan Uca Test</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">SMTP ile kendinize bir e-posta gönderilir, IMAP ile gelen kutusunda varışı kontrol edilir.</Typography>
            <Button variant="outlined" size="small" disabled={busy} onClick={fullTest}>Full Testi Çalıştır</Button>
            {fullResult && (fullResult.ok ? (
              <Alert severity="success">Full Test OK {fullResult.data?.uid ? `(UID: ${fullResult.data.uid})` : ''}</Alert>
            ) : (
              <Alert severity="error">Full Test Hata: {fullResult.error || JSON.stringify(fullResult.data)}</Alert>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Hesabı Doğrula ve Ekle</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">Yukarıdaki SMTP ve IMAP bilgilerini kullanarak hesabı doğrular, ardından sisteme ekler.</Typography>
            <Button variant="contained" size="small" disabled={busy || !imap.host || !imap.username || !imap.password || !smtp.host || !smtp.user || !smtp.pass} onClick={addAccount}>Doğrula ve Ekle</Button>
            {addResult && (addResult.ok ? (
              <Alert severity="success">Hesap eklendi: {addResult.data?.name || addResult.data?.emailAddress}</Alert>
            ) : (
              <Alert severity="error">Ekleme Hata: {addResult.error}</Alert>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Hesaplarım</Typography>
          <Divider sx={{ mb: 2 }} />
          {accLoading ? (
            <Typography>Yükleniyor…</Typography>
          ) : accounts.length===0 ? (
            <Typography variant="body2" color="text.secondary">Kayıtlı hesap yok.</Typography>
          ) : (
            <Box sx={{ display:'grid', gridTemplateColumns:'1fr auto', gap:1 }}>
              {accounts.map(a=> (
                <React.Fragment key={a.id}>
                  <Box>
                    <Typography sx={{ fontWeight:600 }}>{a.name || a.emailAddress}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.emailAddress}</Typography>
                  </Box>
                  <Button size="small" color="error" variant="outlined" onClick={()=> removeAccount(a.id)}>Sil</Button>
                </React.Fragment>
              ))}
            </Box>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>E‑posta Kuralları</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">Koşullara göre yeni gelen veya mevcut mesajlara işlem uygula: klasöre taşı, okundu işaretle, çöp, etiketle, vb. "Mevcut mesajlara uygula" ile geriye dönük çalıştırabilirsiniz.</Typography>
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="Kural Adı" value={ruleDraft.name} onChange={(e)=> setRuleDraft({ ...ruleDraft, name: e.target.value })} sx={{ flex: 1 }} />
              <TextField size="small" select label="Eşleşme" value={ruleDraft.matchType} onChange={(e)=> setRuleDraft({ ...ruleDraft, matchType: e.target.value })} sx={{ width: 160 }}>
                <MenuItem value="ALL">Tüm koşullar</MenuItem>
                <MenuItem value="ANY">Herhangi biri</MenuItem>
              </TextField>
              <TextField size="small" select label="Hesap" value={ruleDraft.accountId ?? ''} onChange={(e)=> setRuleDraft({ ...ruleDraft, accountId: e.target.value ? Number(e.target.value) : null })} sx={{ width: 220 }}>
                <MenuItem value="">Tümü</MenuItem>
                {accounts.map(a=> <MenuItem key={a.id} value={a.id}>{a.name || a.emailAddress}</MenuItem>)}
              </TextField>
              <FormControlLabel control={<Switch checked={!!ruleDraft.enabled} onChange={(e)=> setRuleDraft({ ...ruleDraft, enabled: e.target.checked })} />} label="Aktif" />
            </Stack>
            <Stack spacing={1}>
              <Typography variant="overline">Koşullar</Typography>
              {(ruleDraft.conditions||[]).map((c, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="center">
                  <TextField size="small" select value={c.field} onChange={(e)=> setRuleDraft(d=>{ const arr=[...d.conditions]; arr[idx] = { ...arr[idx], field: e.target.value }; return { ...d, conditions: arr }; })} sx={{ width: 160 }}>
                    <MenuItem value="from">From</MenuItem>
                    <MenuItem value="to">To</MenuItem>
                    <MenuItem value="subject">Subject</MenuItem>
                    <MenuItem value="body">Body</MenuItem>
                    <MenuItem value="companyCode">Şirket</MenuItem>
                    <MenuItem value="folder">Klasör</MenuItem>
                  </TextField>
                  <TextField size="small" select value={c.operator} onChange={(e)=> setRuleDraft(d=>{ const arr=[...d.conditions]; arr[idx] = { ...arr[idx], operator: e.target.value }; return { ...d, conditions: arr }; })} sx={{ width: 160 }}>
                    <MenuItem value="contains">içerir</MenuItem>
                    <MenuItem value="not_contains">içermez</MenuItem>
                    <MenuItem value="equals">eşittir</MenuItem>
                    <MenuItem value="starts_with">ile başlar</MenuItem>
                    <MenuItem value="ends_with">ile biter</MenuItem>
                  </TextField>
                  <TextField size="small" placeholder="değer" value={c.value} onChange={(e)=> setRuleDraft(d=>{ const arr=[...d.conditions]; arr[idx] = { ...arr[idx], value: e.target.value }; return { ...d, conditions: arr }; })} sx={{ flex: 1 }} />
                  <Button size="small" color="error" variant="text" onClick={()=> removeCondition(idx)}>Sil</Button>
                </Stack>
              ))}
              <Button size="small" variant="outlined" onClick={addCondition}>Koşul Ekle</Button>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="overline">Aksiyonlar</Typography>
              {(ruleDraft.actions||[]).map((a, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="center">
                  <TextField size="small" select value={a.type} onChange={(e)=> setRuleDraft(d=>{ const arr=[...d.actions]; arr[idx] = { ...arr[idx], type: e.target.value }; return { ...d, actions: arr }; })} sx={{ width: 180 }}>
                    <MenuItem value="move">Klasöre Taşı</MenuItem>
                    <MenuItem value="mark_read">Okundu İşaretle</MenuItem>
                    <MenuItem value="delete">Çöpe Taşı</MenuItem>
                    <MenuItem value="label_as">Etiketle (Şirket)</MenuItem>
                    <MenuItem value="forward_to">Yönlendir</MenuItem>
                    <MenuItem value="notify_user">Bildirim Gönder</MenuItem>
                  </TextField>
                  {a.type==='move' && (
                    <TextField size="small" select label="Klasör" value={a.folder||'INBOX'} onChange={(e)=> setRuleDraft(d=>{ const arr=[...d.actions]; arr[idx] = { ...arr[idx], folder: e.target.value }; return { ...d, actions: arr }; })} sx={{ width: 160 }}>
                      {['INBOX','STARRED','ARCHIVE','SPAM','TRASH','SENT'].map(f=> <MenuItem key={f} value={f}>{f}</MenuItem>)}
                    </TextField>
                  )}
                  {a.type==='label_as' && (
                    <TextField size="small" select label="Şirket" value={a.label||''} onChange={(e)=> setRuleDraft(d=>{ const arr=[...d.actions]; arr[idx] = { ...arr[idx], label: e.target.value }; return { ...d, actions: arr }; })} sx={{ width: 160 }}>
                      <MenuItem value=""></MenuItem>
                      {['BN','YN','AL','TG','OT','NZ'].map(c=> <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  )}
                  {a.type==='forward_to' && (
                    <TextField size="small" label="E-posta" placeholder="user@example.com" value={a.email||''} onChange={(e)=> setRuleDraft(d=>{ const arr=[...d.actions]; arr[idx] = { ...arr[idx], email: e.target.value }; return { ...d, actions: arr }; })} sx={{ width: 260 }} />
                  )}
                  {a.type==='notify_user' && (
                    <TextField size="small" type="number" label="Kullanıcı ID" placeholder="örn. 2" value={a.userId||''} onChange={(e)=> setRuleDraft(d=>{ const arr=[...d.actions]; arr[idx] = { ...arr[idx], userId: e.target.value }; return { ...d, actions: arr }; })} sx={{ width: 160 }} />
                  )}
                  <Button size="small" color="error" variant="text" onClick={()=> removeAction(idx)}>Sil</Button>
                </Stack>
              ))}
              <Button size="small" variant="outlined" onClick={addAction}>Aksiyon Ekle</Button>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={saveRule} disabled={ruleBusy}>{editingRuleId ? 'Değişiklikleri Kaydet' : 'Kuralı Kaydet'}</Button>
              {editingRuleId && (
                <Button size="small" variant="text" onClick={resetDraft} disabled={ruleBusy}>İptal</Button>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />
          {rulesLoading ? (
            <Typography>Kurallar yükleniyor…</Typography>
          ) : rules.length===0 ? (
            <Typography variant="body2" color="text.secondary">Henüz kural yok.</Typography>
          ) : (
  <Box sx={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:1 }}>
              {rules.map(r => (
                <React.Fragment key={r.id}>
                  <Box>
                    <Typography sx={{ fontWeight:600 }}>{r.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.enabled? 'Açık':'Kapalı'} • {r.matchType}</Typography>
                  </Box>
      <FormControlLabel control={<Switch checked={!!r.enabled} onChange={async (e)=>{ await updateRule(r.id, { enabled: e.target.checked }); qc.invalidateQueries({ queryKey:['email-rules'] }); }} />} label="Aktif" />
          <Button size="small" variant="outlined" onClick={()=> editRule(r)} disabled={ruleBusy}>Düzenle</Button>
          <Button size="small" variant="outlined" onClick={()=> duplicateRule(r)} disabled={ruleBusy}>Kopyala</Button>
                  <Button size="small" variant="outlined" onClick={()=> runRule(r.id)} disabled={ruleBusy}>Mevcut Mesajlara Uygula</Button>
                  <Button size="small" color="error" variant="outlined" onClick={()=> removeRule(r.id)} disabled={ruleBusy}>Sil</Button>
                </React.Fragment>
              ))}
            </Box>
          )}
        </Paper>
      </Stack>
    </ContentContainer>
  );
}
