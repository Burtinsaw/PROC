import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, Paper, Button, Chip, Grid, Tooltip, Skeleton } from '@mui/material';
import { FilePlus2, RefreshCw, BarChart3, Filter, Search } from 'lucide-react';
import axios from '../../utils/axios';
import usePermissions from '../../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';

export default function RFQOverview(){
  const { any } = usePermissions();
  const canCreate = any(['requests:create']);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  const load = async ()=>{
    setLoading(true);
    try {
      const [{ data: sum }, { data: rfqs }] = await Promise.all([
        axios.get('/rfqs/summary'),
        axios.get('/rfqs?limit=6')
      ]);
      setStats(sum);
      setList(Array.isArray(rfqs?.rfqs)? rfqs.rfqs.slice(0,6): []);
    } catch {/* ignore */}
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const quickCards = [
    { key:'total', label:'Toplam', value: stats?.total },
    { key:'open', label:'Açık', value: stats?.open },
    { key:'awaiting', label:'Teklif Bekleyen', value: stats?.awaiting },
    { key:'closed', label:'Kapanan', value: stats?.closed },
    { key:'responseRate', label:'Yanıt Oranı %', value: stats ? Math.round((stats.responseRate||0)*100) : 0 },
    { key:'awardRate', label:'Award Oranı %', value: stats ? Math.round((stats.awardRate||0)*100) : 0 },
    { key:'cycleTimeAvgDays', label:'Ort. Çevrim (gün)', value: stats?.cycleTimeAvgDays ? stats.cycleTimeAvgDays.toFixed(1) : '-' }
  ];

  return (
    <Box p={3} sx={{ display:'flex', flexDirection:'column', gap:3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight={600}>RFQ</Typography>
          <Typography variant="body2" color="text.secondary">Tedarikçilerden teklif toplama ve kıyaslama süreçlerini yönetin.</Typography>
        </Box>
        <Stack direction="row" gap={1}>
          <Tooltip title={canCreate? 'Yeni RFQ':'Yetki yok'}>
            <span>
              <Button variant="contained" disabled={!canCreate} startIcon={<FilePlus2 size={18} />} onClick={()=>navigate('/satinalma/rfq/olustur')}>Yeni RFQ</Button>
            </span>
          </Tooltip>
          <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={load}>Yenile</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {quickCards.map(c => (
          <Grid key={c.key} item xs={6} md={3} lg={2}>
            <Paper elevation={0} sx={{ p:2, borderRadius:3, display:'flex', flexDirection:'column', gap:.5 }}>
              <Typography variant="caption" color="text.secondary">{c.label}</Typography>
              {loading? <Skeleton width={40} /> : <Typography variant="h6" fontWeight={600}>{c.value ?? 0}</Typography>}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p:2.5, borderRadius:3, display:'flex', flexDirection:'column', gap:2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>Son RFQ'ler</Typography>
          <Button size="small" variant="text" onClick={()=>navigate('/rfqs')}>Tümü</Button>
        </Stack>
        <Grid container spacing={2}>
          {loading && !list.length && Array.from({ length:3 }).map((_,i)=>(
            <Grid item xs={12} md={4} key={i}>
              <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                <Skeleton width="60%" />
                <Skeleton width="40%" />
                <Skeleton width="80%" />
              </Paper>
            </Grid>
          ))}
          {!loading && list.map(r => (
            <Grid item xs={12} md={4} key={r.id}>
              <Paper variant="outlined" sx={{ p:2, borderRadius:2, display:'flex', flexDirection:'column', gap:1, cursor:'pointer' }} onClick={()=>navigate(`/rfqs/${r.id}`)}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" fontWeight={600}>{r.rfqNumber || r.id}</Typography>
                  <Chip size="small" label={r.status || '-'} />
                </Stack>
                <Typography variant="body2" fontWeight={500}>{r.title || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">Talep: {r.talep?.talepBasligi || '-'}</Typography>
              </Paper>
            </Grid>
          ))}
          {!loading && !list.length && (
            <Grid item xs={12}><Typography color="text.secondary" variant="body2">Kayıt yok.</Typography></Grid>
          )}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p:3, borderRadius:3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Performans</Typography>
        <Typography variant="body2" color="text.secondary">Grafikler ve benchmark bileşenleri burada yer alacak (placeholder).</Typography>
      </Paper>
    </Box>
  );
}
