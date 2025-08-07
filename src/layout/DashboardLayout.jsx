import { useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  InputBase,
  Badge,
  alpha,
  styled,
  Stack,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ProcurementIcon,
  Add as AddIcon,
  List as ListIcon,
  AccountCircle,
  Logout,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Fullscreen,
  FullscreenExit,
  ExpandLess,
  ExpandMore,
  Analytics as AnalyticsIcon,
  Receipt as InvoiceIcon,
  Extension as ComponentsIcon,
  BarChart as ChartIcon,
  FormatListBulleted as DataIcon,
  Widgets as WidgetsIcon,
  Chat as ChatIcon,
  Event as CalendarIcon,
  ViewKanban as KanbanIcon,
  People as CustomerIcon,
  FiberManualRecord
} from '@mui/icons-material';

// project imports
import AuthContext from '../contexts/AuthContext';

const drawerWidth = 280;

// Styled Components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.grey[100], 1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[200], 1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '25ch',
    },
  },
}));

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openItems, setOpenItems] = useState({ dashboard: true });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleItemClick = (itemId) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'group',
      children: [
        {
          id: 'default',
          title: 'Default',
          type: 'item',
          url: '/dashboard/default',
          icon: DashboardIcon,
          active: true
        },
        {
          id: 'analytics',
          title: 'Analytics',
          type: 'item',
          url: '/dashboard/analytics',
          icon: AnalyticsIcon
        }
      ]
    },
    {
      id: 'procurement',
      title: 'Procurement',
      type: 'group',
      children: [
        {
          id: 'procurement-requests',
          title: 'Requests',
          type: 'collapse',
          icon: ProcurementIcon,
          children: [
            {
              id: 'new-request',
              title: 'New Request',
              type: 'item',
              url: '/procurement/requests/new'
            },
            {
              id: 'request-list',
              title: 'Request List',
              type: 'item',
              url: '/procurement/requests/list'
            }
          ]
        }
      ]
    },
    {
      id: 'widgets',
      title: 'Widgets',
      type: 'group',
      children: [
        {
          id: 'statistics',
          title: 'Statistics',
          type: 'item',
          url: '/widget/statistics',
          icon: WidgetsIcon
        },
        {
          id: 'data',
          title: 'Data',
          type: 'item',
          url: '/widget/data',
          icon: DataIcon
        },
        {
          id: 'chart',
          title: 'Chart',
          type: 'item',
          url: '/widget/chart',
          icon: ChartIcon
        }
      ]
    }
  ];

  const renderNavItems = (items, depth = 0) => {
    return items.map((item) => {
      if (item.type === 'group') {
        return (
          <Box key={item.id}>
            <ListItem sx={{ py: 0, px: 3, mt: depth === 0 ? 3 : 1.5 }}>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary', 
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.5px'
              }}>
                {item.title}
              </Typography>
            </ListItem>
            {renderNavItems(item.children, depth + 1)}
          </Box>
        );
      }

      if (item.type === 'collapse') {
        const IconComponent = item.icon;
        const isOpen = openItems[item.id];

        return (
          <Box key={item.id}>
            <ListItemButton
              onClick={() => handleItemClick(item.id)}
              sx={{
                minHeight: 48,
                borderRadius: 2,
                mx: 2,
                px: 2,
                mb: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <IconComponent sx={{ fontSize: '1.5rem' }} />
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  variant: 'body1',
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}
              />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children?.map((child) => (
                  <ListItemButton
                    key={child.id}
                    onClick={() => navigate(child.url)}
                    sx={{
                      minHeight: 44,
                      borderRadius: 2,
                      mx: 2,
                      px: 2,
                      pl: 6,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <FiberManualRecord sx={{ fontSize: '0.625rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={child.title}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontSize: '0.9rem'
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        );
      }

      if (item.type === 'item') {
        const IconComponent = item.icon;

        return (
          <ListItemButton
            key={item.id}
            onClick={() => navigate(item.url)}
            sx={{
              minHeight: 48,
              borderRadius: 2,
              mx: 2,
              px: 2,
              mb: 0.5,
              '&:hover': {
                bgcolor: 'action.hover'
              },
              ...(item.active && {
                bgcolor: 'primary.lighter',
                border: '1px solid',
                borderColor: 'primary.light',
                '&:hover': {
                  bgcolor: 'primary.lighter'
                }
              })
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <IconComponent sx={{ 
                fontSize: '1.5rem',
                color: item.active ? 'primary.main' : 'inherit'
              }} />
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                variant: 'body1',
                fontWeight: item.active ? 600 : 500,
                fontSize: '0.95rem',
                color: item.active ? 'primary.main' : 'inherit'
              }}
            />
          </ListItemButton>
        );
      }

      return null;
    });
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Brand */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              backgroundColor: '#1976d2',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              M
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{ 
              fontWeight: 'bold', 
              color: '#1976d2',
              fontSize: '1.25rem'
            }}
          >
            Mantis
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* User Profile */}
      <Box sx={{ p: 3, pt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            sx={{ 
              width: 44, 
              height: 44, 
              bgcolor: 'primary.main',
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              lineHeight: 1.2,
              fontSize: '1rem'
            }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontSize: '0.8rem'
            }}>
              {user?.role || 'Admin User'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 0, py: 1 }}>
          {renderNavItems(menuItems)}
        </List>
      </Box>

      {/* Bottom Promotion Card */}
      <Box sx={{ p: 2, m: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
        <Stack spacing={1.5}>
          <Box 
            sx={{ 
              width: 36, 
              height: 36, 
              bgcolor: 'success.main',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              component="img"
              src="/vite.svg"
              sx={{ width: 24, height: 24 }}
            />
          </Box>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            New Release 3.5.1
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary',
            fontSize: '0.75rem'
          }}>
            Performance improvements
          </Typography>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Modern Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { lg: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: '#fff',
          color: '#333',
          boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important' }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ 
              mr: 2,
              p: 1.5,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <MenuIcon sx={{ fontSize: '1.5rem' }} />
          </IconButton>

          {/* Search */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{ 
                fontSize: '0.95rem',
                '& .MuiInputBase-input': {
                  '&::placeholder': {
                    opacity: 0.7
                  }
                }
              }}
            />
          </Search>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Header Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="large"
              aria-label="fullscreen toggle"
              onClick={handleFullscreenToggle}
              sx={{ 
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="messages"
              sx={{ 
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="notifications"
              sx={{ 
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="account menu"
              onClick={handleMenu}
              sx={{ 
                ml: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: '#1976d2',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
            </IconButton>
          </Stack>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                minWidth: 200,
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px'
              }
            }}
          >
            <MenuItem onClick={handleClose} sx={{ py: 1.5, fontSize: '0.95rem' }}>
              <AccountCircle sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, fontSize: '0.95rem' }}>
              <Logout sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { lg: drawerOpen ? drawerWidth : 0 }, 
          flexShrink: { lg: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          })
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              })
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { 
            lg: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' 
          },
          mt: '72px',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: '#fafafa',
          minHeight: 'calc(100vh - 72px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
