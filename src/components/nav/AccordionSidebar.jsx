import React, { useMemo, useState, useEffect } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Tooltip, IconButton, Typography, Stack, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ChevronLeft } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import navConfig from '../../navigation/navConfig';
import BackendStatus from '../BackendStatus';

export const ACC_SIDEBAR_WIDTH = 260;
const HEADER_HEIGHT = 56; // align with AppShellHeader height

export default function AccordionSidebar({ leftOffset = 0, topOffset = 56, onCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});

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

  const items = useMemo(()=> navConfig, []);

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
      sx={(theme)=>(
        {
    position:'fixed', top: topOffset, left: leftOffset, bottom:0,
    width: ACC_SIDEBAR_WIDTH, zIndex: 1195,
        borderRight:'1px solid', borderColor: theme.palette.divider,
        background: theme.preset==='aurora'
          ? (theme.palette.mode==='dark'
              ? 'linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.6))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))')
          : theme.palette.background.paper,
        backdropFilter: theme.preset==='aurora'? 'blur(18px)' : undefined,
        overflowY:'auto'
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
                              <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: active? 600: 500 }} primary={link.label} />
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
