import React from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import { Users, Building2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminHome(){
  const navigate = useNavigate();
  const tiles = [
    { id:'users', title:'Kullanıcı Yönetimi', icon: Users, path:'/admin/users' },
    { id:'companies', title:'Şirketler', icon: Building2, path:'/admin/companies' },
    { id:'settings', title:'Sistem Ayarları', icon: Settings, path:'/settings' },
  ];
  return (
    <Box>
      <Typography variant="h4" sx={{ mb:2, fontWeight:700 }}>Yönetim</Typography>
      <Grid container spacing={2}>
    {tiles.map(t => {
          const Icon = t.icon;
          return (
      <Grid key={t.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card>
                <CardActionArea onClick={()=> navigate(t.path)}>
                  <CardContent>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                      <Icon size={20} />
                      <Typography variant="h6">{t.title}</Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
