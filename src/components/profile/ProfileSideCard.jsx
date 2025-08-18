import React from 'react';
import { Avatar, Box, ButtonBase, Divider, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function ProfileSideCard({ user }) {
  return (
    <Paper sx={{ p: 2, position: 'sticky', top: 'calc(var(--app-header-h) + var(--app-header-gap))' }}>
      <Stack alignItems="center" spacing={1.5}>
        <Avatar src={user?.avatarUrl} sx={{ width: 84, height: 84 }}>
          {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
        </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontWeight={700}>{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.designation || user?.department || 'Kullanıcı'}</Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1}>
        <ButtonBase component={RouterLink} to="/profile" sx={btnSx(true)}>Kişisel Bilgiler</ButtonBase>
        <ButtonBase component={RouterLink} to="/profile#payment" sx={btnSx(false)}>Ödeme</ButtonBase>
        <ButtonBase component={RouterLink} to="/profile#security" sx={btnSx(false)}>Şifre</ButtonBase>
        <ButtonBase component={RouterLink} to="/profile#settings" sx={btnSx(false)}>Ayarlar</ButtonBase>
      </Stack>
    </Paper>
  );
}

const btnSx = (active) => (theme) => ({
  width: '100%',
  textAlign: 'left',
  padding: theme.spacing(1, 1.5),
  borderRadius: 1.5,
  fontSize: 14,
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  backgroundColor: active ? (theme.palette.mode === 'dark' ? 'rgba(74,168,255,0.1)' : 'rgba(20,90,200,0.06)') : 'transparent',
  '&:hover': { backgroundColor: theme.palette.action.hover }
});
