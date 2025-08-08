import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography, IconButton } from '@mui/material';
import { Dashboard, ShoppingCart, People, BarChart, Settings, ChevronLeft } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const menuItems = [
  { text: 'Kontrol Paneli', icon: <Dashboard />, path: '/' },
  { text: 'Talepler', icon: <ShoppingCart />, path: '/requests' },
  { text: 'Tedarikçiler', icon: <People />, path: '/suppliers' },
  { text: 'Raporlar', icon: <BarChart />, path: '/reports' },
  { text: 'Ayarlar', icon: <Settings />, path: '/settings' },
];

const Sidebar = ({ open, handleDrawerClose, drawerWidth }) => {
  const { theme } = useTheme();
  const primaryColor = theme?.colors?.primary || theme.palette.primary.main;

  const drawerContent = (
    <div>
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, ...theme.mixins.toolbar }}>
     <Typography variant="h6" noWrap component="div" sx={{color: primaryColor}}>
          Mantis
        </Typography>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeft />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding component={Link} to={item.path} sx={{color: 'text.primary', textDecoration: 'none'}}>
            <ListItemButton>
              <ListItemIcon sx={{color: primaryColor}}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
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
