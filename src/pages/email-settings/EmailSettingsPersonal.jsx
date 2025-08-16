import React, { useState } from 'react';
import { Box, Paper, Stack, Typography, Divider, TextField, Switch, FormControlLabel, Button, MenuItem } from '@mui/material';
import ContentContainer from '../../components/layout/ContentContainer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listAccounts, listSignatures, createSignature, updateSignature, deleteSignature, uploadSignatureFile } from '../../api/email';

export default function EmailSettingsPersonal(){
  const qc = useQueryClient();
  const { data: accData } = useQuery({ queryKey:['email-accounts'], queryFn: ()=> listAccounts() });
  const accounts = accData?.items || [];
  const { data: sigData, isLoading: sigLoading } = useQuery({ queryKey:['email-signatures'], queryFn: ()=> listSignatures() });
  const signatures = sigData?.items || [];
  const [sigDraft, setSigDraft] = useState({ name:'Varsayılan İmza', html:'', accountId:null, isDefault:true });
  const [autoSig, setAutoSig] = useState(() => { try { return localStorage.getItem('email.autoIncludeSignature') !== '0'; } catch { return true; } });
  const toggleAutoSig = (val) => { setAutoSig(val); try { localStorage.setItem('email.autoIncludeSignature', val ? '1' : '0'); } catch { /* ignore */ } };

  return (
    <ContentContainer>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Kişisel Bilgi ve İmzalar</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>İmza Yönetimi</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1.5}>
          <FormControlLabel control={<Switch checked={!!autoSig} onChange={(e)=> toggleAutoSig(e.target.checked)} />} label="Yeni e-postada varsayılan imzayı otomatik ekle" />
          <Stack direction="row" spacing={1}>
            <TextField size="small" label="İmza Adı" value={sigDraft.name} onChange={(e)=> setSigDraft({ ...sigDraft, name:e.target.value })} sx={{ width: 240 }} />
            <TextField size="small" select label="Hesap" value={sigDraft.accountId ?? ''} onChange={(e)=> setSigDraft({ ...sigDraft, accountId: e.target.value ? Number(e.target.value) : null })} sx={{ width: 220 }}>
              <MenuItem value="">Tümü (genel)</MenuItem>
              {accounts.map(a=> <MenuItem key={a.id} value={a.id}>{a.name || a.emailAddress}</MenuItem>)}
            </TextField>
            <FormControlLabel control={<Switch checked={!!sigDraft.isDefault} onChange={(e)=> setSigDraft({ ...sigDraft, isDefault: e.target.checked })} />} label="Varsayılan" />
          </Stack>
          <TextField size="small" label="İmza HTML" value={sigDraft.html} onChange={(e)=> setSigDraft({ ...sigDraft, html:e.target.value })} placeholder="<p>Saygılarımla...</p>" multiline minRows={4} />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button size="small" variant="contained" onClick={async ()=>{ const r = await createSignature(sigDraft); if(r?.success){ setSigDraft({ name:'Varsayılan İmza', html:'', accountId:null, isDefault:false }); qc.invalidateQueries({ queryKey:['email-signatures'] }); } }}>İmza Kaydet</Button>
            <Button size="small" component="label" variant="outlined">Dosyadan Yükle
              <input hidden type="file" accept=".html,.htm,.txt" onChange={async (e)=>{ const f=e.target.files?.[0]; if(!f) return; const r = await uploadSignatureFile(f); if(r?.html) setSigDraft(d=>({ ...d, html: r.html })); }} />
            </Button>
          </Stack>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {sigLoading ? (
          <Typography>İmzalar yükleniyor…</Typography>
        ) : signatures.length===0 ? (
          <Typography variant="body2" color="text.secondary">Henüz imza yok.</Typography>
        ) : (
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:1 }}>
            {signatures.map(s => (
              <React.Fragment key={s.id}>
                <Box>
                  <Typography sx={{ fontWeight:600 }}>{s.name} {s.isDefault ? '• Varsayılan' : ''}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.accountId ? `Hesap #${s.accountId}` : 'Genel'}</Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={()=> setSigDraft({ name: s.name, html: s.html, accountId: s.accountId ?? null, isDefault: !!s.isDefault })}>Düzenle</Button>
                <Button size="small" variant="outlined" onClick={async ()=>{ await updateSignature(s.id, { isDefault: true }); qc.invalidateQueries({ queryKey:['email-signatures'] }); }}>Varsayılan Yap</Button>
                <Button size="small" color="error" variant="outlined" onClick={async ()=>{ await deleteSignature(s.id); qc.invalidateQueries({ queryKey:['email-signatures'] }); }}>Sil</Button>
              </React.Fragment>
            ))}
          </Box>
        )}
      </Paper>
    </ContentContainer>
  );
}
