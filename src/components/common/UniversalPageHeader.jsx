// Universal Page Header System
// Tüm preset'lerde tutarlı çalışan akıllı header sistemi

import React from 'react';
import { Box, Paper, Stack, Typography, Avatar } from '@mui/material';
import { useAppTheme } from '../../contexts/useAppTheme';

// Business theme imports
import { BusinessPageHeader } from '../business/BusinessLayoutComponents';

// Procurement theme imports  
import { ProcurementPageHeader } from '../procurement/ProcurementComponents';

/**
 * UniversalPageHeader - Tüm tema preset'lerinde çalışan akıllı header
 * Otomatik olarak aktif tema preset'ine göre doğru bileşeni render eder
 * 
 * @param {string} title - Sayfa başlığı
 * @param {string} subtitle - Alt başlık (description)
 * @param {React.ReactNode|Array} actions - Sağ taraf action button'ları
 * @param {React.Component} icon - İkon bileşeni (opsiyonel)
 * @param {boolean} compact - Küçük boyut modu
 * @param {Object} ...props - Diğer props'lar
 */
export const UniversalPageHeader = ({ 
  title, 
  subtitle, 
  description, // backward compatibility
  actions, 
  right, // backward compatibility
  icon: Icon, 
  compact = false,
  ...props 
}) => {
  const { preset } = useAppTheme();
  
  // Backward compatibility: description -> subtitle, right -> actions
  const resolvedSubtitle = subtitle || description;
  const resolvedActions = actions || right;

  // Business preset: Use business header
  if (preset === 'business') {
    return (
      <BusinessPageHeader
        title={title}
        subtitle={resolvedSubtitle}
        actions={Array.isArray(resolvedActions) ? resolvedActions : [resolvedActions].filter(Boolean)}
        dense={compact}
        {...props}
      />
    );
  }

  // Procurement preset: Use procurement header
  if (preset === 'procurement') {
    return (
      <ProcurementPageHeader
        title={title}
        subtitle={resolvedSubtitle}
        actions={Array.isArray(resolvedActions) ? resolvedActions : [resolvedActions].filter(Boolean)}
        {...props}
      />
    );
  }

  // Default theme (classic, neo, aurora, minimal, contrast): Use original PageHeader
  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        position: 'relative',
        overflow: 'hidden',
        p: compact ? 1.5 : 2.5,
        mt: 0,
        mb: compact ? 1.5 : 2,
        borderRadius: 3,
        border: `1px solid ${t.palette.divider}`,
        background:
          t.palette.mode === 'dark'
            ? `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)), radial-gradient(circle at 20% 0%, rgba(255,255,255,0.15), transparent 60%)`
            : `linear-gradient(135deg, ${t.palette.primary.light}15, ${t.palette.primary.main}08), radial-gradient(circle at 18% 0%, ${t.palette.primary.light}33, transparent 55%)`,
        backdropFilter: 'blur(4px)'
      })}
      {...props}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={3}
      >
        <Stack direction="row" alignItems="center" gap={2} sx={{ width: '100%' }}>
          {Icon && (
            <Avatar
              variant="rounded"
              sx={(t) => ({
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: t.palette.mode === 'dark' ? t.palette.primary.dark : t.palette.primary.light,
                color: t.palette.primary.contrastText,
                boxShadow: t.palette.mode === 'dark'
                  ? '0 4px 14px -2px rgba(0,0,0,0.6)'
                  : '0 4px 14px -2px rgba(0,0,0,0.15)'
              })}
            >
              <Icon size={28} />
            </Avatar>
          )}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              {title}
            </Typography>
            {resolvedSubtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, maxWidth: 680 }}
              >
                {resolvedSubtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {resolvedActions && (
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            {Array.isArray(resolvedActions) ? (
              <Stack direction="row" spacing={1}>
                {resolvedActions}
              </Stack>
            ) : (
              resolvedActions
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default UniversalPageHeader;
