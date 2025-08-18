import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Paper,
  Chip,
  Slider,
  Button
} from '@mui/material';
import { useAppTheme } from '../../contexts/useAppTheme';

/**
 * MUI Theme Toggle Component
 * Merkezi theme yönetimi için tam özellikli ayarlar paneli
 */
export default function ThemeToggle({ showAdvanced = true, compact = false }) {
  const { 
    mode, 
    toggleTheme, 
    preset, 
    setPreset,
    density, 
    setDensity, 
    corner, 
    setCorner,
    theme 
  } = useAppTheme();

  // Mevcut preset listesi
  const presets = [
    { value: 'classic', label: 'Classic', description: 'Klasik düzen' },
    { value: 'neo', label: 'Neo', description: 'Modern mavi tonlar' },
    { value: 'aurora', label: 'Aurora', description: 'Canlı renkler' },
    { value: 'business', label: 'Business', description: 'Kurumsal ERP tarzı' },
    { value: 'procurement', label: 'Procurement', description: 'Tedarik süreçleri' },
    { value: 'minimal', label: 'Minimal', description: 'Sade tasarım' },
    { value: 'contrast', label: 'Contrast', description: 'Yüksek kontrast' }
  ];

  const densities = [
    { value: 'compact', label: 'Sıkışık' },
    { value: 'standard', label: 'Standart' },
    { value: 'comfortable', label: 'Rahat' }
  ];

  const corners = [
    { value: 'sm', label: 'Küçük' },
    { value: 'md', label: 'Orta' },
    { value: 'lg', label: 'Büyük' },
    { value: 'xl', label: 'Extra Büyük' }
  ];

  if (compact) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
          label={mode === 'dark' ? 'Koyu' : 'Açık'}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Stil</InputLabel>
          <Select value={preset} onChange={(e) => setPreset(e.target.value)}>
            {presets.map(p => (
              <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Ana Tema Ayarları */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tema Ayarları
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={3}>
          {/* Mod Toggle */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Tema Modu
            </Typography>
            <FormControlLabel
              control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
              label={`${mode === 'dark' ? 'Koyu' : 'Açık'} tema`}
            />
          </Box>

          {/* Preset Seçimi */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Tasarım Stili
            </Typography>
            <Stack spacing={2}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={preset}
                onChange={(_, value) => value && setPreset(value)}
                sx={{ flexWrap: 'wrap' }}
              >
                {presets.map(p => (
                  <ToggleButton key={p.value} value={p.value}>
                    {p.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              
              {/* Preset Açıklaması */}
              {presets.find(p => p.value === preset)?.description && (
                <Typography variant="caption" color="text.secondary">
                  {presets.find(p => p.value === preset).description}
                </Typography>
              )}
            </Stack>
          </Box>

          {showAdvanced && (
            <>
              {/* Yoğunluk Ayarı */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Layout Yoğunluğu
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={density}
                  onChange={(_, value) => value && setDensity(value)}
                >
                  {densities.map(d => (
                    <ToggleButton key={d.value} value={d.value}>
                      {d.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* Köşe Yarıçapı */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Köşe Yarıçapı
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={corner}
                  onChange={(_, value) => value && setCorner(value)}
                >
                  {corners.map(c => (
                    <ToggleButton key={c.value} value={c.value}>
                      {c.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            </>
          )}
        </Stack>
      </Paper>

      {/* Tema Önizlemesi */}
      {showAdvanced && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Renk Paleti
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              label="Primary" 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText 
              }} 
            />
            <Chip 
              label="Secondary" 
              sx={{ 
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText 
              }} 
            />
            <Chip 
              label="Success" 
              sx={{ 
                bgcolor: theme.palette.success.main,
                color: theme.palette.success.contrastText 
              }} 
            />
            <Chip 
              label="Warning" 
              sx={{ 
                bgcolor: theme.palette.warning.main,
                color: theme.palette.warning.contrastText 
              }} 
            />
            <Chip 
              label="Error" 
              sx={{ 
                bgcolor: theme.palette.error.main,
                color: theme.palette.error.contrastText 
              }} 
            />
            <Chip 
              label="Info" 
              sx={{ 
                bgcolor: theme.palette.info.main,
                color: theme.palette.info.contrastText 
              }} 
            />
          </Stack>
        </Paper>
      )}

      {/* Demo Links */}
      {showAdvanced && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tema Demoları
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => window.open('/business-theme-demo', '_blank')}
            >
              Business Demo
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => window.open('/procurement-theme-demo', '_blank')}
            >
              Procurement Demo
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => window.open('/settings/theme-preview', '_blank')}
            >
              Tema Önizleme
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
