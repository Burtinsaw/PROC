import React, { useEffect, useState } from 'react';
import { Box, Divider, Stack, Typography, Switch, Card, CardContent, CardHeader, Grid, Alert } from '@mui/material';
import { useFeatures } from '../../contexts/FeatureContext';
import api from '../../utils/axios';

// Türkçe etiketler ve kısa açıklamalar (statik)
const LABELS = {
  modules: {
    procurement: { title: 'Satınalma', desc: 'Talep, RFQ, sipariş süreçleri' },
    logistics: { title: 'Lojistik', desc: 'Sevkiyat ve teslimat takibi' },
    finance: { title: 'Finans', desc: 'Fatura, cari, entegrasyonlar' },
    reporting: { title: 'Raporlama', desc: 'Özet ve detay raporlar' },
    email: { title: 'E‑posta', desc: 'E‑posta gelen/kutusu ve otomasyon' },
  },
  features: {
    approvals: { title: 'Onay Akışları', desc: 'Çok adımlı onay süreçleri' },
    grn: { title: 'Mal Kabul (GRN)', desc: 'Giriş teyidi ve kalite kontrol' },
    threeWayMatch: { title: '3‑Yönlü Mutabakat', desc: 'PO‑GRN‑Fatura eşleştirme' },
    priceLists: { title: 'Fiyat Listeleri', desc: 'Tedarikçi fiyat yönetimi' },
    contracts: { title: 'Sözleşmeler', desc: 'Tedarik sözleşmeleri' },
    budgets: { title: 'Bütçeler', desc: 'Bütçe planlama ve izleme' },
    landedCost: { title: 'Maliyet Dağıtımı', desc: 'Navlun, gümrük gibi masraflar' },
    multiCurrency: { title: 'Çoklu Para Birimi', desc: 'Kur, para birimi desteği' },
    taxRules: { title: 'Vergi Kuralları', desc: 'KDV ve vergi kuralları' },
    parasut: { title: 'Paraşüt Entegrasyonu', desc: 'E‑fatura/e‑arşiv senkronu' },
  }
};

export default function AdminModules(){
  const featureState = useFeatures();
  const { loading, modules: initialModules, features: initialFeatures, issues: initialIssues } = featureState;
  const [modules, setModules] = useState(initialModules || {});
  const [features, setFeatures] = useState(initialFeatures || {});
  const [issues, setIssues] = useState(initialIssues || {});
  const [saving, setSaving] = useState(false);
  // Context güncellemelerini local state'e senkronla (sayfa yenilemeden)
  useEffect(() => {
    setModules(initialModules || {});
    setFeatures(initialFeatures || {});
    setIssues(initialIssues || {});
  }, [initialModules, initialFeatures, initialIssues]);
  if (loading) return <Typography variant="body2">Yükleniyor…</Typography>;
  const handleToggle = async (kind, key, enabled) => {
    try {
      setSaving(true);
      const { data } = (kind === 'module')
        ? await api.put(`/features/modules/${key}`, { enabled })
        : await api.put(`/features/features/${key}`, { enabled });
      // reload yerine lokal state güncelle
      setModules(data.modules || {});
      setFeatures(data.features || {});
      setIssues(data.issues || {});
  } catch {
      // axios interceptor toasts already
    } finally { setSaving(false); }
  };
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Modüller</Typography>
      <Grid container spacing={2}>
        {Object.entries(modules || {}).map(([k,v]) => {
          const meta = LABELS.modules[k] || { title: k, desc: '' };
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={k}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardHeader
                  titleTypographyProps={{ variant:'subtitle1', fontWeight:700 }}
                  title={meta.title}
                  action={<Switch checked={!!v} disabled={saving} onChange={(e)=> handleToggle('module', k, e.target.checked)} />}
                />
                <CardContent sx={{ pt: 0, color:'text.secondary' }}>
                  <Typography variant="body2">{meta.desc}</Typography>
                  <Typography variant="caption" sx={{ opacity:.7 }}>Durum: {v ? 'Açık' : 'Kapalı'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Divider sx={{ my:2 }} />
      <Typography variant="h6" gutterBottom>Özellikler</Typography>
      <Grid container spacing={2}>
        {Object.entries(features || {}).map(([k,v]) => {
          const meta = LABELS.features[k] || { title: k, desc: '' };
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={k}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardHeader
                  titleTypographyProps={{ variant:'subtitle1', fontWeight:700 }}
                  title={meta.title}
                  action={<Switch checked={!!v} disabled={saving} onChange={(e)=> handleToggle('feature', k, e.target.checked)} />}
                />
                <CardContent sx={{ pt: 0, color:'text.secondary' }}>
                  <Typography variant="body2">{meta.desc}</Typography>
                  <Typography variant="caption" sx={{ opacity:.7 }}>Durum: {v ? 'Açık' : 'Kapalı'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      {!!issues && Object.keys(issues).length>0 && (
        <>
          <Divider sx={{ my:2 }} />
          <Typography variant="h6" color="warning.main">Bağımlılık Uyarıları</Typography>
          <Stack gap={1}>
            {Object.entries(issues).map(([feat, list]) => (
              <Alert key={feat} severity="warning" variant="outlined">
                {LABELS.features[feat]?.title || feat}: eksik → {list.join(', ')}
              </Alert>
            ))}
          </Stack>
        </>
      )}
      <Divider sx={{ my:2 }} />
      <Typography variant="caption" color="text.secondary">
        Değişiklikler kalıcıdır ve anında API’ye yansır. Yetki: admin.
      </Typography>
    </Box>
  );
}
