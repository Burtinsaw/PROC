import React from 'react';
import { Avatar, Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { User, CreditCard, LockKeyhole, Settings } from 'lucide-react';

const items = [
  { key: 0, label: 'Personal Information', icon: <User size={18} /> },
  { key: 2, label: 'Settings', icon: <Settings size={18} /> },
  { key: 3, label: 'Change Password', icon: <LockKeyhole size={18} /> },
  { key: 1, label: 'Avatar', icon: <CreditCard size={18} />, disabled: false }
];

export default function ProfileSidebar({ user, tab, onChangeTab }) {
  const initials = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
      <Stack alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Avatar src={user?.avatarUrl} sx={{ width: 96, height: 96 }}>
          {initials}
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {user?.firstName || user?.username} {user?.lastName || ''}
        </Typography>
        {user?.designation && (
          <Typography variant="body2" color="text.secondary">{user.designation}</Typography>
        )}
      </Stack>
      <Divider sx={{ mb: 1.5 }} />
      <List dense disablePadding>
        {items.map((it) => (
          <ListItemButton
            key={it.key}
            selected={tab === it.key}
            onClick={() => onChangeTab?.(it.key)}
            disabled={it.disabled}
            sx={{ borderRadius: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{it.icon}</ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }} primary={it.label} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
