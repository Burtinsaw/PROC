import React from 'react';
import { Box, Stack, TextField, Chip, IconButton, Tooltip, Divider } from '@mui/material';
import { RefreshCcw as RefreshIcon, Eraser as ClearAllIcon } from 'lucide-react';

/*
  FilterBar: Tablo üstü aksiyon & filtre rafı
  Props:
    - search: { value, onChange, placeholder }
    - filters: Array<{ key, label, options: string[], value, onChange }>
    - chips?: Array<{ key, label, active:boolean, onToggle }>
    - onRefresh?: () => void
    - onClear?: () => void
    - dense?: boolean
*/
export default function FilterBar({ search, filters=[], chips=[], onRefresh, onClear, dense=false, right }) {
  const padY = dense? .5 : 1;
  return (
    <Box sx={(theme)=>({
      position:'relative',
      display:'flex',
      flexWrap:'wrap',
      alignItems:'center',
      gap:1,
      padding: theme.spacing(padY, 1.25),
      borderBottom:'1px solid',
      borderColor: theme.palette.divider,
      background: theme.preset==='aurora'
        ? (theme.palette.mode==='dark'
            ? 'linear-gradient(120deg, rgba(17,24,39,0.6), rgba(17,24,39,0.4))'
            : 'linear-gradient(120deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))')
        : (theme.palette.mode==='dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
      backdropFilter: theme.preset==='aurora'? 'blur(14px)':undefined,
      WebkitBackdropFilter: theme.preset==='aurora'? 'blur(14px)':undefined,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12
    })}>
      <Stack direction="row" gap={1} alignItems="center" sx={{ flexWrap:'wrap', flex:1 }}>
        {search && (
          <TextField
            size="small"
            placeholder={search.placeholder || 'Ara...'}
            value={search.value}
            onChange={(e)=> search.onChange(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        )}
        {filters.map(f => (
          <TextField
            key={f.key}
            select
            size="small"
            label={f.label}
            value={f.value}
            onChange={(e)=> f.onChange(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <option value=""></option>
            {f.options.map(o=> <option key={o} value={o}>{o}</option>)}
          </TextField>
        ))}
        {chips.length>0 && (
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {chips.map(c => (
              <Chip
                key={c.key}
                label={c.label}
                color={c.active? 'primary':'default'}
                size="small"
                variant={c.active? 'filled':'outlined'}
                onClick={()=> c.onToggle?.()}
              />
            ))}
          </Stack>
        )}
      </Stack>
      <Stack direction="row" alignItems="center" gap={0.5}>
        {onClear && (
          <Tooltip title="Temizle">
            <IconButton onClick={onClear} size="small"><ClearAllIcon size={16} /></IconButton>
          </Tooltip>
        )}
        {onRefresh && (
          <Tooltip title="Yenile">
            <IconButton onClick={onRefresh} size="small"><RefreshIcon size={16} /></IconButton>
          </Tooltip>
        )}
        {right}
      </Stack>
    </Box>
  );
}
