import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, InputAdornment } from '@mui/material';
import {
  Email
} from '@mui/icons-material';

// project imports
import AuthContext from '../../contexts/AuthContext';
import AuthWrapper from '../../sections/auth/AuthWrapper';

// ==============================|| FORGOT PASSWORD PAGE ||============================== //

const ForgotPassword = () => {
  const { resetPassword } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Beklenmedik bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthWrapper title="Şifre Sıfırlama" subtitle="E-postanızı kontrol edin">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
            E-posta Gönderildi
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
          </Typography>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="contained">Giriş Sayfasına Dön</Button>
          </Link>
        </Box>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper title="Şifremi Unuttum" subtitle="E-posta adresinizi girin">
      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="E-posta Adresi"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="primary" />
              </InputAdornment>
            ),
          }}
        />

        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2, py: 1.25, fontWeight: 600 }}>
          {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Şifrenizi hatırladınız mı?{' '}
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

export default ForgotPassword;
