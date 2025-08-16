import React, { useState } from 'react';
import { Box, Paper, Stack, Typography, Divider, TextField, Switch, FormControlLabel, Button, MenuItem } from '@mui/material';
import ContentContainer from '../../components/layout/ContentContainer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listRules, createRule, deleteRule, applyRule, updateRule, listAccounts } from '../../api/email';

export default function EmailSettingsRules(){
  const qc = useQueryClient();
  const { data: rulesData, isLoading: rulesLoading } = useQuery({ queryKey:['email-rules'], queryFn: ()=> listRules() });
  const rules = rulesData?.items || [];
  const { data: accData } = useQuery({ queryKey:['email-accounts'], queryFn: ()=> listAccounts() });
  const accounts = accData?.items || [];
  const [ruleDraft, setRuleDraft] = useState({ name:'Yeni Kural', enabled:true, matchType:'ALL', accountId:null, conditions:[], actions:[] });
  const [ruleBusy, setRuleBusy] = useState(false);
  const resetDraft = () => { setRuleDraft({ name:'Yeni Kural', enabled:true, matchType:'ALL', accountId:null, conditions:[], actions:[] }); };

  const addCondition = () => setRuleDraft(d => ({ ...d, conditions: [...(d.conditions||[]), { field:'subject', operator:'contains', value:'' }] }));
  const removeCondition = (idx) => setRuleDraft(d => ({ ...d, conditions: (d.conditions||[]).filter((_,i)=> i!==idx) }));
  const addAction = () => setRuleDraft(d => ({ ...d, actions: [...(d.actions||[]), { type:'move', folder:'ARCHIVE' }] }));
  const removeAction = (idx) => setRuleDraft(d => ({ ...d, actions: (d.actions||[]).filter((_,i)=> i!==idx) }));

  const saveRule = async () => {
    setRuleBusy(true);
    try{
      await createRule(ruleDraft);
      resetDraft();
      qc.invalidateQueries({ queryKey:['email-rules'] });
    } finally { setRuleBusy(false); }
  };
  const removeRule = async (id) => { await deleteRule(id); qc.invalidateQueries({ queryKey:['email-rules'] }); };
  const runRule = async (id) => { setRuleBusy(true); try { const r = await applyRule(id, 1000); alert(`Uygulandı: ${r.applied || 0} mesaj`); } finally { setRuleBusy(false); } };

  return (
    <ContentContainer>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Kurallar</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Yeni Kural</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1.5}>
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
            <Button size="small" variant="contained" onClick={saveRule} disabled={ruleBusy}>Kuralı Kaydet</Button>
            <Button size="small" variant="text" onClick={resetDraft} disabled={ruleBusy}>Temizle</Button>
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
                <Button size="small" variant="outlined" onClick={()=> setRuleDraft({ name:r.name, enabled:!!r.enabled, matchType:r.matchType||'ALL', accountId:r.accountId??null, conditions:r.conditions||[], actions:r.actions||[] })}>Düzenle</Button>
                <Button size="small" variant="outlined" onClick={()=> setRuleDraft({ ...r, name: r.name + ' (Kopya)', })}>Kopyala</Button>
                <Button size="small" variant="outlined" onClick={()=> runRule(r.id)} disabled={ruleBusy}>Uygula</Button>
                <Button size="small" color="error" variant="outlined" onClick={()=> removeRule(r.id)} disabled={ruleBusy}>Sil</Button>
              </React.Fragment>
            ))}
          </Box>
        )}
      </Paper>
    </ContentContainer>
  );
}
