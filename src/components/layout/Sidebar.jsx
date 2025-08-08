import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography, IconButton, ListSubheader } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import menuItems, { icons } from '../../menu-items';
import Logo from '../common/Logo';
import usePermissions from '../../hooks/usePermissions';

const Sidebar = ({ open, handleDrawerClose, drawerWidth }) => {
  const { theme } = useTheme();
  const primaryColor = theme?.colors?.primary || theme.palette.primary.main;

  const { any } = usePermissions();
  const location = useLocation();

  const renderItems = (group) => (
    <List
      key={group.id}
      subheader={<ListSubheader component="div" sx={{ bgcolor: 'transparent', color: 'text.secondary' }}>{group.title}</ListSubheader>}
    >
      {group.children.filter((item) => !item.permsAny || any(item.permsAny)).map((item) => {
        const Icon = item.icon && icons[item.icon] ? icons[item.icon] : null;
    const selected = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
    return (
          <ListItem key={item.id} disablePadding component={Link} to={item.url} sx={{ color: 'text.primary', textDecoration: 'none' }}>
      <ListItemButton selected={selected} sx={{ '&.Mui-selected': { bgcolor: 'action.selected', '& .MuiListItemIcon-root': { color: primaryColor } } }}>
              {Icon && (
                <ListItemIcon sx={{ color: primaryColor }}>
                  <Icon />
                </ListItemIcon>
              )}
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  const drawerContent = (
    <div>
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, ...theme.mixins.toolbar }}>
        <Logo />
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeft />
        </IconButton>
      </Box>
  <Divider />
  {menuItems.map((group) => renderItems(group))}
    </div>
  );

  return (
  <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, ml: 0 }} aria-label="mailbox folders">
      <Drawer
        variant="temporary"
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
  <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
    borderRight: '1px solid rgba(0,0,0,0.08)',
            position: 'fixed',
            left: 0,
            top: 64, // AppBar yüksekliği
            height: 'calc(100% - 64px)'
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
