import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Frown as SentimentDissatisfiedIcon } from 'lucide-react';

/*
  EmptyState component
  Props:
    - icon (ReactNode optional)
    - title (string)
    - description (string)
    - actionLabel (string optional)
    - onAction (function optional)
*/
export default function EmptyState({ icon, title='Kayıt bulunamadı', description='', actionLabel, onAction }) {
  return (
  <Box sx={{
      flex:1,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      textAlign:'center',
      gap:1.5,
      p:4,
      color: 'text.secondary'
  }}>
      <Box sx={{ fontSize:48, lineHeight:1, opacity:.55 }}>
  {icon || <SentimentDissatisfiedIcon size={48} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight:600, letterSpacing:'-.25px' }}>{title}</Typography>
      {description && <Typography variant="body2" sx={{ maxWidth:360 }}>{description}</Typography>}
      {actionLabel && onAction && (
        <Button variant="contained" size="small" onClick={onAction}>{actionLabel}</Button>
      )}
    </Box>
  );
}
