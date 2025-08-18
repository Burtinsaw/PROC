import React from 'react';
import { Box, Stack, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { useAppTheme } from '../../contexts/useAppTheme';
import { ChevronRight } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

/**
 * Standardized Page Header Layout
 * Unified spacing, positioning and theme-aware styling for all pages
 */
const StandardPageHeader = ({ 
  title, 
  subtitle, 
  description, // Legacy support
  actions, 
  breadcrumbs, 
  showBreadcrumbs = false,
  dense = false,
  variant = 'default', // 'default', 'minimal', 'elevated'
  ...props 
}) => {
  const { theme, preset } = useAppTheme();
  const location = useLocation();

  // Normalize subtitle
  const finalSubtitle = subtitle || description;

  // Standard spacing constants - main container now has top padding
  const HEADER_PADDING_X = 0; // No horizontal padding - handled by main container
  const HEADER_PADDING_Y = dense ? 8 : 12; // Reduced padding since container has top padding
  const HEADER_MARGIN_BOTTOM = dense ? 16 : 20; // Standard bottom margin
  const TITLE_SIZE = dense ? '1.5rem' : '1.875rem'; // Consistent title size

  // Theme-aware styles
  const getHeaderStyles = () => {
    const base = {
      px: HEADER_PADDING_X,
      py: `${HEADER_PADDING_Y}px`,
      mb: `${HEADER_MARGIN_BOTTOM}px`,
      mt: 0, // No top margin needed - main container has padding
      position: 'relative'
    };

    switch (variant) {
      case 'elevated':
        return {
          ...base,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
          borderRadius: theme.shape.borderRadius,
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)'
        };
      
      case 'minimal':
        return {
          ...base,
          borderBottom: `1px solid ${theme.palette.divider}`
        };
      
      default:
        // Business and Procurement themes get subtle bottom border
        if (preset === 'business' || preset === 'procurement') {
          return {
            ...base,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'transparent'
          };
        }
        return base;
    }
  };

  // Auto breadcrumbs kapalı; sadece showBreadcrumbs true ise ve özel breadcrumbs verilmediyse üret
  const generateBreadcrumbs = () => {
    if (!showBreadcrumbs) return null;
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return null;
    return (
      <Breadcrumbs separator={<ChevronRight size={12} />} sx={{ mb: 1.5, fontSize: '0.75rem' }}>
        <MuiLink component={RouterLink} to="/" color="text.secondary" underline="hover" sx={{ fontSize: '0.75rem' }}>
          Panel
        </MuiLink>
        {segments.map((segment, index) => {
          const path = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1);
          return isLast ? (
            <Typography key={path} color="text.primary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              {label}
            </Typography>
          ) : (
            <MuiLink key={path} component={RouterLink} to={path} color="text.secondary" underline="hover" sx={{ fontSize: '0.75rem' }}>
              {label}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <Box sx={getHeaderStyles()} {...props}>
  {/* Breadcrumbs: AppShellHeader global breadcrumb gösterdiği için varsayılan kapalı */}
  {breadcrumbs || generateBreadcrumbs()}
      
      {/* Header Content */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
        spacing={2}
      >
        {/* Title Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontSize: TITLE_SIZE,
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'text.primary',
              mb: finalSubtitle ? 0.5 : 0,
              wordBreak: 'break-word'
            }}
          >
            {title}
          </Typography>
          
          {finalSubtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.875rem',
                lineHeight: 1.4,
                mt: 0.5
              }}
            >
              {finalSubtitle}
            </Typography>
          )}
        </Box>
        
        {/* Actions Section */}
        {actions && (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            flexShrink: 0
          }}>
            {Array.isArray(actions) ? actions.map((action, index) => (
              <Box key={index}>{action}</Box>
            )) : actions}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default StandardPageHeader;
