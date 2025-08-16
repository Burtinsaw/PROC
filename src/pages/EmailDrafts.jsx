import { useEffect, useState } from 'react';
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Paper, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { listDrafts } from '../api/email';
import { useNavigate } from 'react-router-dom';

export default function EmailDrafts(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load(){
      try{ const { items } = await listDrafts(); if (mounted) setItems(items || []); }
      finally { if (mounted) setLoading(false); }
    }
    load();
    const t = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Taslaklar</Typography>
        <Button variant="contained" onClick={()=> navigate('/email/compose')}>Yeni E-Posta</Button>
      </Stack>
      <Paper variant="outlined">
        <List>
          {(items||[]).map(d => (
            <ListItem key={d.id} disablePadding secondaryAction={<span>{dayjs(d.updatedAt).format('DD.MM HH:mm')}</span>}>
              <ListItemButton onClick={()=> navigate(`/email/compose?id=${d.id}`)}>
                <ListItemText
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                  primary={d.subject || '(Konu yok)'}
                  secondary={(d.to || '').slice(0, 60)}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {!loading && (!items || items.length === 0) && (
            <ListItem><ListItemText primaryTypographyProps={{ component: 'div' }} primary="Taslak bulunamadı" /></ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}
