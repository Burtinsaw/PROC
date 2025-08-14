import React from 'react';
import { Box, Stack, Grid, TextField, IconButton, Button, Typography, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * KeyValueEditor
 * Props:
 * - value: object of { [key: string]: any }
 * - onChange: (obj) => void
 * - title?: string
 */
export default function KeyValueEditor({ value = {}, onChange, title = 'Öznitelikler' }){
  const [rows, setRows] = React.useState(() => {
    const entries = Object.entries(value || {});
    if (!entries.length) return [{ key: '', value: '' }];
    return entries.map(([k, v]) => ({ key: String(k), value: v == null ? '' : String(v) }));
  });

  // Sync when parent value reference changes meaningfully
  React.useEffect(() => {
    const entries = Object.entries(value || {});
    if (entries.length === 0 && rows.length === 1 && rows[0].key === '' && rows[0].value === '') return;
    const incoming = entries.length ? entries.map(([k, v]) => ({ key: String(k), value: v == null ? '' : String(v) })) : [{ key: '', value: '' }];
    setRows(incoming);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = React.useCallback((nextRows) => {
    if (!onChange) return;
    const obj = {};
    for (const r of nextRows) {
      const k = (r.key || '').trim();
      if (!k) continue;
      obj[k] = r.value;
    }
    onChange(obj);
  }, [onChange]);

  const updateCell = (idx, field) => (e) => {
    const v = e.target.value;
    setRows((prev) => {
      const next = prev.map((r, i) => i === idx ? { ...r, [field]: v } : r);
      emit(next);
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => {
      const next = [...prev, { key: '', value: '' }];
      // no emit yet; user will type
      return next;
    });
  };

  const removeRow = (idx) => () => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      emit(next);
      return next.length ? next : [{ key: '', value: '' }];
    });
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={addRow} aria-label="add-attribute">
          Özellik Ekle
        </Button>
      </Stack>
  <Grid container spacing={1}>
        {rows.map((r, i) => (
          <React.Fragment key={i}>
    <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label={`Anahtar ${i + 1}`}
                placeholder="ör. renk"
                value={r.key}
                onChange={updateCell(i, 'key')}
                inputProps={{ 'data-testid': `kv-key-${i}` }}
              />
    </Grid>
    <Grid size={{ xs: 12, md: 7 }}>
              <TextField
                size="small"
                fullWidth
                label="Değer"
                placeholder="ör. kırmızı"
                value={r.value}
                onChange={updateCell(i, 'value')}
                inputProps={{ 'data-testid': `kv-value-${i}` }}
              />
    </Grid>
    <Grid size={{ xs: 12, md: 1 }} textAlign="right">
              <Tooltip title="Satırı sil">
                <IconButton aria-label={`remove-attribute-${i}`} size="small" onClick={removeRow(i)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
    </Grid>
          </React.Fragment>
        ))}
  </Grid>
    </Box>
  );
}
