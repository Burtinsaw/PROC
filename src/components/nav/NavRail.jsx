import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import navConfig from '../../navigation/navConfig';
import { useFeatures } from '../../contexts/FeatureContext';
import usePermissions from '../../hooks/usePermissions';
import Logo from '../common/Logo';

export const RAIL_WIDTH = 64;
export const RAIL_COLLAPSED_WIDTH = 56;

export default function NavRail({ onHoverItem, activeId, onRegisterFocusApi, collapsed=false, onToggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [focusIndex, setFocusIndex] = useState(0);
  const itemRefs = useRef([]);
  const { any } = usePermissions();
  const { modules } = useFeatures();
  const railItems = useMemo(()=> {
    return navConfig.filter(item => {
      // modül kapalıysa gizle (email ve help gibi bağımsız path'lere dokunma)
      if (item.id === 'lojistik' && modules && modules.logistics === false) return false;
      if (item.id === 'finans' && modules && modules.finance === false) return false;
      if (item.id === 'raporlar' && modules && modules.reporting === false) return false;
      // procurement ana grup: talep/satinalma her zaman açık varsayımı; gerekirse modules.procurement eklenebilir
      if(item.path) return true; // simple path items always visible (could also gate)
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
    }) : item);
  }, [any, modules]);

  useEffect(()=> {
    const idx = railItems.findIndex(i => (i.path && location.pathname.startsWith(i.path)) || location.pathname.startsWith('/'+i.id));
    if(idx>=0) setFocusIndex(idx);
  }, [location.pathname, railItems]);

  const handleKey = (e) => {
    if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {
      e.preventDefault();
      let next = focusIndex;
      if(e.key==='ArrowDown') next = (focusIndex+1) % railItems.length;
      if(e.key==='ArrowUp') next = (focusIndex-1+railItems.length) % railItems.length;
      if(e.key==='Home') next = 0;
      if(e.key==='End') next = railItems.length-1;
      setFocusIndex(next);
      itemRefs.current[next]?.focus();
    }
    if(e.key==='Enter' || e.key===' ') {
      const item = railItems[focusIndex];
      if(item) {
        if(item.path) navigate(item.path);
        else if(item.groups?.length) onHoverItem(item);
      }
    }
    if(e.key==='Escape') onHoverItem(null);
    if(e.key==='ArrowRight') {
      const item = railItems[focusIndex];
      if(item?.groups?.length) onHoverItem(item);
    }
  };

  // expose focus helpers to parent layout
  useEffect(()=> {
    if(onRegisterFocusApi) {
      onRegisterFocusApi({
        focusActive: () => {
          const idx = railItems.findIndex(i => i.id===activeId) || focusIndex;
          requestAnimationFrame(()=> itemRefs.current[idx]?.focus());
        },
        focusFirst: () => {
          setFocusIndex(0); requestAnimationFrame(()=> itemRefs.current[0]?.focus());
        }
      });
    }
  }, [onRegisterFocusApi, railItems, activeId, focusIndex]);

  const width = collapsed ? RAIL_COLLAPSED_WIDTH : RAIL_WIDTH;

  return (
  <Box role="navigation" aria-label="Ana gezinme" onKeyDown={handleKey} sx={(theme)=>({
      position:'fixed', top:0, left:0, height:'100vh', width, zIndex:1200,
      display:'flex', flexDirection:'column', alignItems:'stretch',
      background: theme.preset==='aurora'
        ? (theme.palette.mode==='dark'
            ? 'linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.55))'
            : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))')
        : theme.palette.background.paper,
      backdropFilter: theme.preset==='aurora'? 'blur(22px)' : undefined,
      borderRight:'1px solid', borderColor: theme.palette.divider,
      px:0.5, pt:1,
    })}>
      <Box sx={{ display:'flex', justifyContent:'center', mb:2 }}>
        <Logo compact />
      </Box>
      <Box sx={{ flex:1, display:'flex', flexDirection:'column', gap:0.5 }}>
        {railItems.map((item,i)=> {
          const Icon = item.icon;
          const active = activeId? activeId===item.id : (item.path && location.pathname.startsWith(item.path));
      const expanded = active && item.groups?.length ? true : undefined;
      return (
            <Tooltip key={item.id} title={item.label} placement="right" arrow>
              <IconButton
                ref={el => itemRefs.current[i]=el}
                size="large"
                tabIndex={i===focusIndex?0:-1}
                aria-label={item.label}
                aria-current={active? 'page': undefined}
        aria-haspopup={item.groups?.length ? 'true': undefined}
        aria-expanded={expanded}
        aria-controls={expanded ? `nav-panel-${item.id}`: undefined}
                onMouseEnter={()=> onHoverItem(item)}
                onFocus={()=> onHoverItem(item)}
                onMouseLeave={()=> onHoverItem(null)}
                onClick={()=> { if(item.path) navigate(item.path); else onHoverItem(item);} }
                sx={(theme)=>({
                  position:'relative',
                  alignSelf:'stretch',
                  borderRadius:2,
                  color: active? theme.palette.primary.contrastText : theme.palette.text.secondary,
                  background: active
                    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    : 'transparent',
                  '&:hover': { background: active? undefined : (theme.palette.mode==='dark'? 'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)') },
                  '&:focusVisible': {
                    outline: '2px solid',
                    outlineColor: theme.palette.primary.main,
                    outlineOffset: 2
                  },
                  transition:'background .25s, color .25s',
                })}
              >
                <Box sx={{ width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {Icon && <Icon size={20} />}
                </Box>
                {active && (
                  <Box sx={(theme)=>({ position:'absolute', left:-4, top:'50%', transform:'translateY(-50%)', width:4, height:24, borderRadius:2, background: `linear-gradient(${theme.palette.primary.main}, ${theme.palette.secondary.main})` })} />
                )}
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:0.5, pb:1.25 }}>
        <Box sx={{ textAlign:'center', fontSize:11, opacity:.4, flex:1 }}>v1</Box>
        <Tooltip title={collapsed? 'Menüyü genişlet':'Menüyü daralt'} placement="right">
          <IconButton
            size="small"
            aria-label={collapsed? 'Menüyü genişlet':'Menüyü daralt'}
            onClick={onToggleCollapse}
            sx={(theme)=>({
              ml:0.5,
              borderRadius:2,
              color: theme.palette.text.secondary,
              background: theme.palette.mode==='dark'? 'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
              '&:hover': { background: theme.palette.mode==='dark'? 'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)' }
            })}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// (RAIL_WIDTH already exported above)
