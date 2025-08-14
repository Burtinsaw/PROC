import { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
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
  ExpandLess,
  ExpandMore,
  FiberManualRecord
} from '@mui/icons-material';

const drawerWidth = 260;

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
        url: '/dashboard',
        icon: DashboardIcon,
        breadcrumbs: false
      },
      {
        id: 'analytics',
        title: 'Analytics',
        type: 'item',
        url: '/dashboard/analytics',
        icon: AnalyticsIcon,
        breadcrumbs: false
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
        icon: WidgetsIcon,
        breadcrumbs: false
      },
      {
        id: 'data',
        title: 'Data',
        type: 'item',
        url: '/widget/data',
        icon: DataIcon,
        breadcrumbs: false
      },
      {
        id: 'chart',
        title: 'Chart',
        type: 'item',
        url: '/widget/chart',
        icon: ChartIcon,
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'applications',
    title: 'Applications',
    type: 'group',
    children: [
      {
        id: 'chat',
        title: 'Chat',
        type: 'item',
        url: '/apps/chat',
        icon: ChatIcon,
        breadcrumbs: false
      },
      {
        id: 'calendar',
        title: 'Calendar',
        type: 'item',
        url: '/apps/calendar',
        icon: CalendarIcon,
        breadcrumbs: false,
        external: true
      },
      {
        id: 'kanban',
        title: 'Kanban',
        type: 'item',
        url: '/apps/kanban',
        icon: KanbanIcon,
        breadcrumbs: false
      },
      {
        id: 'customer',
        title: 'Customer',
        type: 'collapse',
        icon: CustomerIcon,
        children: [
          {
            id: 'customer-list',
            title: 'Customer List',
            type: 'item',
            url: '/apps/customer/customer-list',
            breadcrumbs: false
          },
          {
            id: 'customer-card',
            title: 'Customer Card',
            type: 'item',
            url: '/apps/customer/customer-card',
            breadcrumbs: false
          }
        ]
      },
      {
        id: 'invoice',
        title: 'Invoice',
        type: 'collapse',
        icon: InvoiceIcon,
        children: [
          {
            id: 'create',
            title: 'Create',
            type: 'item',
            url: '/apps/invoice/create',
            breadcrumbs: false
          },
          {
            id: 'details',
            title: 'Details',
            type: 'item',
            url: '/apps/invoice/details/1',
            breadcrumbs: false
          },
          {
            id: 'list',
            title: 'List',
            type: 'item',
            url: '/apps/invoice/list',
            breadcrumbs: false
          },
          {
            id: 'edit',
            title: 'Edit',
            type: 'item',
            url: '/apps/invoice/edit/1',
            breadcrumbs: false
          }
        ]
      }
    ]
  }
];

const MantisSidebar = ({ mobileOpen, onDrawerToggle }) => {
  const [openItems, setOpenItems] = useState({});

  const handleClick = (itemId) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderNavItems = (items, depth = 0) => {
    return items.map((item) => {
      if (item.type === 'group') {
        return (
          <Box key={item.id}>
            <ListItem sx={{ py: 0, px: 3, mt: depth === 0 ? 2 : 1 }}>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary', 
                fontWeight: 500,
                textTransform: 'uppercase',
                fontSize: '0.6875rem'
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
              onClick={() => handleClick(item.id)}
              sx={{
                minHeight: 44,
                borderRadius: 1,
                mx: 1,
                px: 2,
                mb: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <IconComponent sx={{ fontSize: '1.25rem' }} />
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500
                }}
              />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children?.map((child) => (
                  <ListItemButton
                    key={child.id}
                    sx={{
                      minHeight: 40,
                      borderRadius: 1,
                      mx: 1,
                      px: 2,
                      pl: 5,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 20 }}>
                      <FiberManualRecord sx={{ fontSize: '0.5rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={child.title}
                      primaryTypographyProps={{
                        variant: 'body2'
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
            sx={{
              minHeight: 44,
              borderRadius: 1,
              mx: 1,
              px: 2,
              mb: 0.5,
              '&:hover': {
                bgcolor: 'action.hover'
              },
              ...(item.id === 'default' && {
                bgcolor: 'primary.lighter',
                '&:hover': {
                  bgcolor: 'primary.lighter'
                }
              })
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <IconComponent sx={{ fontSize: '1.25rem' }} />
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: item.id === 'default' ? 600 : 500,
                color: item.id === 'default' ? 'primary.main' : 'inherit'
              }}
            />
            {item.external && (
              <Chip
                variant="outlined"
                size="small"
                label="New"
                color="primary"
                sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.675rem' } }}
              />
            )}
          </ListItemButton>
        );
      }

      return null;
    });
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Profile */}
      <Box sx={{ p: 3, pt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            JW
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              JWT User
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              UI/UX Designer
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

      {/* Bottom Card */}
      <Box sx={{ p: 2, m: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
        <Stack spacing={1}>
          <Box 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'success.main',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              component="img"
              src="/vite.svg"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            New Release 3.5.1
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Performance improvements
          </Typography>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onDrawerToggle}
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
      
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default MantisSidebar;
