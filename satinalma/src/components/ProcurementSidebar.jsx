import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Collapse,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Truck,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  FileText,
  DollarSign,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
  {
    id: 'dashboard',
    title: 'Kontrol Paneli',
    icon: LayoutDashboard,
    path: '/dashboard',
    badge: null
  },
  {
    id: 'requests',
    title: 'Talep Yönetimi',
    icon: ShoppingCart,
    badge: 12,
    subItems: [
      { id: 'new-request', title: 'Yeni Talep', icon: FileText, path: '/requests/new' },
      { id: 'pending-requests', title: 'Bekleyen Talepler', icon: Clock, path: '/requests/pending', badge: 8 },
      { id: 'approved-requests', title: 'Onaylanan Talepler', icon: CheckCircle, path: '/requests/approved' },
      { id: 'rejected-requests', title: 'Reddedilen Talepler', icon: AlertTriangle, path: '/requests/rejected' },
      { id: 'all-requests', title: 'Tüm Talepler', icon: FileText, path: '/requests/all' }
    ]
  },
  {
    id: 'procurement',
    title: 'Satın Alma',
    icon: Package,
    badge: 5,
    subItems: [
      { id: 'supplier-search', title: 'Tedarikçi Arama', icon: Search, path: '/procurement/suppliers' },
      { id: 'quotations', title: 'Teklifler', icon: DollarSign, path: '/procurement/quotations', badge: 3 },
      { id: 'comparison', title: 'Teklif Karşılaştırma', icon: BarChart3, path: '/procurement/comparison' },
      { id: 'proforma', title: 'Proforma Yönetimi', icon: FileText, path: '/procurement/proforma' }
    ]
  },
  {
    id: 'logistics',
    title: 'Lojistik',
    icon: Truck,
    badge: 2,
    subItems: [
      { id: 'shipping-quotes', title: 'Nakliye Teklifleri', icon: Truck, path: '/logistics/quotes' },
      { id: 'tracking', title: 'Kargo Takibi', icon: Search, path: '/logistics/tracking' },
      { id: 'delivery', title: 'Teslimat Planı', icon: CheckCircle, path: '/logistics/delivery' }
    ]
  },
  {
    id: 'suppliers',
    title: 'Tedarikçi Yönetimi',
    icon: Users,
    path: '/suppliers'
  },
  {
    id: 'translation',
    title: 'Çeviri Merkezi',
    icon: Globe,
    path: '/translation',
    badge: 4
  },
  {
    id: 'reports',
    title: 'Raporlar',
    icon: BarChart3,
    subItems: [
      { id: 'financial-reports', title: 'Mali Raporlar', icon: DollarSign, path: '/reports/financial' },
      { id: 'performance-reports', title: 'Performans Raporları', icon: BarChart3, path: '/reports/performance' },
      { id: 'supplier-reports', title: 'Tedarikçi Raporları', icon: Users, path: '/reports/suppliers' }
    ]
  }
];

const bottomMenuItems = [
  { id: 'settings', title: 'Ayarlar', icon: Settings, path: '/settings' },
  { id: 'help', title: 'Yardım', icon: HelpCircle, path: '/help' }
];

const ProcurementSidebar = ({ open, onClose, variant = 'persistent' }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState(['requests']);

  const handleItemClick = (item) => {
    if (item.subItems) {
      setExpandedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isItemActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (item.path && isItemActive(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => isItemActive(subItem.path));
    }
    return false;
  };

  const renderMenuItem = (item, isSubItem = false) => {
    const isActive = isParentActive(item);
    const isExpanded = expandedItems.includes(item.id);

    return (
      <Box key={item.id}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              borderRadius: 2,
              mx: 1,
              minHeight: 48,
              backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
              pl: isSubItem ? 4 : 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                color: theme.palette.primary.main
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: 'inherit'
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error" max={99}>
                  <item.icon size={20} />
                </Badge>
              ) : (
                <item.icon size={20} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 500
              }}
            />
            {item.subItems && (
              <Box sx={{ color: 'inherit', ml: 1 }}>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Box>
            )}
          </ListItemButton>
        </ListItem>

        {item.subItems && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.subItems.map(subItem => renderMenuItem(subItem, true))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
              mr: 2
            }}
          >
            <Package size={24} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Procurement
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Satın Alma Sistemi
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              bgcolor: theme.palette.secondary.main
            }}
          >
            AY
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Ahmet Yılmaz
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Satın Alma Müdürü
            </Typography>
          </Box>
          <Badge badgeContent={3} color="error">
            <Bell size={20} color={theme.palette.text.secondary} />
          </Badge>
        </Box>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        <List disablePadding>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
        <List disablePadding>
          {bottomMenuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: theme.palette.background.paper,
          boxShadow: '4px 0 8px rgba(0, 0, 0, 0.05)'
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default ProcurementSidebar;
