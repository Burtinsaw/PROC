import React, { useMemo, useState, useEffect, useRef, memo } from 'react';
import { Box, Typography, Divider, List, ListItemButton, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../hooks/usePermissions';

import { useLocation } from 'react-router-dom';

function NavContextPanel({ item, onClose, railWidth, onPointerEnter, onPointerLeave, focusReturnApi }) {
  const navigate = useNavigate();
  const { any } = usePermissions();
  const location = useLocation();
  const [q, setQ] = useState('');
  const searchRef = useRef();
  const panelRef = useRef();
  const groups = useMemo(()=> {
    const base = (item?.groups || []).map(g => ({
      ...g,
      links: g.links.filter(l => !l.permsAny || any(l.permsAny))
    })).filter(g => g.links.length);
    if(!q.trim()) return base;
    const term = q.toLowerCase();
    return base.map(g => ({
      ...g,
      links: g.links.filter(l => l.label.toLowerCase().includes(term))
    })).filter(g => g.links.length);
  }, [item, any, q]);
  useEffect(()=> {
    if(item && groups.length && searchRef.current) {
      // focus search when panel opens
      searchRef.current.focus();
    }
  }, [item, groups.length]);

  useEffect(()=> {
    const node = panelRef.current;
    const handleKey = (e) => {
      if(e.key==='Escape') {
        e.stopPropagation();
        onClose?.();
        focusReturnApi?.focusActive?.();
      }
      if(e.key==='/' && groups.length) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if(e.key==='ArrowLeft') {
        e.preventDefault();
        onClose?.();
        focusReturnApi?.focusActive?.();
      }
    };
    if(node) node.addEventListener('keydown', handleKey);
    return ()=> { if(node) node.removeEventListener('keydown', handleKey); };
  }, [onClose, groups.length, focusReturnApi]);

  const liveRef = useRef();
  useEffect(()=> {
    if(item && liveRef.current) {
      liveRef.current.textContent = `${item.label} paneli açıldı${groups.length? ', '+groups.length+' grup':' '}`;
    }
  }, [item, groups.length]);
  if(!item || (!groups.length && !item.path)) return null;
  return (
    <Box
      id={`nav-panel-${item.id}`}
      role="navigation"
      aria-label={`${item.label} menüsü`}
      ref={panelRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onMouseLeave={()=> onClose?.()}
      sx={(theme)=>({
      position:'fixed', top:0, left: railWidth, height:'100vh', width:320,
      background: theme.preset==='aurora'
        ? (theme.palette.mode==='dark'
            ? 'linear-gradient(180deg, rgba(31,41,55,0.9), rgba(31,41,55,0.55))'
            : 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.7))')
        : theme.palette.background.paper,
      backdropFilter: theme.preset==='aurora'? 'blur(24px)' : undefined,
      borderRight:'1px solid', borderColor: theme.palette.divider,
      boxShadow:'0 8px 24px -4px rgba(0,0,0,0.25)',
      zIndex:1190,
      display:'flex', flexDirection:'column'
    })}>
      <Box sx={{ px:2.5, pt:1.5, pb:1 }}>
  <Box ref={liveRef} aria-live="polite" style={{ position:'absolute', width:1, height:1, overflow:'hidden', clip:'rect(0 0 0 0)' }} />
        <Typography variant="subtitle2" sx={{ letterSpacing:.5, textTransform:'uppercase', fontWeight:700, opacity:.75 }}>{item.label}</Typography>
        {item.groups?.length ? (
          <Box sx={{ mt:1 }}>
            <TextField
              size="small"
              placeholder="Ara..."
              value={q}
              onChange={(e)=> setQ(e.target.value)}
              fullWidth
              inputRef={searchRef}
              InputProps={{ sx:{ borderRadius:2, fontSize:13, py:0 } }}
            />
          </Box>
        ): null}
      </Box>
      <Divider />
      <Box sx={{ flex:1, overflowY:'auto', py:1 }}>
        {groups.map(g => (
          <Box key={g.id} sx={{ px:2.5, mb:1.5 }}>
            <Typography variant="overline" sx={{ fontSize:11, fontWeight:600, opacity:.7 }}>{g.label}</Typography>
            <List dense disablePadding>
              {g.links.map(l => {
                const active = location.pathname.startsWith(l.path);
                const label = l.label;
                let renderedLabel = label;
                if(q.trim()) {
                  const idx = label.toLowerCase().indexOf(q.toLowerCase());
                  if(idx>=0) {
                    renderedLabel = <span>{label.slice(0,idx)}<strong>{label.slice(idx, idx+q.length)}</strong>{label.slice(idx+q.length)}</span>;
                  }
                }
                return (
                  <ListItemButton
                    key={l.id}
                    onClick={()=> { navigate(l.path); onClose?.(); }}
                    aria-current={active? 'page': undefined}
                    sx={(theme)=>({
                      mt:.5,
                      borderRadius:1.5,
                      position:'relative',
                      background: active ? `linear-gradient(90deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}22)` : 'transparent',
                      '&:before': active ? {
                        content:'""',
                        position:'absolute',
                        left:0,
                        top:0,
                        bottom:0,
                        width:3,
                        borderTopLeftRadius:4,
                        borderBottomLeftRadius:4,
                        background:`linear-gradient(${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      }: undefined,
                      '&:hover': { background: active ? undefined : (theme.palette.mode==='dark'? 'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)') }
                    })}
                  >
                    <Typography variant="body2" sx={{ fontWeight: active?600:500 }}>{renderedLabel}</Typography>
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
        {!groups.length && item.path && (
          <Box sx={{ p:2.5 }}>
            <Typography variant="body2" color="text.secondary">Bu modüle gitmek için simgeye tıklayın.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Prevent needless re-renders when parent state changes unrelated props
export default memo(NavContextPanel, (prev, next) => {
  return prev.item === next.item && prev.railWidth === next.railWidth;
});
