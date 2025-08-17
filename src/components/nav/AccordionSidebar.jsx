import React, { useMemo, useState, useEffect } from 'react';
import { APP_HEADER_HEIGHT } from '../../constants/layout';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Tooltip, IconButton, Typography, Stack, Divider, Badge } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ChevronLeft } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import navConfig from '../../navigation/navConfig';
import { useFeatures } from '../../contexts/FeatureContext';
import BackendStatus from '../BackendStatus';
import { prefetchRoute } from '../../utils/prefetchRoutes';

export const ACC_SIDEBAR_WIDTH = 260;

export default function AccordionSidebar({ leftOffset = 0, topOffset, onCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});
  const [emailCountsVersion, setEmailCountsVersion] = useState(0);

  useEffect(()=>{
    // open the group that contains the current route by default
    const init = {};
    navConfig.forEach(item => {
      if(item.groups) {
        const hasActive = item.groups.some(g => g.links?.some(l => location.pathname.startsWith(l.path)));
        init[item.id] = hasActive;
      }
    });
    setOpenGroups(prev => ({ ...init, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { modules } = useFeatures();
  const items = useMemo(()=> {
    return navConfig.filter(item => {
      if (item.id === 'lojistik' && modules && modules.logistics === false) return false;
      if (item.id === 'finans' && modules && modules.finance === false) return false;
      if (item.id === 'raporlar' && modules && modules.reporting === false) return false;
      return true;
    });
  }, [modules]);

  // Listen for global email counts changes to refresh badge
  useEffect(() => {
    const onChange = () => setEmailCountsVersion(v => v + 1);
    window.addEventListener('email-counts-changed', onChange);
    return () => window.removeEventListener('email-counts-changed', onChange);
  }, []);

  const toggle = (id) => setOpenGroups(prev => {
    const nextOpen = !prev[id];
    // Single-open accordion behavior
    const cleared = Object.keys(prev).reduce((acc,k)=> { acc[k] = false; return acc; }, {});
    return { ...cleared, [id]: nextOpen };
  });
  const isActivePath = (path) => location.pathname.startsWith(path);

  return (
  <Box
      role="navigation"
      aria-label="Uygulama menüsü"
  className="hide-scrollbar"
      sx={(theme)=>(
        {
    position:'fixed',
  top: topOffset ?? APP_HEADER_HEIGHT,
    left: leftOffset, bottom:0,
    width: ACC_SIDEBAR_WIDTH, zIndex: 1195,
        borderRight:'1px solid', borderColor: theme.palette.divider,
        background: theme.preset==='aurora'
          ? (theme.palette.mode==='dark'
              ? 'linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.6))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))')
          : theme.palette.background.paper,
  backdropFilter: theme.preset==='aurora'? 'blur(18px)' : undefined,
  overflowY:'auto',
  WebkitOverflowScrolling: 'touch',
  overscrollBehavior: 'contain'
      })}
    >
  <List disablePadding sx={{ py: 1.5, mt: 2, pb: 28 }}>
        {/* extra top spacing per request */}
        {items.map(item => {
          const Icon = item.icon;
          const activeItem = item.path ? isActivePath(item.path) : item.groups?.some(g => g.links?.some(l => isActivePath(l.path)));
          const open = !!openGroups[item.id];
          const hasChildren = !!item.groups?.length;
          return (
            <Box key={item.id} sx={{ mb: 0.5 }}>
              <Tooltip title={item.label} placement="right" disableInteractive>
                <ListItemButton
                  onClick={() => hasChildren ? toggle(item.id) : (item.path && navigate(item.path))}
                  onMouseEnter={() => { if (item.path) prefetchRoute(item.path); }}
                  onFocus={() => { if (item.path) prefetchRoute(item.path); }}
                  aria-expanded={hasChildren ? open : undefined}
                  sx={(theme)=>(
                    {
                    mx: 1,
                    borderRadius: 1.5,
                    py: 1,
                    pr: 1,
                    transition:'background-color .2s ease, color .2s ease',
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode==='dark'? 0.08 : 0.06) },
                    backgroundColor: activeItem ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                    color: activeItem ? theme.palette.primary.main : theme.palette.text.primary,
                  })}
                >
                  {Icon && (
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      <Icon size={18} />
                    </ListItemIcon>
                  )}
                  <ListItemText primaryTypographyProps={{ fontWeight: activeItem? 700: 600, fontSize: 13, textTransform:'uppercase', letterSpacing: .4 }} primary={item.label} />
                  {hasChildren && (
                    <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform .2s ease' }} />
                  )}
                </ListItemButton>
              </Tooltip>
              {hasChildren && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ py: 0.5 }}>
                    {item.groups.map(group => (
                      <Box key={group.id} sx={{ mb: 0.5 }}>
                        {group.label && (
                          <Box sx={(theme)=>(
                            { px: 3.5, py: 0.5, color: theme.palette.text.secondary, fontSize: 11, fontWeight: 700, letterSpacing: .4 })}>
                            {group.label}
                          </Box>
                        )}
        {group.links.map(link => {
                          const active = isActivePath(link.path);
                          return (
              <ListItemButton
                              key={link.id}
          onClick={()=> navigate(link.path)}
          onMouseEnter={() => prefetchRoute(link.path)}
          onFocus={() => prefetchRoute(link.path)}
                              aria-current={active? 'page': undefined}
                              sx={(theme)=>(
                                {
                mx: 2,
                borderRadius: 1.25,
                pl: 5,
                py: 0.9,
                my: 0.25,
                transition:'background-color .2s ease',
                backgroundColor: active ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                '&:hover': { backgroundColor: active ? alpha(theme.palette.primary.main, 0.18) : theme.palette.action.hover }
                              })}
                            >
                              {link.path?.startsWith('/email/spam') ? (
                                <Badge key={emailCountsVersion} color="error" badgeContent={window.__emailCounts?.spamUnread || 0} invisible={!(window.__emailCounts?.spamUnread > 0)} sx={{ '& .MuiBadge-badge': { right: -4 } }}>
                                  <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: active? 600: 500 }} primary={link.label} />
                                </Badge>
                              ) : (
                                <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: active? 600: 500 }} primary={link.label} />
                              )}
                            </ListItemButton>
                          );
                        })}
                      </Box>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
      {/* footer: minimal DB status only (single line tiny text) */}
      <Box sx={(theme)=>(
        {
          position:'absolute', left:10, right:10, bottom: 48,
          p: 0.5,
          borderRadius: 1.5,
          bgcolor: theme.palette.mode==='dark'? 'rgba(255,255,255,0.02)':'rgba(0,0,0,0.015)'
        }
      )}>
        <Box sx={{ display:'flex', alignItems:'center', height: 14 }}>
          <BackendStatus dbOnly />
        </Box>
      </Box>

      {/* collapse control */}
      <Box sx={{ position:'absolute', bottom: 12, right: 10 }}>
        <Tooltip title="Daralt" placement="left">
          <IconButton size="small" onClick={onCollapse} aria-label="Menüyü daralt">
            <ChevronLeft size={18} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
