// Procurement Theme Specific Components
// Modern yeşil-turuncu tonlarında özel component'lar

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
  InputLabel
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
  Refresh,
  LocalShipping,
  Assignment,
  Business,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';

// Procurement Metric Card
export const ProcurementMetricCard = ({ 
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
    neutral: theme.palette.text.secondary,
    approved: theme.palette.success.main,
    pending: theme.palette.warning.main,
    rejected: theme.palette.error.main
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />;
      case 'down': return <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />;
      case 'flat': return <TrendingFlat sx={{ fontSize: 16, color: theme.palette.text.secondary }} />;
      default: return null;
    }
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: dense ? 140 : 160,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.12),
        backgroundColor: alpha(theme.palette.primary.main, 0.01),
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.12)}`,
          transform: 'translateY(-2px)'
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        ...props.sx
      }} 
      {...props}
    >
      <CardContent sx={{ 
        p: dense ? 1.5 : 2, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        '&:last-child': { pb: dense ? 1.5 : 2 }
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ 
            fontWeight: 500,
            fontSize: '0.75rem',
            letterSpacing: '0.025em',
            textTransform: 'uppercase'
          }}>
            {title}
          </Typography>
          {actions && (
            <IconButton size="small" sx={{ mt: -0.5, mr: -0.5 }}>
              <MoreVert sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>

        {/* Value */}
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          fontSize: dense ? '1.75rem' : '2rem',
          lineHeight: 1.1,
          color: theme.palette.text.primary,
          mb: 0.5
        }}>
          {value}
        </Typography>

        {/* Subtitle & Trend */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            {subtitle}
          </Typography>
          {trend && trendValue && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getTrendIcon(trend)}
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: trend === 'up' ? theme.palette.success.main : 
                         trend === 'down' ? theme.palette.error.main : 
                         theme.palette.text.secondary
                }}
              >
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Status Indicator */}
        {status !== 'neutral' && (
          <Circle 
            sx={{ 
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: 8,
              color: statusColors[status]
            }} 
          />
        )}
      </CardContent>
    </Card>
  );
};

// Procurement Status Chip
export const ProcurementStatusChip = ({ status, label, ...props }) => {
  const theme = useTheme();
  
  const statusConfig = {
    approved: { 
      color: theme.palette.success.main, 
      bg: alpha(theme.palette.success.main, 0.1),
      icon: <CheckCircle sx={{ fontSize: 14 }} />
    },
    pending: { 
      color: theme.palette.warning.main, 
      bg: alpha(theme.palette.warning.main, 0.1),
      icon: <Warning sx={{ fontSize: 14 }} />
    },
    rejected: { 
      color: theme.palette.error.main, 
      bg: alpha(theme.palette.error.main, 0.1),
      icon: <ErrorIcon sx={{ fontSize: 14 }} />
    },
    draft: { 
      color: theme.palette.text.secondary, 
      bg: alpha(theme.palette.text.secondary, 0.1),
      icon: <Assignment sx={{ fontSize: 14 }} />
    },
    active: { 
      color: theme.palette.primary.main, 
      bg: alpha(theme.palette.primary.main, 0.1),
      icon: <Business sx={{ fontSize: 14 }} />
    },
    shipped: { 
      color: theme.palette.info.main, 
      bg: alpha(theme.palette.info.main, 0.1),
      icon: <LocalShipping sx={{ fontSize: 14 }} />
    }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Chip
      size="small"
      icon={config.icon}
      label={label || status}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
        '& .MuiChip-icon': {
          color: config.color
        },
        ...props.sx
      }}
      {...props}
    />
  );
};

// Procurement Page Header
export const ProcurementPageHeader = ({ 
  title, 
  subtitle, 
  actions = [], 
  breadcrumbs,
  dense = false,
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      mb: dense ? 2 : 3,
      pb: dense ? 1.5 : 2,
      borderBottom: 1,
      borderColor: alpha(theme.palette.primary.main, 0.12),
      ...props.sx
    }}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {breadcrumbs}
        </Typography>
      )}
      
      {/* Main Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            fontSize: dense ? '1.5rem' : '1.875rem',
            color: theme.palette.text.primary,
            mb: subtitle ? 0.5 : 0,
            lineHeight: 1.2
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {/* Actions */}
        {actions.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Procurement Filter Bar
export const ProcurementFilterBar = ({ onSearch, onFilter, onExport, dense = true }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: dense ? 1 : 1.5, 
      flexWrap: 'wrap',
      p: dense ? 1.5 : 2,
      backgroundColor: alpha(theme.palette.primary.main, 0.02),
      borderRadius: 1,
      border: '1px solid',
      borderColor: alpha(theme.palette.primary.main, 0.08)
    }}>
      {/* Search */}
      <TextField
        size="small"
        placeholder="Search procurement data..."
        sx={{ minWidth: 240 }}
        InputProps={{
          startAdornment: <Search sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
        }}
        onChange={(e) => onSearch?.(e.target.value)}
      />
      
      {/* Filters */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select defaultValue="" label="Status" onChange={(e) => onFilter?.('status', e.target.value)}>
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </FormControl>
      
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Priority</InputLabel>
        <Select defaultValue="" label="Priority" onChange={(e) => onFilter?.('priority', e.target.value)}>
          <MenuItem value="">All Priority</MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="urgent">Urgent</MenuItem>
        </Select>
      </FormControl>
      
      {/* Actions */}
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<FilterList />}
        onClick={onFilter}
        sx={{ 
          borderColor: alpha(theme.palette.primary.main, 0.3),
          color: theme.palette.primary.main
        }}
      >
        Advanced Filters
      </Button>
      
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<GetApp />}
        onClick={onExport}
        sx={{ 
          borderColor: alpha(theme.palette.secondary.main, 0.3),
          color: theme.palette.secondary.main
        }}
      >
        Export
      </Button>
      
      <IconButton size="small" onClick={() => window.location.reload()}>
        <Refresh />
      </IconButton>
    </Box>
  );
};

// Procurement Section Card
export const ProcurementSectionCard = ({ 
  title, 
  subtitle,
  children, 
  headerActions,
  dense = true,
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Card 
      variant="outlined" 
      sx={{
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.12),
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.24)
        },
        transition: 'border-color 0.2s ease',
        ...props.sx
      }}
      {...props}
    >
      <Box sx={{ 
        p: dense ? 1.5 : 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              fontSize: dense ? '0.875rem' : '1rem',
              color: theme.palette.primary.main
            }}>
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

export default {
  ProcurementMetricCard,
  ProcurementStatusChip,
  ProcurementPageHeader,
  ProcurementFilterBar,
  ProcurementSectionCard
};
