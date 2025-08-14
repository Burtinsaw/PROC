import React, { useMemo } from 'react';
import { Box, Typography, IconButton, Tooltip, TextField, Divider, Stack } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Search as SearchIcon,
  ArrowLeft,
  ArrowRight,
  Home as HomeIcon,
  FileText,
  PlusCircle,
  Users,
  ShoppingCart,
  Truck,
  LineChart,
  BarChart3,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';
import menuItems from '../../menu-items';
import usePermissions from '../../hooks/usePermissions';
import Logo from '../common/Logo';

/*
  Radical new Sidebar (glass rail) - no visual continuity with old.
  Props:
    - open (bool) : whether sidebar is visible (mobile overlay)
    - drawerWidth (number) expanded width
    - collapsed (bool)
    - onToggleOpen()
    - onToggleCollapse()
*/

const COLLAPSED_WIDTH = 76;

export default function Sidebar({ open, drawerWidth=260, collapsed, onToggleOpen, onToggleCollapse }) {
  const { any } = usePermissions();
  const location = useLocation();

  // const flatItems = useMemo(()=> menuItems.flatMap(g => g.children.map(c => ({ ...c, group:g.title }))), []);
  const [search, setSearch] = React.useState('');

  const filteredGroups = useMemo(()=> {
    if(!search.trim()) return menuItems;
    const q = search.toLowerCase();
    return menuItems.map(g => ({
      ...g,
      children: g.children.filter(c => c.title.toLowerCase().includes(q))
    })).filter(g => g.children.length);
  }, [search]);

  const renderGroup = (group) => (
    <Box key={group.id} sx={{ mt: 2, px: 1 }}>
      {!collapsed && (
        <Typography variant="caption" sx={{
          pl: 1.5,
          mb: .5,
          fontWeight: 600,
          letterSpacing: '.6px',
          textTransform: 'uppercase',
          opacity: .55
        }}>{group.title}</Typography>) }
      <Stack component="ul" sx={{ listStyle:'none', m:0, p:0, gap:.5 }}>
        {group.children.filter(i=> !i.permsAny || any(i.permsAny)).map(item => renderItem(item))}
      </Stack>
    </Box>
  );

  const iconMap = useMemo(() => ({
    home: HomeIcon,
    'file-text': FileText,
    'plus-circle': PlusCircle,
    users: Users,
    'shopping-cart': ShoppingCart,
    truck: Truck,
    'line-chart': LineChart,
    'bar-chart-3': BarChart3,
    settings: SettingsIcon,
    shield: Shield
  }), []);

  // Expose icon map in non-production for simple runtime tests / diagnostics
  if (import.meta?.env?.MODE !== 'production') {
    window.__APP_ICON_MAP__ = iconMap;
    const missing = menuItems.flatMap(g=> g.children).filter(i=> i.icon && !iconMap[i.icon]);
    if(missing.length){
      console.warn('Eksik ikon eşleşmeleri:', missing.map(m=> m.icon));
    }
  }

  const renderItem = (item) => {
    const IconComp = item.icon ? iconMap[item.icon] : null;
    const active = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
    const content = (
      <Box
        component={Link}
        to={item.url}
        sx={(theme)=>({
          position:'relative',
          display:'flex', alignItems:'center', gap:1.25,
          textDecoration:'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 500,
          padding: collapsed? '10px 12px' : '10px 14px',
          color: active? theme.palette.primary.contrastText : theme.palette.text.secondary,
          background: active
            ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            : 'transparent',
          transition:'background .25s, color .25s',
          '&:hover': {
            background: active ? undefined : (theme.preset==='aurora'
              ? (theme.palette.mode==='dark'
                  ? 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))'
                  : 'linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.02))')
              : (theme.palette.mode==='dark'? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')),
            color: theme.palette.text.primary
          }
        })}
      >
        {IconComp && (
          <Box sx={{ width:22, height:22, display:'grid', placeItems:'center' }}>
            <IconComp size={18} />
          </Box>
        )}
        {!collapsed && <Typography component="span" sx={{ lineHeight:1 }}>{item.title}</Typography>}
      </Box>
    );
    if(collapsed) {
      return (
        <Tooltip key={item.id} title={item.title} placement="right" arrow>
          {content}
        </Tooltip>
      );
    }
    return <React.Fragment key={item.id}>{content}</React.Fragment>;
  };

  // Mobile drawer overlay
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;

  return (
    <>
      {/* Desktop rail */}
      <Box
        sx={(theme)=>({
          position:'fixed',
          top:0,
          left:0,
          height:'100vh',
          width: collapsed? COLLAPSED_WIDTH : drawerWidth,
          display: { xs:'none', md:'flex' },
          flexDirection:'column',
          borderRight:'1px solid',
          borderColor: theme.palette.divider,
          background: theme.preset==='aurora'
            ? (theme.palette.mode==='dark'
                ? 'linear-gradient(180deg, rgba(17,24,39,0.75), rgba(17,24,39,0.55))'
                : 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))')
            : (theme.palette.mode==='dark'? theme.palette.background.paper : '#fff'),
          backdropFilter: theme.preset==='aurora'? 'blur(18px)' : undefined,
          WebkitBackdropFilter: theme.preset==='aurora'? 'blur(18px)' : undefined,
          padding:1,
          transition:'width .28s var(--motion-ease-standard)',
          zIndex: 1100
        })}
      >
        <Box sx={{ display:'flex', alignItems:'center', justifyContent: collapsed? 'center':'space-between', minHeight:64, px: collapsed?0:1 }}>
          {collapsed ? <Logo compact /> : <Logo />}
          <IconButton size="small" onClick={onToggleCollapse} sx={{ ml:1 }}>
            {collapsed? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          </IconButton>
        </Box>
        {!collapsed && (
          <Box sx={{ px:1, pb:1 }}>
            <TextField
              size="small"
              placeholder="Ara..."
              value={search}
              onChange={(e)=> setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon size={16} style={{ marginRight:4 }} /> }}
              fullWidth
            />
          </Box>
        )}
        <Box sx={{ flex:1, overflowY:'auto', pr: collapsed?0: .5, pb:2 }}>
          {filteredGroups.map(g => renderGroup(g))}
        </Box>
        <Divider sx={{ my:1 }} />
        <Box sx={{ px:1, pb:2, display:'flex', flexDirection:'column', gap:.75 }}>
          <Typography variant="caption" sx={{ opacity:.5, textAlign: collapsed?'center':'left' }}>v1.0</Typography>
        </Box>
      </Box>

      {/* Mobile overlay */}
      {isMobile && open && (
  <Box sx={{ position:'fixed', inset:0, zIndex:1300, display:'flex' }}>
          <Box sx={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)' }} onClick={onToggleOpen} />
          <Box sx={(theme)=>({
            position:'relative',
            width: drawerWidth,
            height:'100%',
            background: theme.palette.background.paper,
            boxShadow:'0 0 0 1px rgba(0,0,0,0.08), 0 20px 40px -8px rgba(0,0,0,0.35)',
            display:'flex', flexDirection:'column'
          })}>
            <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', p:2 }}>
              <Logo />
              <IconButton onClick={onToggleOpen}><X size={18} /></IconButton>
            </Box>
            <Divider />
            <Box sx={{ p:2 }}>
              <TextField size="small" fullWidth placeholder="Ara..." value={search} onChange={(e)=> setSearch(e.target.value)} />
            </Box>
            <Box sx={{ flex:1, overflowY:'auto', pb:2 }}>
              {filteredGroups.map(g => renderGroup(g))}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

export { COLLAPSED_WIDTH };
