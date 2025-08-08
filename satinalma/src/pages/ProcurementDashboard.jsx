import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ElevatedCard from '../components/ui/ElevatedCard';
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Package,
  Truck,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Sample Data
const dashboardStats = [
  {
    title: 'Toplam Talepler',
    value: '1,247',
    change: '+12.5%',
    changeType: 'increase',
    icon: ShoppingCart,
    color: '#3182ce',
    bgColor: '#ebf8ff'
  },
  {
    title: 'Bekleyen Onaylar',
    value: '23',
    change: '-8.2%',
    changeType: 'decrease',
    icon: Clock,
    color: '#ed8936',
    bgColor: '#fef5e7'
  },
  {
    title: 'Tamamlanan',
    value: '892',
    change: '+15.3%',
    changeType: 'increase',
    icon: CheckCircle,
    color: '#38a169',
    bgColor: '#f0fff4'
  },
  {
    title: 'Aktif Tedarikçiler',
    value: '156',
    change: '+4.1%',
    changeType: 'increase',
    icon: Users,
    color: '#805ad5',
    bgColor: '#faf5ff'
  }
];

const monthlyData = [
  { month: 'Oca', talepler: 45, tamamlanan: 38, tutar: 125000 },
  { month: 'Şub', talepler: 52, tamamlanan: 45, tutar: 148000 },
  { month: 'Mar', talepler: 48, tamamlanan: 42, tutar: 132000 },
  { month: 'Nis', talepler: 61, tamamlanan: 55, tutar: 175000 },
  { month: 'May', talepler: 58, tamamlanan: 52, tutar: 168000 },
  { month: 'Haz', talepler: 67, tamamlanan: 61, tutar: 195000 }
];

const categoryData = [
  { name: 'Elektronik', value: 35, color: '#3182ce' },
  { name: 'Makine', value: 25, color: '#38a169' },
  { name: 'Hammadde', value: 20, color: '#ed8936' },
  { name: 'Kimyasal', value: 12, color: '#805ad5' },
  { name: 'Diğer', value: 8, color: '#e53e3e' }
];

const recentRequests = [
  {
    id: 'REQ-2024-001',
    title: 'Arduino Uno Geliştirme Kartı',
    company: 'TechCorp Ltd.',
    requester: 'Ahmet Yılmaz',
    status: 'pending',
    amount: '₺15,420',
    date: '2 saat önce'
  },
  {
    id: 'REQ-2024-002', 
    title: 'Endüstriyel Sensör Seti',
    company: 'AutoSys A.Ş.',
    requester: 'Mehmet Demir',
    status: 'approved',
    amount: '₺28,750',
    date: '4 saat önce'
  },
  {
    id: 'REQ-2024-003',
    title: 'PLC Modülü Siemens',
    company: 'InnoTech Solutions',
    requester: 'Fatma Kaya',
    status: 'quoted',
    amount: '₺45,200',
    date: '1 gün önce'
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return { color: 'warning', label: 'Bekliyor' };
    case 'approved': return { color: 'success', label: 'Onaylandı' };
    case 'quoted': return { color: 'info', label: 'Teklif Alındı' };
    case 'rejected': return { color: 'error', label: 'Reddedildi' };
    default: return { color: 'default', label: 'Bilinmiyor' };
  }
};

const ProcurementDashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      bgcolor: 'background.default',
      // Solda neredeyse sıfır boşluk; sağda normal iç boşluklar
  pl: 0,
      pr: { xs: 2, md: 3 },
      pb: 3
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              Satın Alma Kontrol Paneli
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hoş geldiniz! İşte bugünkü özet bilgileriniz.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Filter size={20} />}
              sx={{ borderRadius: 2 }}
            >
              Filtrele
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download size={20} />}
              sx={{ borderRadius: 2 }}
            >
              Rapor Al
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Yeni Talep
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
    <Grid container rowSpacing={2} columnSpacing={2} sx={{ mb: 3, width: '100%', mx: 0 }}>
        {dashboardStats.map((stat, index) => (
  <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }} key={index}>
    <ElevatedCard padding={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      width: 60,
                      height: 60
                    }}
                  >
                    <stat.icon size={28} />
                  </Avatar>
                  <Chip
                    label={stat.change}
                    size="small"
                    color={stat.changeType === 'increase' ? 'success' : 'error'}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
    </ElevatedCard>
          </Grid>
        ))}
      </Grid>

      <Grid container rowSpacing={2} columnSpacing={2} sx={{ width: '100%', alignItems: 'stretch' }}>
        {/* Monthly Trends Chart */}
  <Grid size={{ xs: 12, md: 7, lg: 6, xl: 6 }}>
      <ElevatedCard padding={2} sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Aylık Talep Trendleri
                </Typography>
                <IconButton onClick={handleMenuOpen}>
                  <MoreVertical size={20} />
                </IconButton>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#718096" fontSize={12} />
                  <YAxis stroke="#718096" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="talepler"
                    stroke="#3182ce"
                    fill="#3182ce"
                    fillOpacity={0.1}
                    strokeWidth={3}
                    name="Toplam Talepler"
                  />
                  <Area
                    type="monotone"
                    dataKey="tamamlanan"
                    stroke="#38a169"
                    fill="#38a169"
                    fillOpacity={0.1}
                    strokeWidth={3}
                    name="Tamamlanan"
                  />
                </AreaChart>
              </ResponsiveContainer>
              </Box>
      </ElevatedCard>
        </Grid>

        {/* Category Distribution */}
  <Grid size={{ xs: 12, md: 5, lg: 3, xl: 3 }}>
      <ElevatedCard padding={2} sx={{ height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Kategori Dağılımı
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                {categoryData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: item.color,
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      %{item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
      </ElevatedCard>
        </Grid>

        {/* Recent Requests */}
  <Grid size={{ xs: 12, lg: 3, xl: 3 }}>
      <ElevatedCard padding={2} sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Son Talepler
                </Typography>
                <Button variant="text" sx={{ borderRadius: 2 }}>
                  Tümünü Gör
                </Button>
              </Box>
              <List sx={{ p: 0, flexGrow: 1, overflow: 'auto' }}>
                {recentRequests.map((request, index) => (
                  <React.Fragment key={request.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'white' }}>
                          <Package size={20} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {request.title}
                            </Typography>
                            <Chip
                              label={getStatusColor(request.status).label}
                              color={getStatusColor(request.status).color}
                              size="small"
                              sx={{ borderRadius: 2 }}
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                              <strong>Talep No:</strong> {request.id} | <strong>Firma:</strong> {request.company}
                            </span>
                            <br />
                            <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                              <strong>Talep Eden:</strong> {request.requester} | {request.date}
                            </span>
                          </React.Fragment>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {request.amount}
                        </Typography>
                        <IconButton size="small">
                          <MoreVertical size={16} />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < recentRequests.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
      </ElevatedCard>
        </Grid>
      </Grid>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Detayları Gör</MenuItem>
        <MenuItem onClick={handleMenuClose}>Rapor Al</MenuItem>
        <MenuItem onClick={handleMenuClose}>Ayarlar</MenuItem>
      </Menu>
    </Box>
  );
};

export default ProcurementDashboard;
