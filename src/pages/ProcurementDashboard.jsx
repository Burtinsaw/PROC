import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, Badge, Divider, List, ListItem, ListItemAvatar, ListItemText, Button, Checkbox, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import ContentContainer from '../components/layout/ContentContainer';
import ElevatedCard from '../components/ui/ElevatedCard';
import { ShoppingCart, Clock, CheckCircle, Users, Package, MoreVertical, Plus, Filter, Download, ListTodo, ClipboardCheck, FileText, Sparkles, Search } from 'lucide-react';
import { keyframes } from '@mui/system';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '@mui/material/styles';
import MetricCard from '../components/common/MetricCard';
import StatusChip from '../components/common/StatusChip';

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [todos, setTodos] = useState([
    { id: 't1', title: 'Onay bekleyen talepler', hint: 'Talep listesi', link: '/talep/bekleyen', icon: Clock, done: false },
    { id: 't2', title: 'RFQ yanıt bekleyenler', hint: 'Teklifler', link: '/rfqs', icon: ListTodo, done: false },
    { id: 't3', title: 'Teslimatı yaklaşan siparişler', hint: 'Lojistik', link: '/shipments', icon: ClipboardCheck, done: false },
    { id: 't4', title: 'Muhasebe bekleyen faturalar', hint: 'Finans', link: '/finance', icon: CheckCircle, done: false },
  ]);
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;
  const warn = theme.palette.warning.main;
  const info = theme.palette.info.main;
  const error = theme.palette.error.main;
  const neutralGrid = theme.palette.mode==='dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const axisColor = theme.palette.text.secondary;
  const soft = (c)=> theme.palette.mode==='dark'? `${c}33` : `${c}22`;
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

  // Quick actions animation control: 'hover' | 'always' | 'off' via localStorage 'qaAnimMode'
  const [animMode, setAnimMode] = useState('hover');
  useEffect(() => {
    try { const m = localStorage.getItem('qaAnimMode'); if (m === 'always' || m === 'hover' || m === 'off') setAnimMode(m); }
  catch { /* localStorage not available (SSR or privacy mode) -> ignore */ }
  }, []);
  const [animateQA, setAnimateQA] = useState(false); // hover state (only used when animMode === 'hover')
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [dashboardBg, setDashboardBg] = useState('');
  const [bgBlur, setBgBlur] = useState(0);
  const [bgDim, setBgDim] = useState(0);
  const [applyGlobal, setApplyGlobal] = useState(false);
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
  const twinkle = keyframes`
    0% { transform: scale(1); opacity: .7; }
    50% { transform: scale(1.18); opacity: 1; }
    100% { transform: scale(1); opacity: .7; }
  `;

  return (
    <ContentContainer
      disableGutters
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 64px)',
        gap: 4,
  ...(dashboardBg && !applyGlobal
          ? {
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${dashboardBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: `blur(${bgBlur}px)`,
                transform: 'scale(1.05)'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: `rgba(0,0,0,${bgDim/100})`
              },
              borderRadius: 2,
              p: { xs: 1, sm: 2 }
            }
          : {})
      }}
    >
      {/* Header Section */}
  <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              Satın Alma Kontrol Paneli
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hoş geldiniz! İşte bugünkü özet bilgileriniz.
            </Typography>
          </Box>
          {/* Hızlı İşlemler - dashboard'a özel kompakt bar */}
          {showQuickActions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: (t)=> t.palette.mode==='dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', p: 1, borderRadius: 2 }}
          onMouseEnter={() => { if (animMode === 'hover') setAnimateQA(true); }} onMouseLeave={() => { if (animMode === 'hover') setAnimateQA(false); }}>
        <Box aria-hidden sx={{ color:'warning.main', display:'flex', alignItems:'center', mr: .5, animation: (animMode === 'always' || (animMode === 'hover' && animateQA)) ? `${twinkle} ${reduceMotion? '2.6s' : '1.6s'} ease-in-out infinite` : 'none' }}>
              <Sparkles size={16} />
            </Box>
            <Button size="small" variant="outlined" startIcon={<Plus size={16} />} onClick={()=> window.location.assign('/talep/yeni')}>Yeni Talep</Button>
            <Button size="small" variant="outlined" startIcon={<FileText size={16} />} onClick={()=> window.location.assign('/satinalma/rfq/olustur')}>Hızlı RFQ</Button>
            <Button size="small" variant="outlined" startIcon={<Package size={16} />} onClick={()=> window.location.assign('/purchase-orders')}>PO&apos;lar</Button>
            <Button size="small" variant="outlined" startIcon={<ListTodo size={16} />} onClick={()=> window.location.assign('/talep/bekleyen')}>Onaylar</Button>
            <Button size="small" variant="outlined" startIcon={<Search size={16} />} onClick={()=> window.location.assign('/suppliers')}>Tedarikçi Ara</Button>
          </Box>
          )}

        </Box>
      </Box>

      {/* Stats Cards */}
  <Grid container rowSpacing={2} columnSpacing={2} sx={{ mb: 1, width: '100%', mx: 0 }}>
        {dashboardStats.map((stat, index) => (
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }} key={index}>
            <MetricCard
              icon={stat.icon}
              value={stat.value}
              label={stat.title}
              delta={stat.change}
              deltaType={stat.changeType}
              color={stat.color}
              bgColor={stat.bgColor}
            />
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
                  <CartesianGrid strokeDasharray="3 3" stroke={neutralGrid} />
                  <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
                  <YAxis stroke={axisColor} fontSize={12} />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '12px',
                      boxShadow: theme.palette.mode==='dark'? '0 4px 18px -4px rgba(0,0,0,0.6)': '0 6px 20px -4px rgba(0,0,0,0.12)'
                    }}
                  />
                  <Area isAnimationActive={!reduceMotion} type="monotone" dataKey="talepler" stroke={primary} fill={soft(primary)} strokeWidth={2.4} name="Toplam Talepler" />
                  <Area isAnimationActive={!reduceMotion} type="monotone" dataKey="tamamlanan" stroke={success} fill={soft(success)} strokeWidth={2.4} name="Tamamlanan" />
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
          isAnimationActive={!reduceMotion}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip />
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
                            <StatusChip status={request.status} />
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
