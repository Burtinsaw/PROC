import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Grid, Card, CardContent, CardActions, Button, Typography, Stack, Divider, Chip } from '@mui/material';
import { radii, shadows } from '../theme/designTokens';
import { useAppTheme } from '../contexts/useAppTheme';

function makeTheme(mode, preset){
  const t = createTheme({ palette: { mode } });
  // Palette
  if (preset === 'neo') {
    t.palette.primary = { ...t.palette.primary, main: '#6366f1' };
    t.palette.secondary = { ...t.palette.secondary, main: '#22d3ee' };
    t.palette.background = { ...t.palette.background, default: mode==='dark'? '#0f172a':'#f1f5f9', paper: mode==='dark'? 'rgba(30,41,59,0.9)':'#ffffff' };
  } else if (preset === 'aurora') {
    t.palette.primary = { ...t.palette.primary, main: '#a855f7' };
    t.palette.secondary = { ...t.palette.secondary, main: '#06b6d4' };
  } else if (preset === 'minimal') {
    t.palette.primary = { ...t.palette.primary, main: mode==='dark'? '#e5e7eb':'#1f2937' };
    t.palette.secondary = { ...t.palette.secondary, main: mode==='dark'? '#9ca3af':'#6b7280' };
  } else if (preset === 'contrast') {
    t.palette.primary = { ...t.palette.primary, main: mode==='dark'? '#ffffff':'#111111' };
    t.palette.secondary = { ...t.palette.secondary, main: '#ef4444' };
    t.palette.text = { ...t.palette.text, primary: mode==='dark'? '#ffffff':'#0a0a0a', secondary: mode==='dark'? '#e5e7eb':'#111827' };
  }

  // Typography
  const baseSans = 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif';
  if (preset === 'neo') {
    t.typography.fontFamily = `Segoe UI, Roboto, Inter, ${baseSans}`;
    t.typography.h1 = { ...t.typography.h1, fontWeight: 800, letterSpacing: '-.02em' };
    t.typography.h2 = { ...t.typography.h2, fontWeight: 700, letterSpacing: '-.01em' };
    t.typography.button = { ...t.typography.button, fontWeight: 700 };
  } else if (preset === 'aurora') {
    t.typography.fontFamily = `Roboto, Inter, ${baseSans}`;
    t.typography.h1 = { ...t.typography.h1, fontWeight: 700 };
    t.typography.h2 = { ...t.typography.h2, fontWeight: 600 };
  } else if (preset === 'minimal') {
    t.typography.fontFamily = `Inter, ${baseSans}`;
    t.typography.h1 = { ...t.typography.h1, fontWeight: 600 };
    t.typography.h2 = { ...t.typography.h2, fontWeight: 600 };
  } else if (preset === 'contrast') {
    const serif = 'Georgia, Cambria, "Times New Roman", Times, serif';
    t.typography.fontFamily = `Segoe UI, Roboto, ${baseSans}`;
    t.typography.h1 = { ...t.typography.h1, fontFamily: serif, fontWeight: 800 };
    t.typography.h2 = { ...t.typography.h2, fontFamily: serif, fontWeight: 700 };
  } else {
    t.typography.fontFamily = `Inter, ${baseSans}`;
  }

  // Components (özet)
  t.components = {
    MuiButton: {
      defaultProps: {
        size: preset === 'minimal' ? 'small' : 'medium',
        variant: preset === 'minimal' ? 'text' : (preset === 'contrast' ? 'outlined' : 'contained')
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: preset==='minimal'? radii.sm : (preset==='neo'? radii.xl : radii.md),
          fontWeight: 600,
          textTransform: 'none',
          paddingInline: preset==='minimal'? theme.spacing(1.25) : theme.spacing(1.75),
          boxShadow: preset==='neo'? (theme.palette.mode==='dark'? '0 8px 24px -8px rgba(0,0,0,0.8)' : '0 10px 28px -10px rgba(0,0,0,0.2)') : 'none',
          '&:hover': {
            boxShadow: preset==='minimal'? 'none' : (preset==='neo'? (theme.palette.mode==='dark'? '0 12px 36px -10px rgba(0,0,0,0.85)' : '0 14px 38px -12px rgba(0,0,0,0.24)') : shadows.sm)
          }
        })
      }
    },
    MuiPaper: {
      defaultProps: { elevation: preset==='minimal' ? 0 : (preset==='neo' ? 2 : 1) },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: preset==='minimal'? radii.sm : radii.lg,
          backgroundImage: 'none',
          background: preset==='neo'
            ? (theme.palette.mode==='dark'
                ? 'linear-gradient(180deg, rgba(31,41,55,0.85), rgba(17,24,39,0.82))'
                : 'linear-gradient(180deg,#ffffff,#f9fafb)')
            : (preset==='aurora'? (theme.palette.mode==='dark'
                ? 'linear-gradient(165deg, rgba(17,24,39,0.72), rgba(17,24,39,0.55))'
                : 'linear-gradient(165deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))') : undefined),
        })
      }
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: preset==='minimal'? radii.sm : radii.lg,
          border: preset==='neo'? '1px solid transparent' : (preset==='contrast'? '2px solid' : '1px solid'),
          borderColor: preset==='neo'? 'transparent' : (preset==='contrast'? (theme.palette.mode==='dark'? '#ffffff' : '#000000') : (theme.palette.mode==='dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')),
        })
      }
    }
  };

  return t;
}

const PRESETS = ['classic','neo','aurora','minimal','contrast'];

export default function ThemePreview(){
  const { mode, setPreset } = useAppTheme();
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Tema Önizleme</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Her kutu, ilgili preset ile stillenmiştir. Beğendiğinizi Uygula ile aktif edebilirsiniz.</Typography>
  <Grid container spacing={2}>
        {PRESETS.map((p)=>{
          const theme = makeTheme(mode, p);
          const title = p.charAt(0).toUpperCase() + p.slice(1);
          return (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
                      <Chip size="small" label={mode === 'dark' ? 'Dark' : 'Light'} />
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" gutterBottom>Başlık</Typography>
                    <Typography variant="body2" color="text.secondary">Bu kutu {title} temasını örnekler.</Typography>
                    <Stack direction="row" spacing={1.25} sx={{ mt: 1.5 }}>
                      <Button color="primary">Birincil</Button>
                      <Button color="secondary">İkincil</Button>
                      <Button variant="outlined">Çerçeve</Button>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">{p}</Typography>
                    <Button size="small" variant="contained" onClick={()=> setPreset(p)}>Uygula</Button>
                  </CardActions>
                </Card>
              </ThemeProvider>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
