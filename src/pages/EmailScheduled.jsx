import { useEffect, useState } from 'react';
import { Box, Button, Grid, List, ListItem, ListItemButton, ListItemText, Paper, Stack, TextField, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import dayjs from 'dayjs';
import { listDrafts, cancelSchedule, scheduleSend, listAccounts, upsertDraft, sendNow } from '../api/email';
import { useNavigate } from 'react-router-dom';

export default function EmailScheduled(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reschedule, setReschedule] = useState({}); // { [id]: datetime-local value }
  const [busyId, setBusyId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [accountSel, setAccountSel] = useState({}); // { [id]: accountId }
  const navigate = useNavigate();

  const load = async () => {
    const { items } = await listDrafts().catch(() => ({ items: [] }));
    const scheduled = (items||[]).filter(d => d.status === 'scheduled');
    setItems(scheduled);
    try{
      const { items: accs } = await listAccounts();
      setAccounts(accs||[]);
      setAccountSel(prev => {
        const next = { ...prev };
        scheduled.forEach(d => { if (d.accountId && !next[d.id]) next[d.id] = d.accountId; });
        return next;
      });
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try{ await load(); }
      finally { if(mounted) setLoading(false); }
    })();
    const t = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const onCancel = async (id) => {
    try{ setBusyId(id); await cancelSchedule(id); await load(); }
    finally { setBusyId(null); }
  };

  const onReschedule = async (id) => {
    const when = reschedule[id];
    if (!when) return;
    try{ setBusyId(id); await scheduleSend({ draftId: id, scheduledAt: when }); await load(); }
    finally { setBusyId(null); }
  };

  const onAccountChange = async (id, newAccId) => {
    setAccountSel(s => ({ ...s, [id]: newAccId }));
    try{ setBusyId(id); await upsertDraft({ id, accountId: newAccId }); await load(); }
    finally { setBusyId(null); }
  };

  const onSendNow = async (id) => {
    try{ setBusyId(id); await sendNow({ draftId: id, accountId: accountSel[id] }); await load(); }
    finally { setBusyId(null); }
  };

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Planlanan E‑postalar</Typography>
        <Button variant="contained" onClick={()=> navigate('/email/compose')}>Yeni E‑Posta</Button>
      </Stack>
      <Paper variant="outlined">
        <List>
          {(items||[]).map(d => (
            <ListItem key={d.id} disablePadding secondaryAction={<span>{dayjs(d.updatedAt).format('DD.MM HH:mm')}</span>}>
              <ListItemButton onClick={()=> navigate(`/email/compose?id=${d.id}`)}>
                <ListItemText primary={d.subject || '(Konu yok)'} secondary={(d.to || '').slice(0, 60)} />
              </ListItemButton>
            </ListItem>
          ))}
          {!loading && (!items || items.length === 0) && (
            <ListItem><ListItemText primary="Planlanan e‑posta yok" /></ListItem>
          )}
        </List>
      </Paper>

      {(items||[]).length > 0 && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Yeniden Planla / İptal</Typography>
          <Grid container spacing={2}>
            {items.map(d => (
              <Grid item xs={12} md={6} key={d.id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">#{d.id} — {d.subject || '(Konu yok)'} </Typography>
                    <Typography variant="body2">Mevcut: {d.scheduledAt ? dayjs(d.scheduledAt).format('DD.MM.YYYY HH:mm') : '-'}</Typography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id={`acc-${d.id}`}>Hesap</InputLabel>
                    <Select
                      labelId={`acc-${d.id}`}
                      label="Hesap"
                      value={accountSel[d.id] || ''}
                      onChange={(e)=> onAccountChange(d.id, e.target.value)}
                    >
                      {(accounts||[]).map(a => (
                        <MenuItem key={a.id} value={a.id}>{a.emailAddress || a.username || `Hesap #${a.id}`}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button size="small" variant="outlined" onClick={()=> onSendNow(d.id)} disabled={busyId===d.id}>Şimdi Gönder</Button>
                  <TextField
                    type="datetime-local"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={reschedule[d.id] || ''}
                    onChange={(e)=> setReschedule(s => ({ ...s, [d.id]: e.target.value }))}
                  />
                  <Button size="small" variant="contained" onClick={()=> onReschedule(d.id)} disabled={busyId===d.id || !reschedule[d.id]}>Planla</Button>
                  <Button size="small" color="error" variant="outlined" onClick={()=> onCancel(d.id)} disabled={busyId===d.id}>İptal</Button>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
