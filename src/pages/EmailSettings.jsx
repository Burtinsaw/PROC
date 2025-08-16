import React, { useState } from 'react';
import { Box, Paper, Stack, Typography, Divider, TextField, Switch, FormControlLabel, Button, Alert, MenuItem, Breadcrumbs, Link } from '@mui/material';
import ContentContainer from '../components/layout/ContentContainer';
import axios from '../utils/axios';

export default function EmailSettings(){
  const [smtp, setSmtp] = useState({ host:'', port:465, secure:true, user:'', pass:'', from:'' });
  const [imap, setImap] = useState({ host:'', port:993, secure:true, username:'', password:'' });
  const [outResult, setOutResult] = useState(null);
  const [inResult, setInResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: 'Kişisel Hesap', emailAddress: '', companyCode: '', color: '#2563eb', isShared: false,
    protocol: 'IMAP'
  });
  // Legacy sadeleştirildi: kurallar/imdza/rehber ayrı sayfalara taşındı.

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
  // Kurallar ve imza işlemleri legacy'den çıkarıldı.

  return (
    <ContentContainer>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 12 }}>
          <Link underline="hover" color="inherit" href="/settings">Ayarlar</Link>
          <Link underline="hover" color="inherit" href="/settings/email">E-Posta</Link>
          <Typography color="text.primary" sx={{ fontSize: 12 }}>(Eski) Tüm Ayarlar</Typography>
        </Breadcrumbs>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>E-Posta Ayarları (Legacy)</Typography>
      </Stack>
      <Stack spacing={2}>
        {/* Kısayollar: Yeni modüler sayfalara yönlendirme */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Kısayollar</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display:'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <Box sx={{ p:1, border:'1px solid', borderColor:'divider', borderRadius:1 }}>
              <Typography sx={{ fontWeight:600 }}>Kişisel & İmzalar</Typography>
              <Typography variant="body2" color="text.secondary">İmza ekleme/düzenleme, varsayılan imza.</Typography>
              <Button size="small" sx={{ mt: 1 }} variant="outlined" href="/settings/email/personal">Aç</Button>
            </Box>
            <Box sx={{ p:1, border:'1px solid', borderColor:'divider', borderRadius:1 }}>
              <Typography sx={{ fontWeight:600 }}>Kurallar</Typography>
              <Typography variant="body2" color="text.secondary">Gelen/giden e‑postalar için otomasyon.</Typography>
              <Button size="small" sx={{ mt: 1 }} variant="outlined" href="/settings/email/rules">Aç</Button>
            </Box>
            <Box sx={{ p:1, border:'1px solid', borderColor:'divider', borderRadius:1 }}>
              <Typography sx={{ fontWeight:600 }}>Kişi İçe Aktarma</Typography>
              <Typography variant="body2" color="text.secondary">CSV ile adres defterini içe aktarın.</Typography>
              <Button size="small" sx={{ mt: 1 }} variant="outlined" href="/settings/email/importer">Aç</Button>
            </Box>
            <Box sx={{ p:1, border:'1px solid', borderColor:'divider', borderRadius:1 }}>
              <Typography sx={{ fontWeight:600 }}>Hesaplar</Typography>
              <Typography variant="body2" color="text.secondary">Bağlı hesaplar ve gelişmiş işlemler.</Typography>
              <Button size="small" sx={{ mt: 1 }} variant="outlined" href="/settings/email/clients">Aç</Button>
            </Box>
          </Box>
        </Paper>
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

  {/* İmza yönetimi ve adres defteri gibi bölümler yeni sayfalara taşındı (yukarıdaki kısayolları kullanın). */}

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
      </Stack>
    </ContentContainer>
  );
}
