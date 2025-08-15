import React, { useState, useEffect, useRef } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import AccordionSidebar, { ACC_SIDEBAR_WIDTH } from '../components/nav/AccordionSidebar';
import NavRail, { RAIL_WIDTH, RAIL_COLLAPSED_WIDTH } from '../components/nav/NavRail';
import NavContextPanel from '../components/nav/NavContextPanel';
import NavBottomBar from '../components/nav/NavBottomBar';
import AppShellHeader from '../components/nav/AppShellHeader';
import CommandPalette from '../components/nav/CommandPalette';
import BottomStatusBar from '../components/nav/BottomStatusBar';

export default function AppShellLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [menuCollapsed, setMenuCollapsed] = useState(() => {
    try { return localStorage.getItem('nav:collapsed') === '1'; } catch { return false; }
  });
  const [panelItem, setPanelItem] = useState(null);
  const [hoverCandidate, setHoverCandidate] = useState(null);
  const openTimer = useRef();
  const closeTimer = useRef();
  const railFocusApiRef = useRef({});

  const isMobile = useMediaQuery('(max-width:900px)');
  const location = useLocation();
  const prevCollapsedRef = useRef(null);

  // E-posta rotalarında otomatik olarak menüyü rail (ikon) moduna indir
  useEffect(() => {
    const onEmail = location.pathname.startsWith('/email');
    if (onEmail) {
      // İlk girişte mevcut durumu hatırla ve ikon moduna geç
      if (prevCollapsedRef.current === null) prevCollapsedRef.current = menuCollapsed;
      if (!menuCollapsed) setMenuCollapsed(true);
    } else {
      // E-postadan çıkarken önceki durumu geri yükle
      if (prevCollapsedRef.current !== null) {
        const prev = prevCollapsedRef.current;
        prevCollapsedRef.current = null;
        if (menuCollapsed !== prev) setMenuCollapsed(prev);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Global ESC when focus not inside panel closes it
  useEffect(()=> {
    const onKey = (e) => {
      if(e.key==='Escape') { /* no-op for now */ }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, []);

  // Ctrl+K / Cmd+K opens command palette
  useEffect(()=> {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if(mod && e.key.toLowerCase()==='k') { e.preventDefault(); setCmdOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  }, []);

  // Persist collapsed state
  useEffect(()=> { try { localStorage.setItem('nav:collapsed', menuCollapsed ? '1' : '0'); } catch { /* ignore */ } }, [menuCollapsed]);

  // Rail hover intent handlers (only when collapsed/rail mode)
  useEffect(()=> {
    if(!menuCollapsed) return; // only relevant in rail mode
    if(openTimer.current) clearTimeout(openTimer.current);
    if(closeTimer.current) clearTimeout(closeTimer.current);
    if(hoverCandidate && hoverCandidate.groups?.length) {
      openTimer.current = setTimeout(()=> setPanelItem(hoverCandidate), 120);
    } else if(!hoverCandidate) {
      closeTimer.current = setTimeout(()=> setPanelItem(null), 200);
    } else {
      setPanelItem(null);
    }
    return ()=> { if(openTimer.current) clearTimeout(openTimer.current); if(closeTimer.current) clearTimeout(closeTimer.current); };
  }, [hoverCandidate, menuCollapsed]);

  return (
      <Box sx={{ display:'flex', minHeight:'100vh', flexDirection: isMobile? 'column':'row' }}>
      <a href="#app-main" style={{position:'absolute',left:-1000,top:0,background:'#000',color:'#fff',padding:'8px 12px',zIndex:2000}} onFocus={(e)=>{e.currentTarget.style.left='8px';}} onBlur={(e)=>{e.currentTarget.style.left='-1000px';}}>İçeriğe geç</a>
  {/* Left navigation: rail (collapsed) vs accordion (expanded) */}
  {!isMobile && menuCollapsed && (
    <>
      <NavRail
        onHoverItem={setHoverCandidate}
        activeId={panelItem?.id}
        onRegisterFocusApi={(api)=> { railFocusApiRef.current = api; }}
        collapsed={true}
        onToggleCollapse={()=> setMenuCollapsed(false)}
      />
      <NavContextPanel
        item={panelItem}
        onClose={()=> setHoverCandidate(null)}
        onPointerEnter={()=> setHoverCandidate(panelItem)}
        onPointerLeave={()=> setHoverCandidate(null)}
        railWidth={RAIL_COLLAPSED_WIDTH}
        focusReturnApi={railFocusApiRef.current}
      />
    </>
  )}
  {!isMobile && !menuCollapsed && (
    <AccordionSidebar leftOffset={0} topOffset={56} onCollapse={()=> setMenuCollapsed(true)} />
  )}
        <Box id="app-main" component="main" role="main" tabIndex={-1} sx={(theme)=>({
          flex:1,
          // leave room for rail and accordion sidebar; header alignment handled by header itself
      ml: isMobile? 0 : (menuCollapsed ? `${RAIL_COLLAPSED_WIDTH}px` : `${ACC_SIDEBAR_WIDTH}px`),
          pb: isMobile? '72px': 4,
          pl: { xs:2, sm:3, md:4 }, pr: { xs:2, sm:3, md:4 }, pt: { xs:2, md:3 },
          transition:'margin .3s',
          background: theme.preset==='aurora'
            ? (theme.palette.mode==='dark'
                ? 'linear-gradient(135deg,#0f172a 0%, #1e293b 60%)'
                : 'linear-gradient(135deg,#f0f7ff 0%, #ffffff 60%)')
            : theme.palette.background.default,
        })}>
          <AppShellHeader />
          <CommandPalette open={cmdOpen} onClose={()=> setCmdOpen(false)} />
          <Outlet />
        </Box>
  {isMobile && <NavBottomBar />}
  {/* Global bottom status bar (rates + clocks) */}
  <BottomStatusBar leftOffset={isMobile ? 0 : (menuCollapsed ? RAIL_COLLAPSED_WIDTH : ACC_SIDEBAR_WIDTH)} />
    </Box>
  );
}
