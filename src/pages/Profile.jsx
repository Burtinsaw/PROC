import React from 'react';
import { Box, Button, Paper, Stack, TextField, Typography, Tabs, Tab, Avatar, Switch, FormControlLabel, Select, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useAuth } from '../contexts/useAuth';
import { useAppTheme } from '../contexts/useAppTheme';
import axios from '../utils/axios';
import { toast } from 'sonner';
import ProfileHeaderBanner from '../components/profile/ProfileHeaderBanner';
import ProfileSideCard from '../components/profile/ProfileSideCard';

export default function Profile() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const [form, setForm] = React.useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    department: user?.department || '',
    designation: user?.designation || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    address1: user?.address1 || '',
    address2: user?.address2 || '',
    city: user?.city || '',
    state: user?.state || '',
    postalCode: user?.postalCode || '',
    country: user?.country || 'Türkiye',
    
  });
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState(0);
  const [avatarPreview, setAvatarPreview] = React.useState(user?.avatarUrl || '');
  const { mode, toggleTheme } = useAppTheme();
  const [prefs, setPrefs] = React.useState(() => {
    const saved = localStorage.getItem('userPrefs');
    return saved ? JSON.parse(saved) : { language: 'tr', timezone: 'Europe/Istanbul' };
  });
  const [secForm, setSecForm] = React.useState({ currentPassword: '', newPassword: '' });

  React.useEffect(() => {
    let ignore = false;
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/users/profile');
        const u = res.data?.user || res.data?.data;
        if (!ignore && u) {
          setForm((f) => ({
            ...f,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            department: u.department || '',
            designation: u.designation || '',
            phoneNumber: u.phoneNumber || '',
            dateOfBirth: u.dateOfBirth || '',
            address1: u.address1 || '',
            address2: u.address2 || '',
            city: u.city || '',
            state: u.state || '',
            postalCode: u.postalCode || '',
            country: u.country || 'Türkiye',
            
          }));
        }
  } catch {
        // keep existing form; errors are already toasted by interceptor except 401
      }
    };
    fetchProfile();
    return () => { ignore = true; };
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { success, message } = await updateProfile(form);
    setLoading(false);
    if (success) toast.success(message || 'Profil güncellendi');
    else toast.error(message);
  };

  const onPrefChange = (key) => (e) => setPrefs((p) => ({ ...p, [key]: e.target.value }));
  const savePrefs = () => {
    localStorage.setItem('userPrefs', JSON.stringify(prefs));
    toast.success('Tercihler kaydedildi');
  };

  const onSecurityChange = (e) => setSecForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onChangePassword = async (e) => {
    e.preventDefault();
    if (!secForm.currentPassword || !secForm.newPassword) return toast.error('Lütfen tüm alanları doldurun');
    try {
      await axios.put('/users/change-password', secForm);
      toast.success('Şifre güncellendi');
      setSecForm({ currentPassword: '', newPassword: '' });
  } catch {
      // interceptor handles error toast
    }
  };

  const handleTab = (e, v) => setTab(v);

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result;
        await axios.put('/users/profile/avatar', { avatar: dataUrl });
        toast.success('Avatar güncellendi');
        setAvatarPreview(typeof dataUrl === 'string' ? dataUrl : '');
        await refreshProfile();
  } catch {
        // interceptor will toast
      }
    };
    reader.readAsDataURL(file);
  };

  // basit tamamlanma yüzdesi
  const completion = React.useMemo(() => {
    const keys = ['firstName','lastName','email','designation','phoneNumber','address1','city','country'];
    const filled = keys.filter((k) => !!form[k]).length;
    return Math.round((filled / keys.length) * 100);
  }, [form]);

  return (
    <Box>
      <ProfileHeaderBanner completion={completion} title="Kişisel Profil" subtitle="Bilgilerinizi güncel tutun" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <ProfileSideCard user={user} />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper sx={{ p: 2 }}>
      <Tabs value={tab} onChange={handleTab} sx={{ mb: 2 }}>
        <Tab label="Genel" />
        <Tab label="Avatar" />
  <Tab label="Tercihler" />
  <Tab label="Güvenlik" />
      </Tabs>

      {tab === 0 && (
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Ad" name="firstName" value={form.firstName} onChange={onChange} fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Soyad" name="lastName" value={form.lastName} onChange={onChange} fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField type="email" label="E-posta" name="email" value={form.email} onChange={onChange} fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Departman" name="department" value={form.department} onChange={onChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Pozisyon / Ünvan" name="designation" value={form.designation} onChange={onChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField type="date" label="Doğum Tarihi" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={12}>
              <TextField label="Telefon" name="phoneNumber" value={form.phoneNumber} onChange={onChange} fullWidth />
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>Adres</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Adres 1" name="address1" value={form.address1} onChange={onChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Adres 2" name="address2" value={form.address2} onChange={onChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Şehir" name="city" value={form.city} onChange={onChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Eyalet/İl" name="state" value={form.state} onChange={onChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Posta Kodu" name="postalCode" value={form.postalCode} onChange={onChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Ülke" name="country" value={form.country} onChange={onChange} fullWidth />
            </Grid>
            
            <Grid size={12}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Kaydediliyor…' : 'Kaydet'}</Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Stack spacing={2} alignItems="center">
          <Avatar src={avatarPreview || user?.avatarUrl} sx={{ width: 96, height: 96 }}>
            {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Button variant="outlined" component="label">
            Resim Seç
            <input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={onAvatarChange} />
          </Button>
        </Stack>
      )}

      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <FormControlLabel
              control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
              label={`Tema modu: ${mode === 'dark' ? 'Koyu' : 'Açık'}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Dil</Typography>
            <Select fullWidth size="small" value={prefs.language} onChange={onPrefChange('language')}>
              <MenuItem value="tr">Türkçe</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Zaman Dilimi</Typography>
            <Select fullWidth size="small" value={prefs.timezone} onChange={onPrefChange('timezone')}>
              <MenuItem value="Europe/Istanbul">Europe/Istanbul</MenuItem>
              <MenuItem value="Europe/Berlin">Europe/Berlin</MenuItem>
              <MenuItem value="UTC">UTC</MenuItem>
            </Select>
          </Grid>
          <Grid size={12}>
            <Stack direction="row" justifyContent="flex-end">
              <Button onClick={savePrefs} variant="contained">Kaydet</Button>
            </Stack>
          </Grid>
        </Grid>
      )}

      {tab === 3 && (
        <Box component="form" onSubmit={onChangePassword} noValidate>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField type="password" label="Mevcut Şifre" name="currentPassword" value={secForm.currentPassword} onChange={onSecurityChange} fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField type="password" label="Yeni Şifre" name="newPassword" value={secForm.newPassword} onChange={onSecurityChange} fullWidth required />
            </Grid>
            <Grid size={12}>
              <Stack direction="row" justifyContent="flex-end">
                <Button type="submit" variant="contained">Şifreyi Güncelle</Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
