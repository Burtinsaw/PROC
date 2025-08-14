import { useContext } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  ShoppingCart,
  Pending,
  CheckCircle,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// project imports
import AuthContext from '../../contexts/AuthContext';

// ==============================|| DASHBOARD DEFAULT ||============================== //

const DashboardDefault = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Toplam Talep',
      value: '24',
      icon: <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary'
    },
    {
      title: 'Bekleyen Talep',
      value: '8',
      icon: <Pending sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning'
    },
    {
      title: 'Onaylanan',
      value: '12',
      icon: <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success'
    },
    {
      title: 'Bu Ay Artış',
      value: '+15%',
      icon: <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info'
    }
  ];

  const recentRequests = [
    { id: 1, title: 'Ofis Malzemeleri', status: 'Bekliyor', date: '2025-08-05', amount: '₺2,500' },
    { id: 2, title: 'IT Ekipmanları', status: 'Onaylandı', date: '2025-08-04', amount: '₺15,000' },
    { id: 3, title: 'Temizlik Malzemeleri', status: 'İnceleniyor', date: '2025-08-03', amount: '₺800' },
    { id: 4, title: 'Kırtasiye', status: 'Onaylandı', date: '2025-08-02', amount: '₺1,200' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Onaylandı': return 'success';
      case 'Bekliyor': return 'warning';
      case 'İnceleniyor': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Hoş Geldiniz, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Satın alma süreçlerinizi buradan takip edebilir ve yeni talepler oluşturabilirsiniz.
        </Typography>
      </Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box>{stat.icon}</Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  color={stat.color}
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Hızlı İşlemler
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/procurement/requests/new')}
                  sx={{ py: 1.5 }}
                >
                  Yeni Talep Oluştur
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/procurement/requests/list')}
                  sx={{ py: 1.5 }}
                >
                  Taleplerim
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Raporlar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Requests */}
        <Grid
          size={{
            xs: 12,
            md: 8
          }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Son Talepler
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentRequests.map((request) => (
                  <Box
                    key={request.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'grey.50',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {request.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {request.amount}
                      </Typography>
                      <Chip
                        label={request.status}
                        size="small"
                        color={getStatusColor(request.status)}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/procurement/requests/list')}
                >
                  Tümünü Görüntüle
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardDefault;
