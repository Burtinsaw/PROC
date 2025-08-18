// Business ERP Layout Components
// Dense, professional layouts inspired by enterprise systems

import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  IconButton,
  Stack,
  Divider,
  useTheme,
  alpha,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { 
  MoreVert,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Circle,
  Search,
  FilterList,
  GetApp,
  Refresh
} from '@mui/icons-material';

// Business Metric Card Component
export const BusinessMetricCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  status = 'neutral',
  actions,
  dense = true,
  ...props 
}) => {
  const theme = useTheme();
  
  const statusColors = {
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    neutral: theme.palette.text.secondary
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'down': return <TrendingDown sx={{ fontSize: 16 }} />;
      case 'flat': return <TrendingFlat sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: dense ? 120 : 140,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.15)}`
        },
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      {...props}
    >
      <CardContent sx={{ 
        p: dense ? 1.5 : 2, 
        pb: `${dense ? 1.5 : 2}px !important`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Circle sx={{ fontSize: 8, color: statusColors[status] }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
          </Box>
          {actions && (
            <IconButton size="small" sx={{ p: 0.25, ml: 1 }}>
              <MoreVert sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>

        {/* Value */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            fontSize: dense ? '1.5rem' : '1.75rem',
            lineHeight: 1.1,
            mb: 0.5,
            color: 'text.primary'
          }}
        >
          {value}
        </Typography>

        {/* Trend & Subtitle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
              {subtitle}
            </Typography>
          )}
          {trend && trendValue && (
            <Chip
              icon={getTrendIcon(trend)}
              label={trendValue}
              size="small"
              variant="outlined"
              sx={{ 
                height: 20,
                fontSize: '0.625rem',
                fontWeight: 600,
                '& .MuiChip-icon': { 
                  fontSize: 14,
                  color: trend === 'up' ? theme.palette.success.main : 
                         trend === 'down' ? theme.palette.error.main : 
                         theme.palette.text.secondary
                },
                borderColor: trend === 'up' ? theme.palette.success.main : 
                           trend === 'down' ? theme.palette.error.main : 
                           theme.palette.divider,
                color: trend === 'up' ? theme.palette.success.main : 
                       trend === 'down' ? theme.palette.error.main : 
                       theme.palette.text.secondary
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Business Data Table Container
export const BusinessTableContainer = ({ 
  title, 
  actions,
  filters, 
  children,
  dense = true,
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }} {...props}>
      {/* Table Header */}
      <Box sx={{ 
        p: dense ? 1.5 : 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: filters ? 1 : 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: dense ? '0.875rem' : '1rem' }}>
            {title}
          </Typography>
          {actions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {actions}
            </Box>
          )}
        </Box>
        {filters && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filters}
          </Box>
        )}
      </Box>
      
      {/* Table Content */}
      <Box sx={{ overflow: 'auto' }}>
        {children}
      </Box>
    </Card>
  );
};

// Business Status Indicator
export const BusinessStatusChip = ({ 
  status, 
  label, 
  variant = 'filled',
  size = 'small',
  ...props 
}) => {
  const theme = useTheme();
  
  const statusConfig = {
    active: { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
    pending: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
    inactive: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) },
    draft: { color: theme.palette.text.secondary, bg: alpha(theme.palette.text.secondary, 0.1) },
    approved: { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Chip
      label={label || status}
      size={size}
      variant={variant}
      sx={{
        backgroundColor: variant === 'filled' ? config.bg : 'transparent',
        color: config.color,
        borderColor: variant === 'outlined' ? config.color : 'transparent',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.625rem' : '0.75rem',
        height: size === 'small' ? 20 : 24,
        '& .MuiChip-label': {
          px: size === 'small' ? 0.75 : 1
        }
      }}
      {...props}
    />
  );
};

// Business Page Header
export const BusinessPageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs,
  actions,
  metrics,
  dense = false,
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        mb: dense ? 2 : 3,
        pb: dense ? 1.5 : 2,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)'
      }}
      {...props}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <Box sx={{ mb: 1 }}>
          {breadcrumbs}
        </Box>
      )}

      {/* Title & Actions */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: subtitle ? 0.5 : 0 }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              fontSize: dense ? '1.25rem' : '1.5rem',
              color: 'text.primary',
              mb: subtitle ? 0.5 : 0
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1}>
            {actions}
          </Stack>
        )}
      </Box>

      {/* Metrics */}
      {metrics && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {metrics}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

// Business Section Card
export const BusinessSectionCard = ({ 
  title, 
  subtitle,
  children, 
  headerActions,
  dense = true,
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Card variant="outlined" {...props}>
      <Box sx={{ 
        p: dense ? 1.5 : 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.01),
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: dense ? '0.8125rem' : '0.875rem' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {headerActions && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {headerActions}
            </Box>
          )}
        </Box>
      </Box>
      <CardContent sx={{ p: dense ? 1.5 : 2, '&:last-child': { pb: dense ? 1.5 : 2 } }}>
        {children}
      </CardContent>
    </Card>
  );
};

// Business Form Components
export const BusinessFormComponents = ({ dense = true }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: dense ? 2 : 3 }}>
      {/* Quick Filters */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: dense ? 1 : 1.5, 
        flexWrap: 'wrap' 
      }}>
        <TextField
          size="small"
          placeholder="Search RFQs..."
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: <Search sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select defaultValue="" label="Status">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select defaultValue="" label="Priority">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<FilterList />}
        >
          Filters
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<GetApp />}
        >
          Export
        </Button>
        <IconButton size="small">
          <Refresh />
        </IconButton>
      </Box>
      
      {/* Quick Actions */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          label="Quick Create" 
          color="primary" 
          size="small" 
          clickable
          sx={{ fontWeight: 500 }}
        />
        <Chip 
          label="Bulk Import" 
          variant="outlined" 
          size="small" 
          clickable
        />
        <Chip 
          label="Templates" 
          variant="outlined" 
          size="small" 
          clickable
        />
      </Box>
    </Box>
  );
};

// Business Navigation Dock Bar
export const BusinessNavigationDockBar = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 48,
      bgcolor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderTop: 1,
      borderColor: alpha(theme.palette.common.white, 0.2),
      zIndex: 1100
    }}>
      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
        Enterprise Procurement Suite • Business Theme Active
      </Typography>
    </Box>
  );
};

export default {
  BusinessMetricCard,
  BusinessTableContainer,
  BusinessStatusChip,
  BusinessPageHeader,
  BusinessSectionCard,
  BusinessFormComponents,
  BusinessNavigationDockBar
};
