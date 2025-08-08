import React from 'react';
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
  Avatar
} from '@mui/material';

// project imports
import { drawerWidth, headerHeight } from '../../config';

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
  Building2
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

  const handleNavigation = (url) => {
    navigate(url);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const isActive = (url) => {
    return location.pathname === url;
  };

  const renderNavItems = (items) => {
    return items.map((item) => {
      if (item.type === 'group') {
        return (
          <Box key={item.id} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                px: 3,
                py: 1,
                display: 'block',
                color: theme.palette.text.secondary,
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1
              }}
            >
              {item.title}
            </Typography>
            <List sx={{ py: 0 }}>
              {item.children?.map((child) => {
                const Icon = child.icon;
                const active = isActive(child.url);

                return (
                  <ListItem key={child.id} disablePadding sx={{ px: 2, mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigation(child.url)}
                      sx={{
                        borderRadius: 2,
                        py: 1.25,
                        px: 2,
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
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: 'inherit'
                        }}
                      >
                        <Icon size={18} />
                      </ListItemIcon>
                      <ListItemText
                        primary={child.title}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: active ? 600 : 500,
                          color: 'inherit'
                        }}
                      />
                      {child.chip && (
                        <Chip
                          label={child.chip.label}
                          size="small"
                          color={child.chip.color}
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      )}
                    </ListItemButton>
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: headerHeight,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            SP
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: theme.palette.text.primary,
                lineHeight: 1.2
              }}
            >
              SatınAlma Pro
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.7rem'
              }}
            >
              Enterprise Solution
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2, overflowY: 'auto' }}>
        {renderNavItems(navigationItems)}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.grey[50]
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: 'block',
            textAlign: 'center',
            fontSize: '0.7rem'
          }}
        >
          © 2024 SatınAlma Pro v2.0
        </Typography>
      </Box>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
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
            border: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
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
            width: drawerWidth,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
