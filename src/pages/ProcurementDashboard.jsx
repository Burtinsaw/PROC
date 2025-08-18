import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, Badge, Divider, List, ListItem, ListItemAvatar, ListItemText, Button, Checkbox, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import ContentContainer from '../components/layout/ContentContainer';
import ElevatedCard from '../components/ui/ElevatedCard';
import { ShoppingCart, Clock, CheckCircle, Users, Package, MoreVertical, Plus, Filter, Download, ListTodo, ClipboardCheck, FileText, Sparkles, Search } from 'lucide-react';
import { lazy, Suspense } from 'react';
const MonthlyTrendsChart = lazy(() => import('../components/charts/MonthlyTrendsChart'));
const CategoryDistributionPie = lazy(() => import('../components/charts/CategoryDistributionPie'));
import { useTheme } from '@mui/material/styles';
import MetricCard from '../components/common/MetricCard';
import UniversalStatusChip from '../components/common/UniversalStatusChip';
import { useAuth } from '../contexts/useAuth';
import { useAppTheme } from '../contexts/useAppTheme';
import { UniversalPageHeader } from '../components/universal';

// Business Components
import { 
  BusinessMetricCard, 
  BusinessSectionCard 
} from '../components/business/BusinessLayoutComponents';

// Procurement Components
import { 
  ProcurementMetricCard, 
  ProcurementSectionCard,
  ProcurementFilterBar 
} from '../components/procurement/ProcurementComponents';

