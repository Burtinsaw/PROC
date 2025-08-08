import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Badge, Avatar, Box, Button, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { Logout, ManageAccounts, Person, AccountCircle, Fullscreen, FullscreenExit, Language, Settings as SettingsIcon } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { Menu as MenuIcon, Search as SearchIcon, Notifications as NotificationsIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import ExchangeRatesWidget from '../ExchangeRatesWidget';
import Logo from '../common/Logo';
import { useAuth } from '../../contexts/useAuth';
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

const Search = styled('div')(({ theme }) => ({
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
  const { mode, toggleTheme } = useTheme();
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
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
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
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Logo />
        </Box>
        <Search sx={{ ml: 2 }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Ara..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
        {/* right side */}
        <Box sx={{ flexGrow: 1 }} />
        <ExchangeRatesWidget />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Fullscreen */}
          <IconButton onClick={toggleFullscreen} color="inherit">
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          {/* Language */}
          <IconButton onClick={handleLangOpen} color="inherit">
            <Language />
          </IconButton>
          <Menu anchorEl={langAnchor} open={openLang} onClose={handleLangClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem selected={lang==='TR'} onClick={()=>handleLangSelect('TR')}>Türkçe</MenuItem>
            <MenuItem selected={lang==='EN'} onClick={()=>handleLangSelect('EN')}>English</MenuItem>
          </Menu>
          {/* Settings */}
          <IconButton color="inherit" onClick={()=> navigate('/settings')}>
            <SettingsIcon />
          </IconButton>
          {/* Notifications */}
          <IconButton size="large" aria-label="show notifications" color="inherit" onClick={handleNotifOpen}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
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
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          {/* Profile menu */}
          <Avatar onClick={handleOpen} src={user?.avatarUrl || undefined} sx={{ ml: 2, bgcolor: 'secondary.main', cursor: 'pointer' }}>
            {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Menu anchorEl={anchorEl} open={openMenu} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem disabled>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'Kullanıcı'}
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
              Profilim
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/change-password'); }}>
              <ListItemIcon><ManageAccounts fontSize="small" /></ListItemIcon>
              Şifre Değiştir
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
