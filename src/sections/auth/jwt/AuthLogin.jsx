import React from 'react';
import { Link as RouterLink, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Checkbox, FormControlLabel, FormHelperText, Link, InputAdornment, InputLabel, OutlinedInput, Stack, Typography, IconButton } from '@mui/material';
import AuthWrapper from '../../auth/AuthWrapper';
import Grid from '@mui/material/Grid';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import useAuth from '../../../hooks/useAuth';

export default function AuthLogin({ isDemo = false }) {
  const [checked, setChecked] = React.useState(false);
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = searchParams.get('auth');
  const [values, setValues] = React.useState({ email: '', password: '' });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!values.email) nextErrors.email = 'Email gerekli';
    if (!values.password) nextErrors.password = 'Şifre gerekli';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const trimmedEmail = values.email.trim();
      const res = await login(trimmedEmail, values.password);
      if (!res?.success) throw new Error(res?.message || 'Giriş başarısız');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthWrapper>
      <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="email-login">Kullanıcı adı veya e‑posta</InputLabel>
                <OutlinedInput
                  id="email-login"
                  type="text"
                  value={values.email}
                  name="email"
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  placeholder="Kullanıcı adınızı veya e‑postanızı girin"
                  fullWidth
                  error={Boolean(errors.email)}
                />
              </Stack>
              {errors.email && (
                <FormHelperText error id="standard-weight-helper-text-email-login">
                  {errors.email}
                </FormHelperText>
              )}
            </Grid>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="password-login">Şifre</InputLabel>
                <OutlinedInput
                  fullWidth
                  error={Boolean(errors.password)}
                  id="password-login"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  name="password"
                  onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((p) => !p)} edge="end" color="secondary">
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </IconButton>
                    </InputAdornment>
                  }
                  placeholder="Şifrenizi girin"
                />
              </Stack>
              {errors.password && (
                <FormHelperText error id="standard-weight-helper-text-password-login">
                  {errors.password}
                </FormHelperText>
              )}
            </Grid>
            <Grid size={12} sx={{ mt: -0.5 }}>
              <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} name="checked" color="primary" size="small" />}
                  label={<Typography variant="body2">Beni hatırla</Typography>}
                />
                <Link variant="body2" component={RouterLink} to={isDemo ? '/auth/forgot-password' : auth ? `/${auth}/forgot-password?auth=jwt` : '/forgot-password'} color="primary">
                  Şifremi unuttum
                </Link>
              </Stack>
            </Grid>
            {errors.submit && (
              <Grid size={12}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Grid>
            )}
            <Grid size={12}>
              <Button disableElevation disabled={submitting} fullWidth size="large" type="submit" variant="contained" color="primary" sx={{ py: 1.25, fontWeight: 600 }}>
                Giriş Yap
              </Button>
            </Grid>
            <Grid size={12}>
              <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Hesabınız yok mu?{' '}
                  <Link component={RouterLink} to="/register" color="primary" sx={{ fontWeight: 600 }}>
                    Kayıt Ol
                  </Link>
                </Typography>
              </Stack>
            </Grid>
          </Grid>
      </form>
    </AuthWrapper>
  );
}
