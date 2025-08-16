import React, { useRef, useState } from 'react';
import { Paper, Stack, Typography, Divider, Button, LinearProgress } from '@mui/material';
import ContentContainer from '../../components/layout/ContentContainer';
import { importContactsCsv } from '../../api/email';

export default function EmailSettingsImporter(){
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const onPick = () => inputRef.current?.click();
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setBusy(true);
    setResult(null);
    try{
  const r = await importContactsCsv(file);
      setResult(r);
    } finally { setBusy(false); }
  };

  return (
    <ContentContainer>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Kişiler İçe Aktarma</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>CSV Dosyasından</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onFile} style={{ display:'none' }} />
            <Button variant="contained" size="small" onClick={onPick} disabled={busy}>CSV Seç</Button>
            {busy && <LinearProgress sx={{ flex: 1, alignSelf:'center' }} />}
          </Stack>
          {result && (
            <Typography variant="body2" color="text.secondary">
              Toplam: {result.total ?? '-'} • Eklendi: {result.inserted ?? '-'} • Güncellendi: {result.updated ?? '-'} • Hatalı: {result.failed ?? '-'}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Beklenen kolonlar: name, email, company (opsiyonel). İlk satır başlık olmalıdır. UTF-8 önerilir.
          </Typography>
        </Stack>
      </Paper>
    </ContentContainer>
  );
}
