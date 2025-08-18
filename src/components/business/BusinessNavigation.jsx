// Business Navigation Components
// Enterprise-style navigation system inspired by SAP Fiori, Oracle Fusion

import React, { useState } from 'react';
import { 
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Dashboard,
  ShoppingCart,
  Inventory,
  People,
  LocalShipping,
  AttachMoney,
  Assessment,
  Settings,
  ExpandLess,
  ExpandMore,
  Circle,
  Notifications,
  Search,
  Menu as MenuIcon
} from '@mui/icons-material';

// Business Navigation Item Component
const BusinessNavItem = ({ 
  item, 
  level = 0, 
  isSelected = false, 
  onClick,
  dense = true 
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else {
      onClick?.(item);
    }
  };

  const paddingLeft = 16 + (level * 16);

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleClick}
          selected={isSelected}
          sx={{
            pl: `${paddingLeft}px`,
            py: dense ? 0.5 : 1,
            minHeight: dense ? 36 : 48,
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              borderLeft: `3px solid ${theme.palette.primary.main}`,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.12)
              }
            },
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              borderRadius: 1
            }
          }}
        >
          <ListItemIcon 
            sx={{ 
              minWidth: dense ? 32 : 40,
              color: isSelected ? theme.palette.primary.main : 'inherit'
            }}
          >
            {item.icon}
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: dense ? '0.75rem' : '0.875rem',
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? theme.palette.primary.main : 'inherit'
                  }}
                >
                  {item.label}
                </Typography>
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="primary"
                    sx={{ 
                      fontSize: '0.625rem',
                      height: 16,
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                )}
              </Box>
            }
          />
          
          {hasChildren && (
            <Box sx={{ ml: 1 }}>
              {open ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
            </Box>
          )}
        </ListItemButton>
      </ListItem>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {item.children.map((child, index) => (
              <BusinessNavItem
                key={index}
                item={child}
                level={level + 1}
                isSelected={child.path === isSelected}
                onClick={onClick}
                dense={dense}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

// Business Sidebar Navigation
export const BusinessSidebar = ({ 
  open = true,
  selectedPath,
  onNavigate,
  dense = true,
  width = 280 
}) => {
  const theme = useTheme();

  // Navigation menu structure
  const navigationItems = [
    {
      label: 'Ana Sayfa',
      icon: <Dashboard sx={{ fontSize: dense ? 18 : 20 }} />,
      path: '/dashboard'
    },
    {
      label: 'Satın Alma',
      icon: <ShoppingCart sx={{ fontSize: dense ? 18 : 20 }} />,
      children: [
        { 
          label: 'RFQ Yönetimi', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/rfq',
          badge: '12'
        },
        { 
          label: 'Satın Alma Talepleri', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/requests' 
        },
        { 
          label: 'Teklif Karşılaştırma', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/compare' 
        },
        { 
          label: 'Onay Süreçleri', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/approvals',
          badge: '5'
        }
      ]
    },
    {
      label: 'Stok Yönetimi',
      icon: <Inventory sx={{ fontSize: dense ? 18 : 20 }} />,
      children: [
        { 
          label: 'Stok Durumu', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/inventory/status' 
        },
        { 
          label: 'Giriş/Çıkış', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/inventory/movements' 
        },
        { 
          label: 'Depo Yönetimi', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/inventory/warehouse' 
        }
      ]
    },
    {
      label: 'Tedarikçiler',
      icon: <People sx={{ fontSize: dense ? 18 : 20 }} />,
      children: [
        { 
          label: 'Tedarikçi Listesi', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/suppliers/list' 
        },
        { 
          label: 'Performans Değerlendirme', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/suppliers/performance' 
        },
        { 
          label: 'Sözleşmeler', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/suppliers/contracts' 
        }
      ]
    },
    {
      label: 'Sevkiyat',
      icon: <LocalShipping sx={{ fontSize: dense ? 18 : 20 }} />,
      children: [
        { 
          label: 'Sevkiyat Takibi', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/shipping/tracking' 
        },
        { 
          label: 'Teslimat Planı', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/shipping/schedule' 
        }
      ]
    },
    {
      label: 'Finansal',
      icon: <AttachMoney sx={{ fontSize: dense ? 18 : 20 }} />,
      children: [
        { 
          label: 'Ödemeler', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/finance/payments' 
        },
        { 
          label: 'Faturalar', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/finance/invoices' 
        },
        { 
          label: 'Bütçe Takibi', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/finance/budget' 
        }
      ]
    },
    {
      label: 'Raporlar',
      icon: <Assessment sx={{ fontSize: dense ? 18 : 20 }} />,
      children: [
        { 
          label: 'Satın Alma Raporları', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/reports/procurement' 
        },
        { 
          label: 'Stok Raporları', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/reports/inventory' 
        },
        { 
          label: 'Finansal Raporlar', 
          icon: <Circle sx={{ fontSize: 8 }} />, 
          path: '/reports/financial' 
        }
      ]
    }
  ];

  const bottomItems = [
    {
      label: 'Ayarlar',
      icon: <Settings sx={{ fontSize: dense ? 18 : 20 }} />,
      path: '/settings'
    }
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.background.paper,
          transform: open ? 'translateX(0)' : `translateX(-${width}px)`,
          transition: theme.transitions.create('transform', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          })
        }
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          p: dense ? 1.5 : 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: alpha(theme.palette.primary.main, 0.02)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: dense ? 32 : 40,
              height: dense ? 32 : 40,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShoppingCart sx={{ color: 'white', fontSize: dense ? 18 : 20 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: dense ? '0.875rem' : '1rem',
                lineHeight: 1.2
              }}
            >
              Satın Alma Sistemi
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
              v2.1.0
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List dense={dense}>
          {navigationItems.map((item, index) => (
            <BusinessNavItem
              key={index}
              item={item}
              isSelected={selectedPath}
              onClick={onNavigate}
              dense={dense}
            />
          ))}
        </List>
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', py: 1 }}>
        <List dense={dense}>
          {bottomItems.map((item, index) => (
            <BusinessNavItem
              key={index}
              item={item}
              isSelected={selectedPath}
              onClick={onNavigate}
              dense={dense}
            />
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

// Business Top Navigation Bar
export const BusinessTopBar = ({ 
  onMenuClick,
  onSearchClick,
  onNotificationClick,
  dense = true
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: dense ? 56 : 64,
        backgroundColor: theme.palette.background.paper,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 2,
        position: 'sticky',
        top: 'var(--app-header-h)',
        zIndex: theme.zIndex.appBar - 1
      }}
    >
      {/* Menu Toggle */}
      <IconButton
        size="small"
        onClick={onMenuClick}
        sx={{ p: 1 }}
      >
        <MenuIcon sx={{ fontSize: dense ? 20 : 24 }} />
      </IconButton>

      {/* Search */}
      <Box sx={{ flex: 1, maxWidth: 400 }}>
        <Box
          onClick={onSearchClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.primary, 0.08)
            }
          }}
        >
          <Search sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Ara... (Ctrl+K)
          </Typography>
        </Box>
      </Box>

      {/* Right Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Bildirimler">
          <IconButton
            size="small"
            onClick={onNotificationClick}
            sx={{ position: 'relative' }}
          >
            <Notifications sx={{ fontSize: dense ? 18 : 20 }} />
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                backgroundColor: 'error.main',
                borderRadius: '50%'
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default {
  BusinessSidebar,
  BusinessTopBar,
  BusinessNavItem
};
