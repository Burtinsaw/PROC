import React, { useEffect, useState } from 'react';
import { Box, Grid, Stack, Typography, Card, CardContent, List, ListItem, ListItemText, Chip, Button, CircularProgress } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import MainCard from '../components/common/MainCard';
import axios from '../utils/axios';
import { toast } from 'sonner';

function StatCard({ title, value, color = 'primary' }){
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Typography variant="h5" color={color} sx={{ mt: 0.5 }}>{value ?? '-'}</Typography>
      </CardContent>
    </Card>
  );
}

export default function LogisticsDashboard(){
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, n, e] = await Promise.all([
        axios.get('/logistics/dashboard-stats'),
        axios.get('/logistics/notifications'),
        axios.get('/logistics/calendar-events')
      ]);
      setStats(s?.data || {});
      setNotifications(n?.data?.notifications || []);
      setEvents(e?.data?.events || e?.data || []);
    } catch (err){
      console.error('Lojistik panel yükleme hatası', err);
      toast.error('Lojistik verileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <Box>
      <PageHeader title="Lojistik Paneli" description="Operasyon, sevkiyat ve kritik uyarılar" right={<Button onClick={loadAll} variant="outlined">Yenile</Button>} />

      {loading && (
        <Stack alignItems="center" justifyContent="center" sx={{ height: 160 }}>
          <CircularProgress />
        </Stack>
      )}

      {!loading && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <MainCard title="Durum Özeti">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Açık Sevkiyat" value={stats?.openShipments} /></Grid>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Bekleyen Ödeme" value={stats?.pendingPrepayments} color="warning.main" /></Grid>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Kritik Uyarı" value={stats?.criticalAlerts} color="error.main" /></Grid>
              </Grid>
            </MainCard>

            <MainCard title="Takvim Olayları" sx={{ mt: 2 }}>
              {events.length === 0 ? (
                <Typography color="text.secondary">Kayıt yok</Typography>
              ) : (
                <List dense>
                  {events.map((ev) => (
                    <ListItem key={ev.id} divider>
                      <ListItemText
                        primary={ev.title}
                        secondary={(ev.date ? new Date(ev.date).toLocaleString('tr-TR') : '-') + (ev.description ? ' — ' + ev.description : '')}
                      />
                      {ev.priority && <Chip size="small" color={ev.priority === 'kritik' ? 'error' : 'warning'} label={ev.priority.toUpperCase()} />}
                    </ListItem>
                  ))}
                </List>
              )}
            </MainCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <MainCard title={`Bildirimler ${notifications.length ? '('+notifications.filter(n=>!n.isRead).length+' okunmamış)' : ''}`}>
              {notifications.length === 0 ? (
                <Typography color="text.secondary">Bildirim yok</Typography>
              ) : (
                <List dense>
                  {notifications.map((n) => (
                    <ListItem key={n.id} divider>
                      <ListItemText primary={n.title} secondary={n.message} />
                      {n.priority && <Chip size="small" color={n.priority === 'kritik' ? 'error' : 'warning'} label={n.priority.toUpperCase()} />}
                    </ListItem>
                  ))}
                </List>
              )}
            </MainCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
