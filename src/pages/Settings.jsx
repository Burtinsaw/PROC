import React, { useEffect, useState } from 'react';
import { Box, Typography, Switch, FormControlLabel, Paper, Stack, Divider, ToggleButtonGroup, ToggleButton, Select, MenuItem, Button, Slider, Chip, TextField } from '@mui/material';
import ContentContainer from '../components/layout/ContentContainer';
import { useAppTheme } from '../contexts/useAppTheme';
import { useLanguage } from '../contexts/LanguageContext';

export default function Settings() {
  const { mode, toggleTheme, preset, togglePreset, setPreset, density, setDensity, corner, setCorner } = useAppTheme();
  const { lang, setLang } = useLanguage();
  const [animMode, setAnimMode] = useState('always'); // 'hover' | 'always' | 'off'
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showFxWidget, setShowFxWidget] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [dashboardBg, setDashboardBg] = useState(''); // data URL or URL
  const [bgBlur, setBgBlur] = useState(0);
  const [bgDim, setBgDim] = useState(0);
  const [defaultLanding, setDefaultLanding] = useState('/');
  const [applyBgGlobally, setApplyBgGlobally] = useState(false);
  // Posta ayarları
  const COMPANY_COLORS = { BN: '#1f77b4', YN: '#ff7f0e', AL: '#2ca02c', TG: '#d62728', OT: '#9467bd', NZ: '#8c564b' };
  const [mailDefaultCompanies, setMailDefaultCompanies] = useState([]);
  const [mailPreviewPane, setMailPreviewPane] = useState(true);
  const [mailListDensity, setMailListDensity] = useState('comfortable'); // 'comfortable' | 'compact'
  const [mailAutoRefreshSec, setMailAutoRefreshSec] = useState(0);

  useEffect(() => {
    try {
      const m = localStorage.getItem('qaAnimMode');
      if (m === 'off' || m === 'hover' || m === 'always') setAnimMode(m);
      // default other values fall back to enabled
      const sqa = localStorage.getItem('showQuickActions');
      if (sqa === 'false') setShowQuickActions(false);
      const sfx = localStorage.getItem('showFxWidget');
      if (sfx === 'false') setShowFxWidget(false);
      const rm = localStorage.getItem('reduceMotion');
      if (rm === 'true') setReduceMotion(true);
      const bg = localStorage.getItem('dashboardBg');
      if (bg) setDashboardBg(bg);
  const blur = Number(localStorage.getItem('dashboardBgBlur') || '0');
  setBgBlur(isNaN(blur) ? 0 : blur);
  const dim = Number(localStorage.getItem('dashboardBgDim') || '0');
  setBgDim(isNaN(dim) ? 0 : dim);
  const dl = localStorage.getItem('defaultLanding') || '/';
  setDefaultLanding(dl);
  const ag = localStorage.getItem('applyBgGlobally') === 'true';
  setApplyBgGlobally(ag);
    } catch { /* ignore */ }
  }, []);

  const onAnimMode = (_, value) => {
    if (!value) return;
    setAnimMode(value);
    try { localStorage.setItem('qaAnimMode', value); } catch { /* ignore */ }
  };

  const onToggleQuickActions = (e) => {
    const v = e.target.checked;
    setShowQuickActions(v);
    try { localStorage.setItem('showQuickActions', String(v)); } catch { /* ignore */ }
  };
  const onToggleFxWidget = (e) => {
    const v = e.target.checked;
    setShowFxWidget(v);
    try { localStorage.setItem('showFxWidget', String(v)); } catch { /* ignore */ }
  };
  const onToggleReduceMotion = (e) => {
    const v = e.target.checked;
    setReduceMotion(v);
    try { localStorage.setItem('reduceMotion', String(v)); } catch { /* ignore */ }
  };

  const onPresetPick = (_, value) => {
    if (!value) return;
    setPreset(value);
  };

  const onPickBgFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // küçük önizleme için base64 olarak saklıyoruz; alternatif: URL.createObjectURL
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setDashboardBg(dataUrl);
      try { localStorage.setItem('dashboardBg', String(dataUrl)); } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
  };
  const onClearBg = () => {
    setDashboardBg('');
    try { localStorage.removeItem('dashboardBg'); } catch { /* ignore */ }
  };
  const onBgBlur = (_, v) => { setBgBlur(v); try { localStorage.setItem('dashboardBgBlur', String(v)); } catch {/* ignore */} try { window.dispatchEvent(new Event('appConfigUpdated')); } catch { /* ignore */ } };
  const onBgDim = (_, v) => { setBgDim(v); try { localStorage.setItem('dashboardBgDim', String(v)); } catch {/* ignore */} try { window.dispatchEvent(new Event('appConfigUpdated')); } catch { /* ignore */ } };
  const onDefaultLanding = (e) => { const v = e.target.value; setDefaultLanding(v); try { localStorage.setItem('defaultLanding', v); } catch {/* ignore */} };
  const onApplyBgGlobally = (e) => { const v = e.target.checked; setApplyBgGlobally(v); try { localStorage.setItem('applyBgGlobally', String(v)); } catch {/* ignore */} try { window.dispatchEvent(new Event('appConfigUpdated')); } catch { /* ignore */ } };

  // Posta ayarlarını yerelden yükle
  useEffect(() => {
    try {
      const defCompanies = JSON.parse(localStorage.getItem('email.defaultCompanies') || '[]');
      if (Array.isArray(defCompanies)) setMailDefaultCompanies(defCompanies);
      const pv = localStorage.getItem('email.previewPane');
      setMailPreviewPane(pv !== 'false');
      const dens = localStorage.getItem('email.listDensity');
      setMailListDensity(dens === 'compact' ? 'compact' : 'comfortable');
      const ar = parseInt(localStorage.getItem('email.autoRefreshSec') || '0', 10);
      setMailAutoRefreshSec(Number.isFinite(ar) ? ar : 0);
    } catch { /* ignore */ }
  }, []);

  const onToggleCompany = (code) => {
    setMailDefaultCompanies(prev => {
      const next = prev.includes(code) ? prev.filter(x=>x!==code) : [...prev, code];
      try { localStorage.setItem('email.defaultCompanies', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  const onMailPreview = (e) => {
    const v = e.target.checked;
    setMailPreviewPane(v);
    try { localStorage.setItem('email.previewPane', String(v)); } catch { /* ignore */ }
  };
  const onMailDensity = (_, v) => {
    if (!v) return;
    setMailListDensity(v);
    try { localStorage.setItem('email.listDensity', v); } catch { /* ignore */ }
  };
  const onMailAutoRefresh = (e) => {
    const v = Math.max(0, parseInt(e.target.value || '0', 10) || 0);
    setMailAutoRefreshSec(v);
    try { localStorage.setItem('email.autoRefreshSec', String(v)); } catch { /* ignore */ }
  };

  return (
    <ContentContainer>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Ayarlar</Typography>
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Görünüm</Typography>
            <Button size="small" variant="text" onClick={()=> window.location.assign('/settings/theme-preview')}>Tema önizleme</Button>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <FormControlLabel
              control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
              label={`Tema modu: ${mode === 'dark' ? 'Koyu' : 'Açık'}`}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap:'wrap' }}>
              <Typography variant="body2" sx={{ minWidth: 110 }}>Tasarım stili</Typography>
              <ToggleButtonGroup size="small" exclusive value={preset} onChange={onPresetPick}>
                <ToggleButton value="classic">Classic</ToggleButton>
                <ToggleButton value="neo">Neo</ToggleButton>
                <ToggleButton value="aurora">Aurora</ToggleButton>
                <ToggleButton value="minimal">Minimal</ToggleButton>
                <ToggleButton value="contrast">Contrast</ToggleButton>
              </ToggleButtonGroup>
              <Button size="small" variant="outlined" onClick={togglePreset}>Sıradaki</Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 80 }}>Dil</Typography>
              <Select size="small" value={lang} onChange={(e)=> setLang(e.target.value)}>
                <MenuItem value="tr">Türkçe</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Posta</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="body2" sx={{ mb: .5 }}>Varsayılan şirket filtreleri</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {Object.keys(COMPANY_COLORS).map(code => (
                  <Chip key={code} size="small" label={code}
                    color={mailDefaultCompanies.includes(code) ? 'primary' : 'default'}
                    variant={mailDefaultCompanies.includes(code) ? 'filled' : 'outlined'}
                    onClick={()=> onToggleCompany(code)}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary">Gelen kutusu açıldığında bu filtreler otomatik uygulanır.</Typography>
            </Box>
            <FormControlLabel control={<Switch checked={mailPreviewPane} onChange={onMailPreview} />} label="Önizleme paneli açık" />
            <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 140 }}>Liste yoğunluğu</Typography>
              <ToggleButtonGroup size="small" exclusive value={mailListDensity} onChange={onMailDensity}>
                <ToggleButton value="comfortable">Rahat</ToggleButton>
                <ToggleButton value="compact">Kompakt</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 140 }}>Otomatik yenileme (sn)</Typography>
              <TextField size="small" type="number" value={mailAutoRefreshSec} onChange={onMailAutoRefresh} sx={{ width: 120 }} />
            </Box>
            <Typography variant="caption" color="text.secondary">0 = kapalı. 30-60 sn önerilir. IMAP senkron arka planda devam eder.</Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Arayüz</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <FormControlLabel control={<Switch checked={showQuickActions} onChange={onToggleQuickActions} />} label="Hızlı işlemler çubuğunu göster" />
            <FormControlLabel control={<Switch checked={showFxWidget} onChange={onToggleFxWidget} />} label="Döviz widget'ını göster (üst çubuk)" />
            <Box sx={{ display:'flex', alignItems:'center', gap: 1, flexWrap:'wrap' }}>
              <Typography variant="body2" sx={{ minWidth: 160 }}>Varsayılan açılış sayfası</Typography>
              <Select size="small" value={defaultLanding} onChange={onDefaultLanding}>
                <MenuItem value="/">Dashboard</MenuItem>
                <MenuItem value="/talep">Talepler</MenuItem>
                <MenuItem value="/rfqs">RFQs</MenuItem>
                <MenuItem value="/purchase-orders">PO&apos;lar</MenuItem>
              </Select>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap: 1, flexWrap:'wrap', opacity: applyBgGlobally ? 0.5 : 1 }}>
              <Typography variant="body2" sx={{ minWidth: 160 }}>Dashboard arka planı</Typography>
              <Button component="label" size="small" variant="outlined" disabled={applyBgGlobally}>Resim Yükle
                <input hidden type="file" accept="image/*" onChange={onPickBgFile} disabled={applyBgGlobally} />
              </Button>
              {dashboardBg && <Button size="small" onClick={onClearBg} disabled={applyBgGlobally}>Kaldır</Button>}
            </Box>
            {dashboardBg && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Önizleme</Typography>
                <Box sx={{ mt: .5, width: 260, height: 120, borderRadius: 1, border: '1px solid', borderColor: 'divider', backgroundImage: `url(${dashboardBg})`, backgroundSize:'cover', backgroundPosition:'center' }} />
                <Box sx={{ mt: 1, display:'flex', alignItems:'center', gap: 2, opacity: applyBgGlobally ? 0.5 : 1 }}>
                  <Box sx={{ minWidth: 120 }}>
                    <Typography variant="caption" color="text.secondary">Blur</Typography>
                    <Slider size="small" min={0} max={16} step={1} value={bgBlur} onChange={onBgBlur} valueLabelDisplay="auto" disabled={applyBgGlobally} />
                  </Box>
                  <Box sx={{ minWidth: 120 }}>
                    <Typography variant="caption" color="text.secondary">Karartma</Typography>
                    <Slider size="small" min={0} max={60} step={2} value={bgDim} onChange={onBgDim} valueLabelDisplay="auto" disabled={applyBgGlobally} />
                  </Box>
                </Box>
                <FormControlLabel sx={{ mt: 1 }} control={<Switch checked={applyBgGlobally} onChange={onApplyBgGlobally} />} label="Arka planı uygulama genelinde kullan" />
                {applyBgGlobally && (
                  <Typography variant="caption" color="text.secondary" sx={{ display:'block', mt: .5 }}>
                    Global arka plan açıkken dashboard’a özel ayarlar pasif hale gelir.
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display:'block', mt: .5 }}>
                  Not: Global arka plan açıkken dashboard sayfasındaki yerel arka plan otomatik olarak kapatılır.
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Hareket</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <Box sx={{ display:'flex', alignItems:'center', gap: 1, flexWrap:'wrap' }}>
              <Typography variant="body2" sx={{ minWidth: 160 }}>Animasyon modu</Typography>
              <ToggleButtonGroup size="small" exclusive value={animMode} onChange={onAnimMode}>
                <ToggleButton value="hover">Hover</ToggleButton>
                <ToggleButton value="always">Her zaman</ToggleButton>
                <ToggleButton value="off">Kapalı</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <FormControlLabel control={<Switch checked={reduceMotion} onChange={onToggleReduceMotion} />} label="Grafik animasyonlarını azalt" />
            <Typography variant="caption" color="text.secondary">Performans ve dikkat dağıtmayı azaltmak için animasyonlar kapatılabilir.</Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Yoğunluk & Radius</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5} direction={{ xs:'column', sm:'row' }} alignItems={{ xs:'flex-start', sm:'center' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 120 }}>Yoğunluk</Typography>
              <ToggleButtonGroup size="small" exclusive value={density} onChange={(_,v)=> v && setDensity(v)}>
                <ToggleButton value="comfortable">Rahat</ToggleButton>
                <ToggleButton value="compact">Kompakt</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 120 }}>Köşe yarıçapı</Typography>
              <ToggleButtonGroup size="small" exclusive value={corner} onChange={(_,v)=> v && setCorner(v)}>
                <ToggleButton value="sm">Küçük</ToggleButton>
                <ToggleButton value="md">Orta</ToggleButton>
                <ToggleButton value="lg">Büyük</ToggleButton>
                <ToggleButton value="xl">XL</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </ContentContainer>
  );
}
