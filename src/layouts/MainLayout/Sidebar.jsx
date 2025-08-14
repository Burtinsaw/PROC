import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Stack,
  Chip,
  useMediaQuery,
  Avatar,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';

// project imports
import { drawerWidth, headerHeight } from '../../config';
import BackendStatus from '../../components/BackendStatus';

// assets
import {
  Home, 
  ShoppingCart, 
  FileText, 
  Users, 
  Settings,
  BarChart3,
  Package,
  CreditCard,
  Truck,
  Calendar,
  Shield,
  Database,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

// Navigation items
const navigationItems = [
  {
    id: 'dashboard',
    title: 'Ana Sayfa',
    type: 'group',
    children: [
      {
        id: 'dashboard-default',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: Home,
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'procurement',
    title: 'Satın Alma',
    type: 'group',
    children: [
      {
        id: 'orders',
        title: 'Siparişler',
        type: 'item',
        url: '/orders',
        icon: ShoppingCart,
        chip: {
          label: '12',
          color: 'error'
        }
      },
      {
        id: 'products',
        title: 'Ürünler',
        type: 'item',
        url: '/products',
        icon: Package
      },
      {
        id: 'suppliers',
        title: 'Tedarikçiler',
        type: 'item',
        url: '/suppliers',
        icon: Building2,
        chip: {
          label: '5',
          color: 'success'
        }
      },
      {
        id: 'contracts',
        title: 'Sözleşmeler',
        type: 'item',
        url: '/contracts',
        icon: FileText
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operasyonlar',
    type: 'group',
    children: [
      {
        id: 'payments',
        title: 'Ödemeler',
        type: 'item',
        url: '/payments',
        icon: CreditCard,
        chip: {
          label: '3',
          color: 'warning'
        }
      },
      {
        id: 'delivery',
        title: 'Teslimat',
        type: 'item',
        url: '/delivery',
        icon: Truck
      },
      {
        id: 'planning',
        title: 'Planlama',
        type: 'item',
        url: '/planning',
        icon: Calendar
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analiz & Raporlar',
    type: 'group',
    children: [
      {
        id: 'analytics',
        title: 'Analitik',
        type: 'item',
        url: '/analytics',
        icon: BarChart3
      }
    ]
  },
  {
    id: 'system',
    title: 'Sistem',
    type: 'group',
    children: [
      {
        id: 'company-management',
        title: 'Şirket Yönetimi',
        type: 'item',
        url: '/company',
        icon: Building2
      },
      {
        id: 'user-management',
        title: 'Kullanıcı Yönetimi',
        type: 'item',
        url: '/admin',
        icon: Users
      },
      {
        id: 'permissions',
        title: 'Yetkilendirme',
        type: 'item',
        url: '/permissions',
        icon: Shield
      },
      {
        id: 'data',
        title: 'Veri Yönetimi',
        type: 'item',
        url: '/data',
        icon: Database
      },
      {
        id: 'settings',
        title: 'Ayarlar',
        type: 'item',
        url: '/settings',
        icon: Settings
      }
    ]
  }
];

// ==============================|| SIDEBAR ||============================== //

const Sidebar = ({ open, handleDrawerToggle, window }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // UX enhancements state
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar:collapsed') === '1'; } catch { return false; }
  });
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState({});

  // initialize open groups based on current route
  useEffect(() => {
    const stored = (() => { try { return JSON.parse(localStorage.getItem('sidebar:openGroups')||'{}'); } catch { return {}; } })();
    const initial = { ...stored };
    navigationItems.forEach(g => {
      if (g.type !== 'group') return;
      const hasActive = (g.children||[]).some(c => c.url === location.pathname);
      if (stored[g.id] == null) initial[g.id] = hasActive; // default open if contains active
    });
    setOpenGroups(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0'); } catch { /* ignore */ }
  }, [collapsed]);
  useEffect(() => {
    try { localStorage.setItem('sidebar:openGroups', JSON.stringify(openGroups)); } catch { /* ignore */ }
  }, [openGroups]);

  const handleNavigation = (url) => {
    navigate(url);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const isActive = (url) => {
    return location.pathname === url;
  };

  const handleGroupToggle = (groupId) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const effectiveWidth = collapsed ? 80 : drawerWidth;

  const filteredNav = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return navigationItems;
    return navigationItems.map(g => ({
      ...g,
      children: (g.children||[]).filter(c => c.title.toLowerCase().includes(q))
    })).filter(g => (g.children||[]).length > 0);
  }, [search]);

  const renderNavItems = (items) => {
    return items.map((item) => {
      if (item.type === 'group') {
        return (
          <Box key={item.id} sx={{ mb: 1.5 }}>
            <ListItem disablePadding sx={{ px: 1.5 }}>
              <ListItemButton
                onClick={() => handleGroupToggle(item.id)}
                sx={{
                  borderRadius: 1.5,
                  py: 1,
                  px: 1.5,
                  minHeight: 36,
                  '&:hover': { backgroundColor: theme.palette.action.hover }
                }}
              >
                {!collapsed && (
                  <ListItemText
                    primary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 1
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                  />
                )}
                <ChevronDown size={16} style={{ transform: openGroups[item.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </ListItemButton>
            </ListItem>
            <List sx={{ py: 0, display: openGroups[item.id] ? 'block' : 'none' }}>
              {item.children?.map((child) => {
                const Icon = child.icon;
                const active = isActive(child.url);

                const itemButton = (
                  <ListItemButton
                    onClick={() => handleNavigation(child.url)}
                    sx={{
                      borderRadius: 2,
                      py: 1.1,
                      px: collapsed ? 1 : 2,
                      minHeight: 44,
                      backgroundColor: active ? theme.palette.primary.lighter : 'transparent',
                      color: active ? theme.palette.primary.main : theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: active
                          ? theme.palette.primary.lighter
                          : theme.palette.action.hover
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, mr: collapsed ? 0 : 1, color: 'inherit', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={child.title}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: active ? 600 : 500, color: 'inherit' }}
                      />
                    )}
                    {!collapsed && child.chip && (
                      <Chip
                        label={child.chip.label}
                        size="small"
                        color={child.chip.color}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, '& .MuiChip-label': { px: 1 } }}
                      />
                    )}
                  </ListItemButton>
                );

                return (
                  <ListItem key={child.id} disablePadding sx={{ px: collapsed ? 1 : 2, mb: 0.5 }}>
                    {collapsed ? (
                      <Tooltip title={child.title} placement="right">
                        <Box sx={{ width: '100%' }}>{itemButton}</Box>
                      </Tooltip>
                    ) : itemButton}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        );
      }
      return null;
    });
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background:(t)=> t.palette.mode==='dark' ? 'linear-gradient(180deg,#18222e,#111b24)' : 'linear-gradient(180deg,#ffffff,#f1f5f9)' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: headerHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={collapsed ? 0 : 2} sx={{ width: '100%' }}>
          <Avatar sx={{ width: 32, height: 32, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, fontSize: '0.8rem', fontWeight: 700 }}>SP</Avatar>
          {!collapsed && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: theme.palette.text.primary, lineHeight: 1.2 }}>SatınAlma Pro</Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>Enterprise Solution</Typography>
            </Box>
          )}
        </Stack>
        {/* Collapse toggle only desktop */}
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Tooltip title={collapsed ? 'Genişlet' : 'Daralt'}>
            <IconButton size="small" onClick={() => setCollapsed(v => !v)}>
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, pt: 1, display: collapsed ? 'none' : 'block' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Menüde ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Navigation */}
  <Box sx={{ flex: 1, py: 2, overflowY: 'auto', px: 0.5 }}>
        {renderNavItems(filteredNav)}
      </Box>

      {/* Footer: minimal DB status only, single-line tiny text */}
      <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display:'flex', alignItems:'center', height: 16 }}>
          <BackendStatus dbOnly />
        </Box>
      </Box>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
  <Box component="nav" sx={{ width: { lg: effectiveWidth }, flexShrink: { lg: 0 } }}>
      {/* Mobile Drawer */}
  <Drawer
        container={container}
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
      width: drawerWidth,
    border: '1px solid',
    borderColor: (t)=> t.palette.divider,
    boxShadow: '0 12px 40px -8px rgba(0,0,0,0.28)'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
  <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
      width: effectiveWidth,
    border: '1px solid',
    borderColor: (t)=> t.palette.divider,
    boxShadow: '0 4px 18px -4px rgba(0,0,0,0.12)',
            top: headerHeight,
            height: `calc(100vh - ${headerHeight}px)`
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
