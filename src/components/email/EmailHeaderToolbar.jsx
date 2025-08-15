import React, { useEffect, useState } from 'react';
import { Box, Chip, Stack, Tooltip, Badge } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const FOLDERS = [
  { id: 'inbox', label: 'Gelen' },
  { id: 'drafts', label: 'Taslak' },
  { id: 'scheduled', label: 'Planlanan' },
  { id: 'sent', label: 'Gönderilen' },
  { id: 'spam', label: 'Spam' },
  { id: 'trash', label: 'Çöp' }
];

export default function EmailHeaderToolbar(){
  const navigate = useNavigate();
  const location = useLocation();
  const [counts, setCounts] = useState(() => (typeof window !== 'undefined' && window.__emailCounts) || {});

  const activeFolder = (() => {
    const m = location.pathname.match(/^\/email\/(\w+)/);
    return m?.[1] || 'inbox';
  })();

  useEffect(() => {
    const onChange = (e) => { if (e?.detail) setCounts(e.detail); };
    window.addEventListener('email-counts-changed', onChange);
    return () => window.removeEventListener('email-counts-changed', onChange);
  }, []);

  const goFolder = (f) => navigate(`/email/${f}`);
  return (
    <Stack direction={{ xs:'column', md:'row' }} spacing={1.5} alignItems={{ xs:'stretch', md:'center' }} sx={{ mt: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap:'wrap' }}>
        {FOLDERS.map(f => {
          const label = f.label;
          const unread = counts?.[f.id]?.unread || 0;
          const chip = (
            <Chip
              key={f.id}
              color={activeFolder===f.id? 'primary' : 'default'}
              variant={activeFolder===f.id? 'filled' : 'outlined'}
              label={label}
              onClick={() => goFolder(f.id)}
              clickable
              size="small"
            />
          );
          return unread > 0 ? (
            <Badge key={f.id} color="error" badgeContent={unread} overlap="rectangular">{chip}</Badge>
          ) : chip;
        })}
      </Stack>
      <Box flex={1} />
    </Stack>
  );
}
