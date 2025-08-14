import React from 'react';
import { Box, Tooltip } from '@mui/material';

/**
 * NeutralBadge
 * Decorative, non-semantic badge for metadata (times, categories, tags) distinct from status chips.
 */
const NeutralBadge = ({
  label,
  icon,
  tooltip,
  variant = 'subtle',
  size = 'small',
  sx,
  ...rest
}) => {
  const baseStyles = (theme) => {
    const neutral = theme.palette.neutral || theme.palette.grey;
    const variants = {
      subtle: {
        backgroundColor: neutral[100],
        border: `1px solid ${neutral[200]}`,
        color: neutral[700]
      },
      outlined: {
        backgroundColor: 'transparent',
        border: `1px solid ${neutral[300]}`,
        color: neutral[700]
      },
      solid: {
        backgroundColor: neutral[600],
        border: `1px solid ${neutral[600]}`,
        color: neutral[50]
      }
    };
    return {
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: 1.1,
      fontWeight: 600,
      letterSpacing: '.3px',
      fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
      borderRadius: 999,
      padding: `${(size === 'small' ? 0 : 0.125) * 8}px ${(size === 'small' ? 0.625 : 0.875) * 8}px`,
      gap: 6,
      userSelect: 'none',
      whiteSpace: 'nowrap',
      ...variants[variant]
    };
  };

  const content = (
    <Box
      role="status"
      aria-label={typeof label === 'string' ? label : undefined}
      sx={(theme) => ({ ...baseStyles(theme), ...sx })}
      {...rest}
    >
      {icon && <Box component="span" sx={{ display: 'inline-flex', lineHeight: 0 }}>{icon}</Box>}
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>{label}</Box>
    </Box>
  );

  if (tooltip) return <Tooltip title={tooltip}>{content}</Tooltip>;
  return content;
};

export default NeutralBadge;
