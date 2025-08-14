import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import AuthWrapper from '../../sections/auth/AuthWrapper';

// project imports
import AuthContext from '../../contexts/AuthContext';

// ==============================|| REGISTER PAGE ||============================== //

const Register = () => {
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData.email, formData.password, formData.firstName, formData.lastName);
      if (result.success) {
        setInfo(result.message || 'Kayıt alındı. Lütfen e-posta doğrulaması yapın.');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Beklenmedik bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper title="Kayıt Ol" subtitle="Yeni hesap oluşturun" maxWidth={560}>
      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {info && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {info} E-posta doğrulandıktan sonra admin onayı gerekecektir.
          </Alert>
        )}
        <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="Ad"
            name="firstName"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User size={18} color="var(--mui-palette-primary-main)" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Soyad"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User size={18} color="var(--mui-palette-primary-main)" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
  </Grid>
  <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="E-posta Adresi"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Mail size={18} color="var(--mui-palette-primary-main)" />
            </InputAdornment>
          ),
        }}
  />
  <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Şifre"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock size={18} color="var(--mui-palette-primary-main)" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
  />
  <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Şifre Tekrar"
        type={showConfirmPassword ? 'text' : 'password'}
        id="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock size={18} color="var(--mui-palette-primary-main)" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        />
        <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
      >
        {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                Giriş Yap
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthWrapper>
  );
};

export default Register;
