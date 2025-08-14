import React from 'react';
import { Drawer, Box, Typography, IconButton, Divider, Stack } from '@mui/material';
import { X as CloseIcon } from 'lucide-react';

/*
  PreviewDrawer
  Props:
    - open (bool)
    - onClose ()
    - title (string | node)
    - subtitle (string | node)
    - width (number|string) default 480
    - actions (node) optional footer actions
*/
export default function PreviewDrawer({ open, onClose, title, subtitle, width=480, actions, children }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: (theme)=>({
          width,
          display:'flex',
          flexDirection:'column',
          gap:0,
          borderLeft: '1px solid',
          borderColor: theme.palette.divider,
          background: theme.preset==='aurora'
            ? (theme.palette.mode==='dark'
                ? 'linear-gradient(165deg, rgba(17,24,39,0.78), rgba(17,24,39,0.62))'
                : 'linear-gradient(165deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))')
            : undefined,
          backdropFilter: theme.preset==='aurora'? 'blur(18px)':undefined,
          WebkitBackdropFilter: theme.preset==='aurora'? 'blur(18px)':undefined
        })
      }}
    >
      <Box sx={{ p:2, pt:2.5, position:'relative' }}>
  <IconButton onClick={onClose} size="small" sx={{ position:'absolute', top:8, right:8 }}><CloseIcon size={16} /></IconButton>
        {title && <Typography variant="h6" sx={{ fontWeight:600, pr:4 }}>{title}</Typography>}
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>{subtitle}</Typography>}
      </Box>
      <Divider />
      <Box sx={{ flex:1, overflowY:'auto', p:2, display:'flex', flexDirection:'column', gap:2 }}>
        {children}
      </Box>
      {actions && (
        <Box sx={{ p:2, borderTop:'1px solid', borderColor:'divider', background: 'background.paper' }}>
          <Stack direction="row" gap={1} justifyContent="flex-end" flexWrap="wrap">{actions}</Stack>
        </Box>
      )}
    </Drawer>
  );
}
