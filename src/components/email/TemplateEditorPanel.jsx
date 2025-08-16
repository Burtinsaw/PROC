import React from 'react';
import { Paper, Stack, Typography, TextField, Chip, Box, Button } from '@mui/material';

export default function TemplateEditorPanel({
  tplForm,
  setTplForm,
  tplSaving,
  onSaveTemplate,
  onClose,
  tplNameRef
}) {
  if (!tplForm) return null;
  const invalidName = !String(tplForm.name || '').trim();
  const invalidHtml = !String(tplForm.html || '').trim();
  return (
    <Paper
      variant="outlined"
      sx={{ position: 'fixed', right: 16, bottom: 80, width: 420, zIndex: 1300, p: 2 }}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (!tplSaving && !invalidName && !invalidHtml) onSaveTemplate();
        }
      }}
   >
      <Stack spacing={1}>
        <Typography variant="subtitle1">Şablon {(tplForm.id ? 'Düzenle' : 'Oluştur')}</Typography>
        <TextField
          inputRef={tplNameRef}
          size="small"
          label="Ad"
          value={tplForm.name}
          onChange={(e) => setTplForm((s) => ({ ...s, name: e.target.value }))}
          fullWidth
          required
          error={invalidName}
          helperText={invalidName ? 'Zorunlu alan' : ' '}
        />
        <TextField
          size="small"
          label="Kısayol"
          value={tplForm.shortcut}
          onChange={(e) => setTplForm((s) => ({ ...s, shortcut: e.target.value }))}
          fullWidth
        />
        <TextField
          label="HTML"
          value={tplForm.html}
          onChange={(e) => setTplForm((s) => ({ ...s, html: e.target.value }))}
          fullWidth
          multiline
          minRows={6}
          required
          error={invalidHtml}
          helperText={invalidHtml ? 'Zorunlu alan' : ' '}
        />
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip
            size="small"
            label={tplForm.isShared ? 'Paylaşılan' : 'Özel'}
            onClick={() => setTplForm((s) => ({ ...s, isShared: !s.isShared }))}
          />
          <Box flex={1} />
          <Button onClick={onClose} aria-label="Şablon kapat">
            Kapat
          </Button>
          <Button
            variant="contained"
            onClick={onSaveTemplate}
            disabled={tplSaving || invalidName || invalidHtml}
            aria-label="Şablonu kaydet"
          >
            {tplSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
