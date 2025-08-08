import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useTheme } from '../contexts/ThemeContext';
import BreadcrumbsNav from '../components/navigation/BreadcrumbsNav';

const drawerWidth = 260;

// Standart kalıcı çekmece düzeni: open iken içerik çekmece genişliği kadar kayar
const Main = styled('main')(
  ({ theme }) => ({
    flexGrow: 1,
    width: '100%',
    minHeight: '100vh',
  // Üst ve sağ/alt padding, sol sıfır: içerik çekmece çizgisine hizalansın
  paddingTop: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingBottom: theme.spacing(3),
  // Sidebar ile içerik arasında net 9px boşluk
  paddingLeft: '9px',
    backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  marginLeft: 0,
  })
);

const DashboardLayout = () => {
  useTheme(); // tema erişimi (ileride gerekirse) – şimdilik kullanılmıyor
  const [open, setOpen] = React.useState(() => {
    const v = localStorage.getItem('sidebarOpen');
    return v ? v === 'true' : true;
  });

  const handleDrawerOpen = () => {
  setOpen(true);
  localStorage.setItem('sidebarOpen', 'true');
  };

  const handleDrawerClose = () => {
  setOpen(false);
  localStorage.setItem('sidebarOpen', 'false');
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <CssBaseline />
      <Header open={open} handleDrawerOpen={handleDrawerOpen} drawerWidth={drawerWidth} />
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} drawerWidth={drawerWidth} />
    <Main open={open}>
  {/* AppBar boşluğu */}
  <Toolbar disableGutters sx={(theme) => ({ minHeight: theme.mixins.toolbar.minHeight || 64 })} />
  <BreadcrumbsNav />
  <Box sx={{ width: '100%', mx: 0, p: 0 }}>
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
};

export default DashboardLayout;
