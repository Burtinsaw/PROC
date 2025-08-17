import React, { useEffect, useMemo, useState } from 'react';
import { Box, IconButton, Typography, Avatar, Tooltip, Breadcrumbs, Link as MuiLink, Badge, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sun, Moon, LogOut, Globe, Bell, Maximize, Minimize, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import navConfig from '../../navigation/navConfig';
import { useAppTheme } from '../../contexts/useAppTheme';
import { useAuth } from '../../contexts/useAuth';
import { getUnreadCount } from '../../api/messages';
import { useChat } from '../../contexts/ChatContext';
import { getCounts as getEmailCounts, harvestContacts } from '../../api/email';
import EmailHeaderToolbar from '../email/EmailHeaderToolbar';

function findMatch(pathname) {
  for(const item of navConfig) {
    if(item.path && pathname.startsWith(item.path)) return item.label;
    if(item.groups) {
      for(const g of item.groups) {
        for(const l of g.links) {
          if(pathname.startsWith(l.path)) return l.label;
        }
      }
    }
  }
  return '';
}

function buildCrumbs(pathname) {
  const crumbs = [];
  // Dashboard / root
  crumbs.push({ label:'Panel', path:'/', icon: Home });
  // Find nav item & link match
  let matchedLink = null;
  let matchedItem = null;
  for(const item of navConfig) {
    if(item.path && pathname.startsWith(item.path)) {
      matchedItem = item;
      break;
    }
    if(item.groups) {
      for(const g of item.groups) {
        for(const l of g.links) {
          if(pathname.startsWith(l.path)) {
            matchedItem = item;
            matchedLink = l;
            break;
          }
        }
        if(matchedLink) break;
      }
    }
    if(matchedItem) break;
  }
  if(matchedItem && matchedItem.path && matchedItem.path !== '/dashboard') {
    crumbs.push({ label: matchedItem.label, path: matchedItem.path });
  }
  if(matchedLink && matchedLink.path !== matchedItem?.path) {
    crumbs.push({ label: matchedLink.label, path: matchedLink.path });
  }
  // Extra segments after matched link for dynamic ids
  const base = matchedLink?.path || matchedItem?.path;
  if(base && pathname.length > base.length) {
    const rest = pathname.slice(base.length).split('/').filter(Boolean);
    let accum = base;
    rest.forEach(seg => {
      accum += '/' + seg;
      const pretty = decodeURIComponent(seg).replace(/[-_]/g,' ');
      crumbs.push({ label: pretty.charAt(0).toUpperCase()+pretty.slice(1), path: accum });
    });
  }
  return crumbs;
}

export default function AppShellHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const chat = useChat();

  const title = useMemo(()=> findMatch(location.pathname), [location.pathname]);
  const breadcrumbs = useMemo(()=> buildCrumbs(location.pathname), [location.pathname]);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [lang, setLang] = useState(()=> localStorage.getItem('lang') || 'TR');
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [langAnchor, setLangAnchor] = useState(null);
  const [unread, setUnread] = useState(0);
  const isEmail = location.pathname.startsWith('/email');
  const isEmailCompose = location.pathname.startsWith('/email/compose');
  // Poll + socket tetikleyici
  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      try {
        const c = await getUnreadCount();
        if (mounted) setUnread(c);
      } catch {
        // sessizce yut (ağ hatası olabilir)
      }
    };
    tick();
    const t = setInterval(tick, 20000);
    const onNew = () => tick();
  const onRead = () => tick();
  chat?.socket?.on?.('message:new', onNew);
  chat?.socket?.on?.('message:read', onRead);
  return () => { mounted = false; clearInterval(t); chat?.socket?.off?.('message:new', onNew); chat?.socket?.off?.('message:read', onRead); };
  }, [chat?.socket]);
  // Route değişince (özellikle /messages altında) sayacı tazele
  useEffect(() => {
    const refresh = async () => {
      try { setUnread(await getUnreadCount()); } catch { /* ignore */ }
    };
    refresh();
  }, [location.pathname]);

  const notifications = [
    { id: 1, title: 'Yeni talep onayı bekleniyor', time: '2 dk önce' },
    { id: 2, title: '3 yeni teklif alındı', time: '15 dk önce' },
    { id: 3, title: 'Teslimat tamamlandı', time: '1 saat önce' }
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // E-posta sayacı (global) – socket ile anlık; polling yedekli
  useEffect(()=>{
    let timer;
  const pull = async ()=>{
      try {
    const counts = await getEmailCounts();
    window.__emailCounts = counts;
  try { window.dispatchEvent(new CustomEvent('email-counts-changed', { detail: counts })); } catch { /* ignore */ }
      } catch { /* ignore */ }
    };
    pull();
    timer = setInterval(pull, 30000);
  const onCounts = (payload)=>{
      if (payload?.counts) {
    window.__emailCounts = payload.counts;
  try { window.dispatchEvent(new CustomEvent('email-counts-changed', { detail: payload.counts })); } catch { /* ignore */ }
      }
    };
    chat?.socket?.on?.('email:counts_changed', onCounts);
    return ()=> { if(timer) clearInterval(timer); chat?.socket?.off?.('email:counts_changed', onCounts); };
  }, [chat?.socket]);

  // Her gün mesai bitimine yakın (16:35) mesajlardan adres toplama (bir kez/gün)
  useEffect(() => {
    let timer;
    let inFlight = false;
    const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const checkAndRun = async () => {
      try {
        const now = new Date();
        const hh = now.getHours();
        const mm = now.getMinutes();
        const today = fmtDate(now);
        const last = localStorage.getItem('contacts.harvest.daily.lastRunDate') || '';
        // 16:35 ve sonrası için, gün içinde bir kez çalıştır
        if (!inFlight && last !== today && (hh > 16 || (hh === 16 && mm >= 35))) {
          inFlight = true;
          try {
            await harvestContacts([]); // tüm hesaplar (kullanıcıya ait) için tarama
            localStorage.setItem('contacts.harvest.daily.lastRunDate', today);
          } catch {
            // Başarısızsa 30 dk sonra tekrar denemek üzere nextTry işareti bırak
            const next = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
            localStorage.setItem('contacts.harvest.daily.nextTryAt', next);
            if (import.meta.env.DEV) console.info('contacts.harvest retry scheduled at', next);
          } finally {
            inFlight = false;
          }
          return;
        }
        // Eğer today çalıştırılmadı ve nextTryAt geçtiyse tekrar dene
        if (!inFlight && last !== today) {
          const nextTryAt = localStorage.getItem('contacts.harvest.daily.nextTryAt');
          if (nextTryAt && new Date(nextTryAt) <= now) {
            inFlight = true;
            try {
              await harvestContacts([]);
              localStorage.setItem('contacts.harvest.daily.lastRunDate', today);
              localStorage.removeItem('contacts.harvest.daily.nextTryAt');
            } catch {
              const next = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
              localStorage.setItem('contacts.harvest.daily.nextTryAt', next);
              if (import.meta.env.DEV) console.info('contacts.harvest retry scheduled at', next);
            } finally {
              inFlight = false;
            }
          }
        }
      } catch {
        // sessizce geç
      }
    };
    // Hemen kontrol et ve sonra her 60 sn’de bir
    checkAndRun();
    timer = setInterval(checkAndRun, 60000);
    return () => { if (timer) clearInterval(timer); };
  }, []);

  return (
    <Box
      component="header"
      sx={(theme)=>(
        {
          position:'sticky', top:0, zIndex: 1010,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          height:'auto',
          px:{ xs:2, sm:2.5, md:3 }, mb:2,
          borderBottom:'1px solid', borderColor: theme.palette.divider,
          background: theme.preset==='aurora'
            ? (theme.palette.mode==='dark'
                ? 'linear-gradient(90deg, rgba(17,24,39,0.85), rgba(17,24,39,0.65))'
                : 'linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,0.6))')
            : theme.palette.background.default,
          backdropFilter: theme.preset==='aurora'? 'blur(18px)' : undefined
        }
      )}
    >
      <Box sx={{ display:'flex', flexDirection:'column', gap:.25, flex:1, overflow:'hidden' }}>
        {!!title && (
          <Typography variant="h6" sx={{ fontWeight:600, letterSpacing:.2, whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden' }}>{title}</Typography>
        )}
        <Breadcrumbs aria-label="breadcrumb" sx={{ '& .MuiBreadcrumbs-separator': { mx:.75 }, fontSize:12 }}>
          {breadcrumbs.map((c,i)=> {
            const Icon = c.icon;
            const last = i === breadcrumbs.length -1;
            // Son olmayan tüm kırıntılar tıklanabilir olsun
            if (!last) {
              return (
                <MuiLink
                  component={Link}
                  to={c.path}
                  key={c.path}
                  underline="hover"
                  color="text.secondary"
                  sx={{ display:'inline-flex', alignItems:'center', fontSize:12 }}
                >
                  {Icon && <Icon size={12} style={{ marginRight:4 }} />}{c.label}
                </MuiLink>
              );
            }
            return (
              <Typography key={c.path} color='text.primary' sx={{ fontSize:12, fontWeight:500, display:'inline-flex', alignItems:'center' }}>
                {Icon && <Icon size={12} style={{ marginRight:4, verticalAlign:'middle' }} />}{c.label}
              </Typography>
            );
          })}
        </Breadcrumbs>
        {isEmail && !isEmailCompose && (
          <Box>
            <EmailHeaderToolbar />
          </Box>
        )}
      </Box>
      <Box sx={{ display:'flex', alignItems:'center', gap:1, pl:1 }}>
        {/* Fullscreen toggle */}
        <Tooltip title={isFullscreen ? 'Pencereden çık' : 'Tam ekran'}>
          <IconButton onClick={toggleFullscreen} size="small" color="default">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </IconButton>
        </Tooltip>
        {/* Language switcher */}
        <Tooltip title={`Dil: ${lang}`}>
          <IconButton size="small" color="default" onClick={(e)=> setLangAnchor(e.currentTarget)}>
            <Globe size={18} />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={langAnchor}
          open={Boolean(langAnchor)}
          onClose={()=> setLangAnchor(null)}
          anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
          transformOrigin={{ vertical:'top', horizontal:'right' }}
        >
          <MenuItem selected={lang==='TR'} onClick={()=> { setLang('TR'); localStorage.setItem('lang','TR'); setLangAnchor(null); }}>Türkçe</MenuItem>
          <MenuItem selected={lang==='EN'} onClick={()=> { setLang('EN'); localStorage.setItem('lang','EN'); setLangAnchor(null); }}>English</MenuItem>
        </Menu>
        {/* Messages (Badge + gerçek zamanlı güncelleme) */}
        <Tooltip title="Mesajlar">
          <IconButton size="small" color="default" component={Link} to="/messages">
            <Badge badgeContent={unread} color="error" overlap="circular" invisible={unread <= 0}>
              <MessageSquare size={18} />
            </Badge>
          </IconButton>
        </Tooltip>
        {/* Notifications */}
        <Tooltip title="Bildirimler">
          <IconButton size="small" color="default" onClick={(e)=> setNotifAnchor(e.currentTarget)}>
            <Badge badgeContent={notifications.length} color="error">
              <Bell size={18} />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={()=> setNotifAnchor(null)}
          anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
          transformOrigin={{ vertical:'top', horizontal:'right' }}
        >
          {notifications.map(n => (
            <MenuItem key={n.id} onClick={()=> setNotifAnchor(null)} sx={{ display:'block', whiteSpace:'normal', lineHeight:1.2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{n.title}</Typography>
              <Typography variant="caption" color="text.secondary">{n.time}</Typography>
            </MenuItem>
          ))}
          {notifications.length === 0 && <MenuItem disabled>Bildirim yok</MenuItem>}
        </Menu>
        <Tooltip title={mode==='dark'? 'Açık tema':'Koyu tema'}>
          <IconButton onClick={toggleTheme} size="small" color="primary" sx={{
            background: mode==='dark'? 'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)',
            '&:hover': { background: mode==='dark'? 'rgba(255,255,255,0.12)':'rgba(0,0,0,0.08)' }
          }}>
            {mode==='dark'? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Çıkış">
          <IconButton size="small" onClick={logout}>
            <LogOut size={18} />
          </IconButton>
        </Tooltip>
        <Avatar
          onClick={()=> navigate('/profile')}
          sx={{ width:32, height:32, cursor:'pointer', bgcolor:'secondary.main', fontSize:14 }}
        >
          {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
        </Avatar>
      </Box>
    </Box>
  );
}
