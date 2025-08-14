import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import AuthWrapper from '../../sections/auth/AuthWrapper';
import axios from '../../utils/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || '';
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Optionally verify token on load
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) return setError('Kod gerekli');
    if (!newPassword || newPassword.length < 6) return setError('Şifre en az 6 karakter olmalı');
    if (newPassword !== confirmPassword) return setError('Şifreler eşleşmiyor');

    setLoading(true);
    try {
      await axios.post('/users/reset-password', { token, newPassword });
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Şifre sıfırlama başarısız';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthWrapper title="Şifre Sıfırlandı" subtitle="Yeni şifrenizle giriş yapabilirsiniz">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>Şifre başarıyla güncellendi</Typography>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="contained">Girişe Dön</Button>
          </Link>
        </Box>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper title="Şifre Sıfırla" subtitle="E-posta ile gelen kodu ve yeni şifreyi girin">
      <Box component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          margin="normal"
          fullWidth
          required
          label="Kod"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          required
          label="Yeni Şifre"
          type={show ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Key color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow((s) => !s)} edge="end">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <TextField
          margin="normal"
          fullWidth
          required
          label="Yeni Şifre (Tekrar)"
          type={show ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, py: 1.25, fontWeight: 600 }}>
          {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </Button>
      </Box>
    </AuthWrapper>
  );
}
