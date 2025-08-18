import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Badge, Avatar, Box, Button, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { LogOut, UserCog, User, UserCircle, Maximize, Minimize, Globe, Settings, Menu as MenuIconLucide, Search, Bell, Sun, Moon } from 'lucide-react';
import { styled, alpha } from '@mui/material/styles';
import { useAppTheme } from '../../contexts/useAppTheme';
import ExchangeRatesWidget from '../ExchangeRatesWidget';
import Logo from '../common/Logo';
import { useAuth } from '../../contexts/useAuth';
import axios from '../../utils/axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => !['open','drawerWidth'].includes(prop),
})(({ theme, open, drawerWidth }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(17,24,39,0.95) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f6f9ff 100%)',
  color: theme.palette.mode === 'dark' ? '#e6edf3' : theme.palette.text.primary,
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 0,
  },
}));

// renamed to avoid clashing with lucide-react Search icon import
const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Header = ({ open, handleDrawerOpen, drawerWidth }) => {
  const { mode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifAnchor, setNotifAnchor] = React.useState(null);
  const [langAnchor, setLangAnchor] = React.useState(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [lang, setLang] = React.useState(() => localStorage.getItem('lang') || 'TR');
  const openMenu = Boolean(anchorEl);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { handleClose(); logout(); navigate('/login', { replace: true }); };
  const openNotif = Boolean(notifAnchor);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const openLang = Boolean(langAnchor);
  const handleLangOpen = (e) => setLangAnchor(e.currentTarget);
  const handleLangClose = () => setLangAnchor(null);
  const handleLangSelect = (code) => { setLang(code); localStorage.setItem('lang', code); handleLangClose(); };
  const [searchText, setSearchText] = React.useState('');
  const [showFxWidget, setShowFxWidget] = React.useState(true);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    try {
      const v = localStorage.getItem('showFxWidget');
      if (v === 'false') setShowFxWidget(false);
    } catch { /* ignore */ }
  }, []);

  const tryQuickNavigate = async (value) => {
    const v = (value || '').trim();
    if (!v) return;
    const pfPattern = /^PF-\d{4}-\d{4}$/i;
  const poPattern = /^PO-\d{4}-\d{3,5}$/i;
  if (pfPattern.test(v)) {
      try {
        const { data } = await axios.get(`/proformas/by-number/${encodeURIComponent(v)}`);
        const company = data?.proforma?.Company?.name || 'Firma';
        const total = data?.proforma?.totalAmount;
        toast.success(`Proforma bulundu: ${v} • ${company}${total ? ` • Toplam: ${total}` : ''}`);
  // Optional: remember last PF
  try { localStorage.setItem('lastProforma', v); } catch { /* ignore storage set */ }
        navigate(`/proforma/${encodeURIComponent(v)}`);
      } catch (err) {
        if (err?.response?.status === 404) {
          toast.warning('Proforma bulunamadı');
        } else {
          toast.error('Proforma sorgusu başarısız');
        }
      }
    } else if (poPattern.test(v)) {
      try {
        const { data } = await axios.get(`/purchase-orders/by-number/${encodeURIComponent(v)}`);
        const supplier = data?.supplier?.name || 'Tedarikçi';
        const total = data?.totalAmount;
        toast.success(`PO bulundu: ${v} • ${supplier}${total ? ` • Toplam: ${total}` : ''}`);
        navigate(`/purchase-orders/${data?.id}`);
      } catch (err) {
        if (err?.response?.status === 404) toast.warning('PO bulunamadı'); else toast.error('PO sorgusu başarısız');
      }
    }
  };

  const notifications = [
    { id: 1, title: 'Yeni talep onayı bekleniyor', time: '2 dk önce' },
    { id: 2, title: '3 yeni teklif alındı', time: '15 dk önce' },
    { id: 3, title: 'Teslimat tamamlandı', time: '1 saat önce' }
  ];

  return (
    <StyledAppBar position="fixed" open={open} drawerWidth={drawerWidth}>
      <Toolbar sx={(theme) => ({ minHeight: theme.mixins.toolbar.minHeight || 64, gap: 1 })}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{ mr: 2, ...(open && { display: 'none' }) }}
        >
          <MenuIconLucide size={20} />
        </IconButton>
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Logo />
        </Box>
    <SearchContainer sx={{ ml: 2 }}>
          <SearchIconWrapper>
            <Search size={16} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Ara..."
            inputProps={{ 'aria-label': 'search' }}
      value={searchText}
      onChange={(e)=> setSearchText(e.target.value)}
      onKeyDown={(e)=> { if (e.key === 'Enter') { tryQuickNavigate(searchText); } }}
          />
    </SearchContainer>
        {/* right side */}
        <Box sx={{ flexGrow: 1 }} />
  {showFxWidget && <ExchangeRatesWidget />}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Fullscreen */}
          <IconButton onClick={toggleFullscreen} color="inherit">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </IconButton>
          {/* Language */}
          <IconButton onClick={handleLangOpen} color="inherit">
            <Globe size={18} />
          </IconButton>
          <Menu anchorEl={langAnchor} open={openLang} onClose={handleLangClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem selected={lang==='TR'} onClick={()=>handleLangSelect('TR')}>Türkçe</MenuItem>
            <MenuItem selected={lang==='EN'} onClick={()=>handleLangSelect('EN')}>English</MenuItem>
          </Menu>
          {/* Settings */}
          <IconButton color="inherit" onClick={()=> navigate('/settings')}>
            <Settings size={18} />
          </IconButton>
          {/* Notifications */}
          <IconButton size="large" aria-label="show notifications" color="inherit" onClick={handleNotifOpen}>
            <Badge badgeContent={notifications.length} color="error">
              <Bell size={18} />
            </Badge>
          </IconButton>
          <Menu anchorEl={notifAnchor} open={openNotif} onClose={handleNotifClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            {notifications.map(n => (
              <MenuItem key={n.id} onClick={handleNotifClose} sx={{ display: 'block', whiteSpace: 'normal', lineHeight: 1.2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{n.title}</Typography>
                <Typography variant="caption" color="text.secondary">{n.time}</Typography>
              </MenuItem>
            ))}
            {notifications.length === 0 && <MenuItem disabled>Bildirim yok</MenuItem>}
          </Menu>
          {/* Theme toggle */}
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          {/* Profile menu */}
          <Avatar onClick={handleOpen} src={user?.avatarUrl || undefined} sx={{ ml: 2, bgcolor: 'secondary.main', cursor: 'pointer' }}>
            {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Menu anchorEl={anchorEl} open={openMenu} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem disabled>
              <ListItemIcon><User size={16} /></ListItemIcon>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'Kullanıcı'}
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
              <ListItemIcon><Settings size={16} /></ListItemIcon>
              Ayarlar
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              <ListItemIcon><UserCircle size={16} /></ListItemIcon>
              Profilim
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/change-password'); }}>
              <ListItemIcon><UserCog size={16} /></ListItemIcon>
              Şifre Değiştir
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogOut size={16} /></ListItemIcon>
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
