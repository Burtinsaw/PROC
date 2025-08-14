import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Stack, Alert } from '@mui/material';
import axios from '../utils/axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!currentPassword || !newPassword) {
      setError('Tüm alanlar zorunludur');
      return;
    }
    if (newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }
    if (newPassword !== confirm) {
      setError('Yeni şifre ve doğrulama eşleşmiyor');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put('/users/change-password', { currentPassword, newPassword });
      if (res.data?.message) {
        setSuccess(res.data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirm('');
      } else {
        setSuccess('Şifre başarıyla değiştirildi');
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Şifre değiştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 480 }} component="form" onSubmit={onSubmit}>
      <Typography variant="h5" sx={{ mb: 2 }}>Şifre Değiştir</Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TextField
          label="Mevcut Şifre"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <TextField
          label="Yeni Şifre"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          helperText="En az 6 karakter"
        />
        <TextField
          label="Yeni Şifre (Tekrar)"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={loading}>Kaydet</Button>
          <Button type="button" variant="outlined" disabled={loading} onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirm(''); }}>Temizle</Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChangePassword;
