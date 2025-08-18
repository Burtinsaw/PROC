// Business ERP Dashboard Layout
// Modern dashboard inspired by SAP Fiori, Oracle Fusion design patterns

import React from 'react';
import { 
  Box, 
  Grid, 
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Divider,
  Chip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Dashboard,
  TrendingUp,
  People,
  Inventory,
  LocalShipping,
  AttachMoney,
  Warning,
  CheckCircle,
  Schedule,
  MoreVert,
  Notifications,
  Refresh
} from '@mui/icons-material';

import { 
  BusinessMetricCard, 
  BusinessTableContainer,
  BusinessStatusChip,
  BusinessPageHeader 
} from './BusinessLayoutComponents';

// Main Business Dashboard
export const BusinessDashboard = () => {
  const theme = useTheme();

  // Sample metrics data
  const metrics = [
    {
      title: 'Toplam Satın Alma',
      value: '₺2.4M',
      subtitle: 'Bu ay',
      trend: 'up',
      trendValue: '+12.5%',
      status: 'success'
    },
    {
      title: 'Aktif RFQ\'lar',
      value: '47',
      subtitle: 'Bekleyen',
      trend: 'down',
      trendValue: '-3',
      status: 'warning'
    },
    {
      title: 'Tedarikçiler',
      value: '156',
      subtitle: 'Aktif',
      trend: 'up',
      trendValue: '+8',
      status: 'info'
    },
    {
      title: 'Ortalama İşlem Süresi',
      value: '4.2 gün',
      subtitle: 'Son 30 gün',
      trend: 'down',
      trendValue: '-0.8 gün',
      status: 'success'
    }
  ];

  // Quick actions
  const quickActions = [
    { icon: <People />, label: 'Yeni RFQ', color: 'primary' },
    { icon: <Inventory />, label: 'Stok Kontrol', color: 'secondary' },
    { icon: <LocalShipping />, label: 'Sevkiyat', color: 'info' },
    { icon: <AttachMoney />, label: 'Ödeme', color: 'success' }
  ];

  // Recent activity data
  const recentActivity = [
    { id: 1, type: 'rfq', title: 'RFQ-2024-001 oluşturuldu', time: '5 dk önce', status: 'pending' },
    { id: 2, type: 'approval', title: 'Malzeme onayı tamamlandı', time: '15 dk önce', status: 'approved' },
    { id: 3, type: 'shipment', title: 'Sevkiyat güncellendi', time: '1 sa önce', status: 'active' },
    { id: 4, type: 'payment', title: 'Ödeme işlendi', time: '2 sa önce', status: 'active' }
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Page Header */}
      <BusinessPageHeader
        title="Satın Alma Yönetimi"
        subtitle="Genel bakış ve operasyonel metrikler"
        actions={[
          <IconButton key="notifications" size="small">
            <Notifications />
          </IconButton>,
          <IconButton key="refresh" size="small">
            <Refresh />
          </IconButton>
        ]}
        dense
      />

      {/* Key Metrics Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <BusinessMetricCard
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              trend={metric.trend}
              trendValue={metric.trendValue}
              status={metric.status}
              actions
            />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={2}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={2}>
            {/* Quick Actions */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.875rem' }}>
                  Hızlı İşlemler
                </Typography>
                <Grid container spacing={1}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Box
                        sx={{
                          p: 1.5,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: `${action.color}.main`,
                            backgroundColor: alpha(theme.palette[action.color].main, 0.04)
                          }
                        }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '50%',
                            backgroundColor: alpha(theme.palette[action.color].main, 0.1),
                            color: `${action.color}.main`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant="caption" textAlign="center" sx={{ fontWeight: 500 }}>
                          {action.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Performans Trendi
                  </Typography>
                  <IconButton size="small">
                    <MoreVert sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                
                {/* Chart placeholder with data bars */}
                <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1, p: 1 }}>
                  {[65, 45, 78, 52, 89, 67, 73, 56, 84, 71, 92, 58].map((height, index) => (
                    <Box
                      key={index}
                      sx={{
                        flex: 1,
                        height: `${height}%`,
                        backgroundColor: index === 11 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3),
                        borderRadius: 0.5,
                        minHeight: 20
                      }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ocak
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Aralık
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            {/* Task Summary */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.875rem' }}>
                  Görev Durumu
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        Tamamlanan
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        78%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={78} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.success.main,
                          borderRadius: 3
                        }
                      }} 
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        Devam Eden
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        15%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={15} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.warning.main,
                          borderRadius: 3
                        }
                      }} 
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        Geciken
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        7%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={7} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.error.main,
                          borderRadius: 3
                        }
                      }} 
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.875rem' }}>
                  Son Aktiviteler
                </Typography>
                
                <Stack spacing={1.5}>
                  {recentActivity.map((activity, index) => (
                    <Box key={activity.id}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: activity.status === 'pending' ? theme.palette.warning.main :
                                           activity.status === 'approved' ? theme.palette.success.main :
                                           theme.palette.primary.main,
                            mt: 0.75,
                            flexShrink: 0
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                            {activity.time}
                          </Typography>
                        </Box>
                        <BusinessStatusChip 
                          status={activity.status} 
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      {index < recentActivity.length - 1 && (
                        <Divider sx={{ mt: 1.5 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card variant="outlined" sx={{ border: 1, borderColor: 'warning.main' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'warning.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Sistem Uyarıları
                  </Typography>
                </Box>
                
                <Stack spacing={1}>
                  <Box sx={{ p: 1, backgroundColor: alpha(theme.palette.warning.main, 0.05), borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      3 RFQ onay bekliyor
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Son 24 saat
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 1, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Stok seviyesi düşük
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      5 ürün kritik seviyede
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessDashboard;