// Sample Data - Theme-aware colors
const dashboardStats = [
  {
    title: 'Toplam Talepler',
    value: '1,247',
    change: '+12.5%',
    changeType: 'increase',
    icon: ShoppingCart,
    color: 'primary.main' // Theme-aware color
  },
  {
    title: 'Bekleyen Onaylar',
    value: '23',
    change: '-8.2%',
    changeType: 'decrease',
    icon: Clock,
    color: 'warning.main' // Theme-aware color
  },
  {
    title: 'Tamamlanan',
    value: '892',
    change: '+15.3%',
    changeType: 'increase',
    icon: CheckCircle,
    color: 'success.main' // Theme-aware color
  },
  {
    title: 'Aktif Tedarikçiler',
    value: '156',
    change: '+4.1%',
    changeType: 'increase',
    icon: Users,
    color: 'secondary.main' // Theme-aware color
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

// categoryData tema renkleri runtime'da derive edilecek (component içinde)
let categoryData = [];

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

// Status color handled by StatusChip

const ProcurementDashboard = () => {
  const { user } = useAuth();
  const { preset } = useAppTheme(); // Business preset'i kontrol etmek için
  const [anchorEl, setAnchorEl] = useState(null);
  const [todos, setTodos] = useState([
    { id: 't1', title: 'Onay bekleyen talepler', hint: 'Talep listesi', link: '/talep/bekleyen', icon: Clock, done: false },
    { id: 't2', title: 'RFQ yanıt bekleyenler', hint: 'Teklifler', link: '/rfqs', icon: ListTodo, done: false },
    { id: 't3', title: 'Teslimatı yaklaşan siparişler', hint: 'Lojistik', link: '/shipments', icon: ClipboardCheck, done: false },
    { id: 't4', title: 'Muhasebe bekleyen faturalar', hint: 'Finans', link: '/finance', icon: CheckCircle, done: false },
  ]);
  const theme = useTheme();
  // Dinamik selamlama: saat başına güncellenir
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const greeting = (() => {
    const h = new Date(clock).getHours();
    if (h >= 5 && h < 12) return 'Günaydın';
    if (h >= 12 && h < 17) return 'İyi günler';
    if (h >= 17 && h < 22) return 'İyi akşamlar';
    return 'İyi geceler';
  })();
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;
  const warn = theme.palette.warning.main;
  const info = theme.palette.info.main;
  const error = theme.palette.error.main;
  categoryData = [
    { name: 'Elektronik', value: 35, color: primary },
    { name: 'Makine', value: 25, color: success },
    { name: 'Hammadde', value: 20, color: warn },
    { name: 'Kimyasal', value: 12, color: info },
    { name: 'Diğer', value: 8, color: error }
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleTodo = (id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const [showQuickActions, setShowQuickActions] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [_DASHBOARD_BG, setDashboardBg] = useState('');
  const [_BG_BLUR, setBgBlur] = useState(0);
  const [_BG_DIM, setBgDim] = useState(0);
  const [_APPLY_GLOBAL, setApplyGlobal] = useState(false);
  useEffect(()=>{
    try {
      const sqa = localStorage.getItem('showQuickActions');
      if (sqa === 'false') setShowQuickActions(false);
      const rm = localStorage.getItem('reduceMotion');
      if (rm === 'true') setReduceMotion(true);
  const bg = localStorage.getItem('dashboardBg');
      if (bg) setDashboardBg(bg);
  const blur = Number(localStorage.getItem('dashboardBgBlur') || '0');
  setBgBlur(isNaN(blur) ? 0 : blur);
  const dim = Number(localStorage.getItem('dashboardBgDim') || '0');
  setBgDim(isNaN(dim) ? 0 : dim);
  const ag = localStorage.getItem('applyBgGlobally') === 'true';
  setApplyGlobal(ag);
    } catch { /* ignore */ }
  }, []);
  // Ayarlar canlı güncellemeleri (global arka plan vb.)
  useEffect(() => {
    const onCfg = () => {
      try {
        const ag = localStorage.getItem('applyBgGlobally') === 'true';
        setApplyGlobal(ag);
        const bg = localStorage.getItem('dashboardBg');
        setDashboardBg(bg || '');
        const blur = Number(localStorage.getItem('dashboardBgBlur') || '0');
        setBgBlur(isNaN(blur) ? 0 : blur);
        const dim = Number(localStorage.getItem('dashboardBgDim') || '0');
        setBgDim(isNaN(dim) ? 0 : dim);
      } catch { /* ignore */ }
    };
    window.addEventListener('appConfigUpdated', onCfg);
    return () => window.removeEventListener('appConfigUpdated', onCfg);
  }, []);

  return (
    <ContentContainer
      disableGutters
  sx={{ position: 'relative', minHeight: 'calc(100vh - 64px)', gap: 4 }}
    >
      {/* Header Section */}
      <Box sx={{ width: '100%' }}>
        <UniversalPageHeader
          title="Satın Alma Kontrol Paneli"
          subtitle={(() => {
            const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.username || '';
            return `${greeting}${fullName ? `, ${fullName}` : ''}! İşte bugünkü özet bilgileriniz.`;
          })()}
          actions={showQuickActions ? [
            <Button key="new-request" size="small" variant="outlined" startIcon={<Plus size={16} />} onClick={()=> window.location.assign('/talep/yeni')}>Yeni Talep</Button>,
            <Button key="rfq" size="small" variant="outlined" startIcon={<FileText size={16} />} onClick={()=> window.location.assign('/satinalma/rfq/olustur')}>Hızlı RFQ</Button>,
            <Button key="po" size="small" variant="outlined" startIcon={<Package size={16} />} onClick={()=> window.location.assign('/purchase-orders')}>PO'lar</Button>,
            <Button key="approvals" size="small" variant="outlined" startIcon={<ListTodo size={16} />} onClick={()=> window.location.assign('/talep/bekleyen')}>Onaylar</Button>,
            <Button key="search" size="small" variant="outlined" startIcon={<Search size={16} />} onClick={()=> window.location.assign('/suppliers')}>Tedarikçi Ara</Button>
          ] : []}
        />
      </Box>

      {/* Stats Cards */}
      <Grid container rowSpacing={2} columnSpacing={2} sx={{ mb: 1, width: '100%', mx: 0 }}>
        {dashboardStats.map((stat, index) => (
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }} key={index}>
            {preset === 'business' ? (
              <BusinessMetricCard
                title={stat.title}
                value={stat.value}
                subtitle="Bu ay"
                trend={stat.changeType === 'increase' ? 'up' : 'down'}
                trendValue={stat.change}
                status={stat.changeType === 'increase' ? 'success' : 'warning'}
                dense
              />
            ) : preset === 'procurement' ? (
              <ProcurementMetricCard
                title={stat.title}
                value={stat.value}
                subtitle="Current month"
                trend={stat.changeType === 'increase' ? 'up' : 'down'}
                trendValue={stat.change}
                status={stat.changeType === 'increase' ? 'success' : 'warning'}
                dense
              />
            ) : (
              <MetricCard
                icon={stat.icon}
                value={stat.value}
                label={stat.title}
                delta={stat.change}
                deltaType={stat.changeType}
                color={stat.color}
              />
            )}
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
                <Suspense fallback={<Typography variant="body2" color="text.secondary">Grafik yükleniyor…</Typography>}>
                  <MonthlyTrendsChart data={monthlyData} reduceMotion={reduceMotion} />
                </Suspense>
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
                <Suspense fallback={<Typography variant="body2" color="text.secondary">Grafik yükleniyor…</Typography>}>
                  <CategoryDistributionPie data={categoryData} reduceMotion={reduceMotion} height={220} />
                </Suspense>
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
                            <UniversalStatusChip status={request.status} />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ color: 'text.secondary' }}>
                            <Box component="span">
                              <Box component="span" sx={{ fontWeight: 600 }}>Talep No:</Box> {request.id} {' | '}<Box component="span" sx={{ fontWeight: 600 }}>Firma:</Box> {request.company}
                            </Box>
                            <br />
                            <Box component="span">
                              <Box component="span" sx={{ fontWeight: 600 }}>Talep Eden:</Box> {request.requester} {' | '} {request.date}
                            </Box>
                          </Box>
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

          {/* To-Do / Yapılacaklar */}
          <Grid size={{ xs: 12, lg: 3, xl: 3 }}>
            <ElevatedCard padding={2} sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Yapılacaklar
                </Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {todos.map(item => {
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={item.id}>
                      <ListItem sx={{ px: 0, py: 1 }} secondaryAction={
                        <Button size="small" variant="text" onClick={()=> window.location.assign(item.link)}>Git</Button>
                      }>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: item.done ? 'success.light' : 'info.light', color: 'white' }}>
                            <Icon size={18} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Stack direction="row" alignItems="center" spacing={1}>
                            <Checkbox size="small" checked={item.done} onChange={()=> toggleTodo(item.id)} />
                            <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</Typography>
                          </Stack>}
                          secondary={<Typography variant="caption" color="text.secondary">{item.hint}</Typography>}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })}
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
  </ContentContainer>
  );
};

export default ProcurementDashboard;
