import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  InputBase,
  alpha,
  useTheme as useMuiTheme,
  Button,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  Bell,
  Mail,
  Settings,
  User,
  LogOut,
  Globe,
  Maximize2,
  Minimize2,
  Sun,
  Moon
} from 'lucide-react';
import AuthContext from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ExchangeRatesWidget from './ExchangeRatesWidget';

const ProcurementHeader = ({ onDrawerToggle, title = "Kontrol Paneli" }) => {
  const muiTheme = useMuiTheme();
  const { mode, toggleTheme } = useTheme();
  const { logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleDarkMode = () => toggleTheme();

  const notifications = [
    {
      id: 1,
      title: 'Yeni talep onayı bekleniyor',
      message: 'REQ-2024-001 numaralı talep onayınızı bekliyor',
      time: '2 dakika önce',
      type: 'warning'
    },
    {
      id: 2,
      title: 'Teklif alındı',
      message: 'Arduino Uno için 3 yeni teklif geldi',
      time: '15 dakika önce',
      type: 'info'
    },
    {
      id: 3,
      title: 'Teslimat tamamlandı',
      message: 'REQ-2024-045 numaralı siparişiniz teslim edildi',
      time: '1 saat önce',
      type: 'success'
    }
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: muiTheme.palette.background.paper,
        borderBottom: `1px solid ${muiTheme.palette.divider}`,
        color: muiTheme.palette.text.primary,
        zIndex: muiTheme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ px: 3, minHeight: '72px !important' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <IconButton
            edge="start"
            onClick={onDrawerToggle}
            sx={{
              mr: 2,
              color: muiTheme.palette.text.primary,
              '&:hover': {
                backgroundColor: alpha(muiTheme.palette.primary.main, 0.1)
              }
            }}
          >
            <MenuIcon size={24} />
          </IconButton>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Box>

        {/* Center Section - Search */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            maxWidth: 500
          }}
        >
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              backgroundColor: alpha(muiTheme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.1)}`,
              width: '100%',
              maxWidth: 400,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: alpha(muiTheme.palette.primary.main, 0.08),
                borderColor: alpha(muiTheme.palette.primary.main, 0.2)
              },
              '&:focus-within': {
                backgroundColor: muiTheme.palette.background.paper,
                borderColor: muiTheme.palette.primary.main,
                boxShadow: `0 0 0 2px ${alpha(muiTheme.palette.primary.main, 0.1)}`
              }
            }}
          >
            <Box
              sx={{
                padding: muiTheme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: muiTheme.palette.text.secondary
              }}
            >
              <Search size={20} />
            </Box>
            <InputBase
              placeholder="Talep, tedarikçi veya ürün ara..."
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: muiTheme.spacing(1.5, 1, 1.5, 0),
                  paddingLeft: `calc(1em + ${muiTheme.spacing(4)})`,
                  fontSize: '0.95rem'
                }
              }}
            />
          </Box>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Exchange Rates & Translation Status */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <ExchangeRatesWidget />
          </Box>
          <Tooltip title="Çeviri Durumu">
            <Chip
              icon={<Globe size={16} />}
              label="TR/EN"
              size="small"
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                color: 'primary.main',
                borderColor: 'primary.main'
              }}
            />
          </Tooltip>

          {/* Action Buttons */}
          <Tooltip title="Tam Ekran">
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                color: muiTheme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
                  color: muiTheme.palette.primary.main
                }
              }}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Tema Değiştir">
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                color: muiTheme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
                  color: muiTheme.palette.primary.main
                }
              }}
            >
              {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Bildirimler">
            <IconButton
              onClick={handleNotificationOpen}
              sx={{
                color: muiTheme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
                  color: muiTheme.palette.primary.main
                }
              }}
            >
              <Badge badgeContent={notifications.length} color="error" max={9}>
                <Bell size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Messages */}
          <Tooltip title="Mesajlar">
            <IconButton
              sx={{
                color: muiTheme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
                  color: muiTheme.palette.primary.main
                }
              }}
            >
              <Badge badgeContent={5} color="info" max={9}>
                <Mail size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ 
              ml: 1,
              '&:hover': {
                backgroundColor: alpha(muiTheme.palette.primary.main, 0.1)
              }
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: muiTheme.palette.primary.main,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              AY
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 2,
            border: `1px solid ${muiTheme.palette.divider}`,
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Ahmet Yılmaz
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ahmet@company.com
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <User size={18} style={{ marginRight: 12 }} />
          Profilim
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <Settings size={18} style={{ marginRight: 12 }} />
          Ayarlar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogOut size={18} style={{ marginRight: 12 }} />
          Çıkış Yap
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            mt: 1,
            width: 360,
            borderRadius: 2,
            border: `1px solid ${muiTheme.palette.divider}`,
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07)'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${muiTheme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Bildirimler
          </Typography>
        </Box>
        {notifications.map((notification) => (
          <MenuItem key={notification.id} onClick={handleNotificationClose} sx={{ py: 2 }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {notification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Button variant="text" size="small">
            Tüm Bildirimleri Gör
          </Button>
        </Box>
      </Menu>
    </AppBar>
  );
};

export default ProcurementHeader;
