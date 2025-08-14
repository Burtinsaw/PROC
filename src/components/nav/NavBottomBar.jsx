import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, IconButton, Tooltip, Drawer, List, ListItemButton, Typography, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import navConfig from '../../navigation/navConfig';
import usePermissions from '../../hooks/usePermissions';

export default function NavBottomBar() {
  const { any } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetItem, setSheetItem] = useState(null);
  const [open, setOpen] = useState(false);
  const iconRefs = useRef([]);
  const drawerStartRef = useRef();
  const drawerEndRef = useRef();
  const [focusIndex, setFocusIndex] = useState(0);

  const items = useMemo(()=> navConfig.filter(item => {
    if(item.groups) {
      const groupHas = item.groups.some(g => g.links?.some(l => !l.permsAny || any(l.permsAny)));
      return groupHas;
    }
    return true;
  }).map(item => item.groups ? ({
    ...item,
    groups: item.groups.map(g => ({
      ...g,
      links: g.links.filter(l => !l.permsAny || any(l.permsAny))
    })).filter(g => g.links.length)
  }) : item), [any]);

  useEffect(()=> { setOpen(false); setSheetItem(null); }, [location.pathname]);

  const handleIconClick = (item, idx) => {
    if(item.groups?.length) { setSheetItem(item); setOpen(true); }
    else if(item.path) navigate(item.path);
    setFocusIndex(idx);
  };

  const handleKey = (e) => {
    if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
      e.preventDefault();
      let next = focusIndex;
      if(e.key==='ArrowRight') next = (focusIndex+1) % items.length;
      if(e.key==='ArrowLeft') next = (focusIndex-1+items.length) % items.length;
      if(e.key==='Home') next = 0;
      if(e.key==='End') next = items.length-1;
      setFocusIndex(next);
      iconRefs.current[next]?.focus();
    }
    if(e.key==='Enter' || e.key===' ') {
      const item = items[focusIndex];
      if(item) handleIconClick(item, focusIndex);
    }
  };

  // Trap focus inside drawer when open
  useEffect(()=> {
    if(open) {
      const first = drawerStartRef.current?.nextElementSibling?.querySelector('button, [tabindex="0"]');
      setTimeout(()=> first?.focus(), 50);
    }
  }, [open]);

  return (
    <>
  <Box role="tablist" aria-label="Alt gezinme" onKeyDown={handleKey} sx={(theme)=>(
        {
          position:'fixed', zIndex:1300, bottom:0, left:0, right:0,
          height:60,
          display:'flex', alignItems:'center', justifyContent:'space-around',
          background: theme.preset==='aurora'
            ? (theme.palette.mode==='dark'
                ? 'linear-gradient(180deg, rgba(17,24,39,0.9), rgba(17,24,39,0.75))'
                : 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))')
            : theme.palette.background.paper,
          backdropFilter: theme.preset==='aurora'? 'blur(18px)' : undefined,
          borderTop:'1px solid', borderColor: theme.palette.divider,
        }
      )}>
  {items.map((item, idx) => {
          const Icon = item.icon;
          const active = item.path ? location.pathname.startsWith(item.path) : item.groups?.some(g => g.links.some(l => location.pathname.startsWith(l.path)));
          return (
            <Tooltip key={item.id} title={item.label} arrow placement="top">
              <IconButton
    ref={el => iconRefs.current[idx]=el}
    role="tab"
    tabIndex={idx===focusIndex?0:-1}
    aria-selected={active? 'true':'false'}
    aria-label={item.label}
    aria-current={active? 'page': undefined}
                size="large"
    onClick={()=> handleIconClick(item, idx)}
                sx={(theme)=>(
                  {
                    position:'relative',
                    color: active? theme.palette.primary.contrastText : theme.palette.text.secondary,
                    background: active ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` : 'transparent',
                    '&:hover': { background: active? undefined : (theme.palette.mode==='dark'? 'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)') },
                    transition:'background .25s'
                  }
                )}
              >
                {Icon && <Icon size={22} />}
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>
  <Drawer
        anchor="bottom"
        open={open}
        onClose={()=> { setOpen(false); setSheetItem(null); }}
        PaperProps={{
          sx: (theme)=>(
            {
              height:'60vh',
              borderTopLeftRadius:16,
              borderTopRightRadius:16,
              background: theme.preset==='aurora'
                ? (theme.palette.mode==='dark'
                    ? 'linear-gradient(180deg, rgba(31,41,55,0.95), rgba(31,41,55,0.75))'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.85))')
                : theme.palette.background.paper,
              backdropFilter: theme.preset==='aurora'? 'blur(24px)' : undefined
            }
          )
        }}
      >
  <div tabIndex={0} ref={drawerStartRef} aria-hidden="true" />
  {sheetItem && (
          <Box sx={{ p:2, pb:1 }}>
            <Typography variant="subtitle2" sx={{ letterSpacing:.5, fontWeight:700 }}>{sheetItem.label}</Typography>
          </Box>
        )}
        <Divider />
        <Box sx={{ flex:1, overflowY:'auto', pb:3 }}>
          {sheetItem?.groups?.map(g => (
            <Box key={g.id} sx={{ px:2, pt:1.5 }}>
              <Typography variant="overline" sx={{ fontSize:11, fontWeight:600, opacity:.7 }}>{g.label}</Typography>
              <List dense disablePadding>
        {g.links.map(l => {
                  const active = location.pathname.startsWith(l.path);
                  return (
                    <ListItemButton
                      key={l.id}
                      onClick={()=> { navigate(l.path); setOpen(false); setSheetItem(null); }}
          aria-current={active? 'page': undefined}
                      sx={(theme)=>(
                        {
                          mt:.5,
                          borderRadius:1.5,
                          background: active ? `linear-gradient(90deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}22)` : 'transparent',
                          '&:before': active ? {
                            content:'""', position:'absolute', left:0, top:0, bottom:0, width:3,
                            borderTopLeftRadius:4, borderBottomLeftRadius:4,
                            background:`linear-gradient(${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          }: undefined,
                          '&:hover': { background: active ? undefined : (theme.palette.mode==='dark'? 'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)') }
                        }
                      )}
                    >
                      <Typography variant="body2" sx={{ fontWeight: active?600:500 }}>{l.label}</Typography>
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          ))}
          {!sheetItem?.groups?.length && sheetItem?.path && (
            <Box sx={{ p:2 }}>
              <Typography variant="body2" color="text.secondary">Modüle gitmek için ikon kullanın.</Typography>
            </Box>
          )}
        </Box>
        <div tabIndex={0} ref={drawerEndRef} aria-hidden="true" onFocus={()=> drawerStartRef.current?.focus()} />
      </Drawer>
    </>
  );
}
