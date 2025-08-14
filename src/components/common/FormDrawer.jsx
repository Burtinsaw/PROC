import React from 'react';
import { Drawer, Box, Stack, Typography, IconButton, Divider, useTheme, Fade } from '@mui/material';
import { X } from 'lucide-react';

/*
 FormDrawer – Uygulama çapında yeniden kullanılabilir drawer tabanlı form şablonu.
 Özellikler:
  - Başlık & açıklama alanı
  - Sticky header ve footer, kaydırılabilir içerik
  - Genişlik varyantları: sm (480), md (680), lg (860)
  - Blur arka plan + degrade yüzey
  - Responsive: xs ekranlarda tam genişlik
*/

const WIDTH_MAP = { sm: 480, md: 680, lg: 860 };

export default function FormDrawer({
  open,
  onClose,
  title,
  description,
  width = 'md',
  actions,
  children,
  headerExtra,
  hideClose = false,
  PaperProps,
  ...rest
}) {
  const theme = useTheme();
  const w = typeof width === 'number' ? width : (WIDTH_MAP[width] || WIDTH_MAP.md);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted
      ModalProps={{ disableEscapeKeyDown: false }}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: w },
          maxWidth: '100vw',
            backdropFilter: 'blur(14px)',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(24,26,31,0.92), rgba(24,26,31,0.88))'
              : 'linear-gradient(135deg,#ffffff,#f8fafc)',
            borderLeft: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 20px 48px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column'
        }
      }}
      PaperProps={PaperProps}
      {...rest}
    >
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {title && (
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2, mb: description ? 0.75 : 0 }}>
                  {title}
                </Typography>
              )}
              {description && (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              )}
            </Box>
            <Stack direction="row" alignItems="center" gap={1}>
              {headerExtra}
              {!hideClose && (
                <IconButton size="small" onClick={onClose} sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}>
                  <X size={16} />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Box>
        <Divider />
        <Fade in={open} timeout={300}>
          <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
            {children}
          </Box>
        </Fade>
        <Divider />
        <Box sx={{ p: 2.25, display: 'flex', justifyContent: 'flex-end', gap: 1.5, background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.65)', backdropFilter: 'blur(6px)' }}>
          {actions}
        </Box>
      </Box>
    </Drawer>
  );
}
