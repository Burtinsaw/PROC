import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Email
} from '@mui/icons-material';

// project imports
import AuthContext from '../../contexts/AuthContext';

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
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
          E-posta Gönderildi
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. E-postanızı kontrol edin.
        </Typography>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Button variant="contained">
            Giriş Sayfasına Dön
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
        Şifremi Unuttum
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: 'text.secondary' }}>
        E-posta adresinizi girin, şifre sıfırlama bağlantısını size gönderelim
      </Typography>

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

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
      >
        {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısını Gönder'}
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
  );
};

export default ForgotPassword;
