import React from 'react';
import { Box, Paper, Stack, Typography, Divider, Button, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ContentContainer from '../../components/layout/ContentContainer';

function HubCard({ title, desc, to }){
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{desc}</Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box>
          <Button size="small" variant="contained" component={RouterLink} to={to}>Aç</Button>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function EmailSettingsHub(){
  return (
    <ContentContainer>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 12 }}>
          <Link underline="hover" color="inherit" component={RouterLink} to="/settings">Ayarlar</Link>
          <Typography color="text.primary" sx={{ fontSize: 12 }}>E-Posta</Typography>
        </Breadcrumbs>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>E-Posta Ayarları</Typography>
      </Stack>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Kısayollar</Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display:'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <Box>
            <HubCard title="Kişisel Bilgi ve İmzalar" desc="Varsayılan imza, imza yönetimi ve kişisel tercihleri yönetin." to="/settings/email/personal" />
          </Box>
          <Box>
            <HubCard title="Kurallar" desc="Gelen/giden e-postalara otomatik işlemler uygulayın." to="/settings/email/rules" />
          </Box>
          <Box>
            <HubCard title="Kişi İçe Aktarma" desc="CSV ile adres defterini içe aktarın." to="/settings/email/importer" />
          </Box>
          <Box>
            <HubCard title="E-posta Hesapları" desc="Bağlı hesapları görüntüleyin, yenileyin veya kaldırın." to="/settings/email/clients" />
          </Box>
          <Box>
            <HubCard title="Otomatik Yanıt" desc="Tatildeyim/otomatik cevap (yakında)" to="/settings/email/auto-reply" />
          </Box>
          <Box>
            <HubCard title="Şablonlar" desc="E-posta şablonlarını yönetin." to="/settings/email/templates" />
          </Box>
          <Box>
            <HubCard title="(Eski) Tüm Ayarlar" desc="Geçici olarak eski sayfayı açın." to="/settings/email/legacy" />
          </Box>
        </Box>
      </Paper>
    </ContentContainer>
  );
}
