import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

const dashboardStats = [
  {
    title: 'Toplam Sipariş',
    value: '1,234',
    change: '+12%',
    changeType: 'increase',
    icon: ShoppingCart,
    bgColor: '#e3f2fd',
    color: '#1976d2'
  },
  {
    title: 'Aktif Tedarikçi',
    value: '156',
    change: '+5%',
    changeType: 'increase',
    icon: Users,
    bgColor: '#e8f5e8',
    color: '#2e7d32'
  },
  {
    title: 'Bekleyen Onay',
    value: '23',
    change: '-3%',
    changeType: 'decrease',
    icon: Clock,
    bgColor: '#fff3e0',
    color: '#f57c00'
  },
  {
    title: 'Toplam Değer',
    value: '₺2.5M',
    change: '+18%',
    changeType: 'increase',
    icon: DollarSign,
    bgColor: '#fce4ec',
    color: '#c2185b'
  }
];

const ProcurementDashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, width: '100%', padding: 3 }}>
      <Grid container spacing={3} sx={{ maxWidth: '100%' }}>
        {dashboardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ backgroundColor: stat.bgColor, borderRadius: 2, p: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Avatar sx={{ bgcolor: stat.color }}>{<stat.icon size={20} />}</Avatar>
                  <Chip
                    label={stat.change}
                    color={stat.changeType === 'increase' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography variant="h5" fontWeight={600} mt={2}>{stat.value}</Typography>
                <Typography variant="body2" color="textSecondary">{stat.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProcurementDashboard;
