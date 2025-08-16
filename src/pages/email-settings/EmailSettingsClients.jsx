import React from 'react';
import { Box, Paper, Stack, Typography, Divider, Button, Breadcrumbs, Link } from '@mui/material';
import ContentContainer from '../../components/layout/ContentContainer';
import { useQuery } from '@tanstack/react-query';
import { listAccounts, imapSyncNow, deleteAccount } from '../../api/email';

export default function EmailSettingsClients(){
  const { data, isLoading } = useQuery({ queryKey:['email-accounts'], queryFn: ()=> listAccounts() });
  const accounts = data?.items || [];

  const onAdd = async () => {
    // Bu minimalist sayfada yeni hesap ekleme, eski sayfaya yönlendirilerek yapılır
    window.location.assign('/settings/email/legacy');
  };

  return (
    <ContentContainer>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 12 }}>
          <Link underline="hover" color="inherit" href="/settings">Ayarlar</Link>
          <Link underline="hover" color="inherit" href="/settings/email">E-Posta</Link>
          <Typography color="text.primary" sx={{ fontSize: 12 }}>Hesaplar</Typography>
        </Breadcrumbs>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>E-posta Hesapları</Typography>
      </Stack>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Bağlı Hesaplar</Typography>
          <Button size="small" variant="contained" onClick={onAdd}>Hesap Ekle</Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {isLoading ? (
          <Typography>Yükleniyor…</Typography>
        ) : accounts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Hesap yok.</Typography>
        ) : (
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap: 1 }}>
            {accounts.map(acc => (
              <React.Fragment key={acc.id}>
                <Box>
                  <Typography sx={{ fontWeight:600 }}>{acc.name || acc.emailAddress}</Typography>
                  <Typography variant="caption" color="text.secondary">{acc.provider || 'IMAP/SMTP'} • {acc.status || 'idle'}</Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={async ()=> { await imapSyncNow(); alert('IMAP senkron başlatıldı'); }}>IMAP Senkron</Button>
                <Button size="small" color="error" variant="outlined" onClick={async ()=> { if(confirm('Hesabı silmek istiyor musunuz?')) { try { await deleteAccount(acc.id); window.location.reload(); } catch(e){ alert(e.message||'Silme başarısız'); } } }}>Sil</Button>
                <Button size="small" variant="outlined" onClick={()=> window.location.assign('/settings/email/legacy')}>Gelişmiş</Button>
              </React.Fragment>
            ))}
          </Box>
        )}
      </Paper>
    </ContentContainer>
  );
}
