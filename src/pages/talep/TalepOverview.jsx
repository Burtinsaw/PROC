import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Stack, Paper, Chip, Button, Skeleton, Tooltip } from '@mui/material';
import { Plus, Clock3, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import usePermissions from '../../hooks/usePermissions';

export default function TalepOverview(){
  const navigate = useNavigate();
  const { any } = usePermissions();
  const canCreate = any(['requests:create']);
  const [counts, setCounts] = useState({ total: 0, pending: 0, tracking: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let active = true;
    (async ()=>{
      try {
        setLoading(true);
        const { data } = await axios.get('/talepler/summary');
        if(active && data){
          setCounts({
            total: data.total || 0,
            pending: data.pending || 0,
            tracking: data.tracking || data.inProgress || 0
          });
        }
      } catch {/* ignore */}
      finally { if(active) setLoading(false); }
    })();
    return ()=>{ active=false; };
  }, []);
  return (
    <Box p={3} sx={{ display:'flex', flexDirection:'column', gap:3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight={600}>Talepler</Typography>
          <Typography variant="body2" color="text.secondary">Operasyonel talep yaşam döngüsünü tek ekrandan yönetin.</Typography>
        </Box>
        <Stack direction="row" gap={1}>
          <Tooltip title={canCreate? 'Yeni talep oluştur':'Yetkiniz yok'}>
            <span>
              <Button disabled={!canCreate} variant="contained" startIcon={<Plus size={18} />} onClick={()=> navigate('/talep/yeni')}>Yeni Talep</Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p:2.5, display:'flex', flexDirection:'column', gap:1.5, borderRadius:3 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ width:40, height:40, borderRadius:2, bgcolor:'primary.main', color:'primary.contrastText', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Plus size={22} />
              </Box>
              <Typography variant="h6" fontWeight={600}>Yeni Talep</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">İhtiyaç duyulan ürün/hizmet için yeni kayıt oluştur.</Typography>
            {loading ? <Skeleton variant="text" width={60} /> : <Chip size="small" label={`Toplam: ${counts.total}`} />}
            <Button size="small" variant="outlined" onClick={()=>navigate('/talep/yeni')}>Oluştur</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p:2.5, display:'flex', flexDirection:'column', gap:1.5, borderRadius:3 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ width:40, height:40, borderRadius:2, bgcolor:'warning.main', color:'warning.contrastText', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Clock3 size={22} />
              </Box>
              <Typography variant="h6" fontWeight={600}>Bekleyen Talepler</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Onay veya işleme alınmayı bekleyen talepleri görüntüle.</Typography>
            {loading ? <Skeleton variant="text" width={60} /> : <Chip size="small" label={`Bekleyen: ${counts.pending}`} />}
            <Button size="small" variant="outlined" onClick={()=>navigate('/talep/bekleyen')}>Listele</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p:2.5, display:'flex', flexDirection:'column', gap:1.5, borderRadius:3 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ width:40, height:40, borderRadius:2, bgcolor:'secondary.main', color:'secondary.contrastText', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ListChecks size={22} />
              </Box>
              <Typography variant="h6" fontWeight={600}>Talep Takip</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Durum, ilerleme ve iş akışı geçmişini izle.</Typography>
            {loading ? <Skeleton variant="text" width={60} /> : <Chip size="small" label={`Takip: ${counts.tracking}`} />}
            <Button size="small" variant="outlined" onClick={()=>navigate('/talep/takip')}>Takip</Button>
          </Paper>
        </Grid>
      </Grid>
      <Paper elevation={0} sx={{ p:3, borderRadius:3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Durum Özeti</Typography>
        <Stack direction="row" gap={2} flexWrap="wrap">
          {['Taslak','Bekliyor','Onaylandı','Reddedildi','Tamamlandı'].map(s => (
            <Chip key={s} label={s} variant="outlined" />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
