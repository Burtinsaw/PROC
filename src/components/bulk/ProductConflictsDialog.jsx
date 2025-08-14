import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, RadioGroup, FormControlLabel, Radio, Divider, Chip, Paper } from '@mui/material';

/*
Conflict object shape (provided by BulkImportDialog):
{
  key: string,
  existing: Product,
  incoming: Product
}

Resolution actions per conflict:
- merge: add quantities (existing.quantity += incoming.quantity)
- replace: overwrite existing fields (name, quantity, unit, brand, articleNumber)
- keepBoth: keep existing, also add modified copy of incoming (with name suffix)
- skip: ignore incoming
*/

export default function ProductConflictsDialog({ open, conflicts, onResolve, onCancel }) {
  const [choices, setChoices] = useState(() => Object.fromEntries(conflicts.map(c => [c.key, 'merge'])));

  const handleChange = (key, value) => {
    setChoices(prev => ({ ...prev, [key]: value }));
  };

  const apply = () => {
    onResolve(choices);
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>Çakışan Ürünler</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>
          Aynı isim + marka kombinasyonuna sahip ürünler bulundu. Her biri için bir işlem seçin.
        </Typography>
        <Stack gap={2}>
          {conflicts.map(c => {
            const key = c.key;
            const existing = c.existing;
            const incoming = c.incoming;
            return (
              <Paper key={key} variant="outlined" sx={{ p:1.5 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
                  <Stack flex={1} minWidth={260} gap={0.5}>
                    <Typography variant="subtitle2">Var Olan</Typography>
                    <Typography variant="caption" sx={{ fontFamily:'monospace' }}>{existing.name} | {existing.quantity} {existing.unit} {existing.brand && `| ${existing.brand}`}</Typography>
                  </Stack>
                  <Stack flex={1} minWidth={260} gap={0.5}>
                    <Typography variant="subtitle2">İçe Aktarılan</Typography>
                    <Typography variant="caption" sx={{ fontFamily:'monospace' }}>{incoming.name} | {incoming.quantity} {incoming.unit} {incoming.brand && `| ${incoming.brand}`}</Typography>
                  </Stack>
                </Stack>
                <Divider sx={{ my:1 }} />
                <RadioGroup
                  row
                  value={choices[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                >
                  <FormControlLabel value="merge" control={<Radio size="small" />} label={<Stack direction="row" spacing={1} alignItems="center"><span>Birlestir</span><Chip size="small" label="qty+" /></Stack>} />
                  <FormControlLabel value="replace" control={<Radio size="small" />} label="Değiştir (Yeni ile)" />
                  <FormControlLabel value="keepBoth" control={<Radio size="small" />} label="İkisini de Tut" />
                  <FormControlLabel value="skip" control={<Radio size="small" />} label="Yoksay" />
                </RadioGroup>
              </Paper>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>İptal</Button>
        <Button variant="contained" onClick={apply}>Kararları Uygula</Button>
      </DialogActions>
    </Dialog>
  );
}
