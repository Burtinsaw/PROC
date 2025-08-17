import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody, Stack, Chip, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function ImportDryRunDialog({ open, onClose, onConfirm, report }){
  const rows = Array.isArray(report?.rows) ? report.rows : [];
  const [filter, setFilter] = React.useState('all'); // all | warn | error
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(report || {}, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dry-run-report.json'; a.click(); URL.revokeObjectURL(url);
  };
  const downloadCSV = () => {
    const headers = ['index','action','id','name','warnings','errors'];
    const lines = [headers.join(',')];
    for(const r of rows){
      const id = r.proformaNumber || r.poNumber || r.entityId || '';
      const name = r.companyName || r.supplierName || '';
      const warn = (r.warnings||[]).join('; ').replace(/"/g,'""');
      const err = (r.errors||[]).join('; ').replace(/"/g,'""');
      const line = [r.index, r.action, id, name, warn, err].map(v => '"'+String(v??'').replace(/"/g,'""')+'"').join(',');
      lines.push(line);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dry-run-report.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>İçe Aktarım Doğrulama (Dry-Run)</DialogTitle>
      <DialogContent dividers>
        <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb: 2 }}>
          <Chip label={`Create: ${report?.created ?? 0}`} color="success" variant="outlined" />
          <Chip label={`Update: ${report?.updated ?? 0}`} color="info" variant="outlined" />
          <Chip label={`Kalem: ${report?.itemCreated ?? 0}`} variant="outlined" />
          <Chip label={`Uyarı: ${report?.warnings ?? 0}`} color="warning" variant="outlined" />
          <Chip label={`Hata: ${report?.errors ?? 0}`} color="error" variant="outlined" />
          <Box sx={{ flex: 1 }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="filter-label">Satır Filtresi</InputLabel>
            <Select labelId="filter-label" label="Satır Filtresi" value={filter} onChange={(e)=> setFilter(e.target.value)}>
              <MenuItem value="all">Hepsi</MenuItem>
              <MenuItem value="warn">Yalnızca Uyarılı</MenuItem>
              <MenuItem value="error">Yalnızca Hatalı</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Typography variant="body2" sx={{ mb: 1 }}>İlk 50 satır gösteriliyor. Tam raporu indir butonlarını kullanın.</Typography>
        <Box sx={{ maxHeight: 360, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Aksiyon</TableCell>
                <TableCell>Kimlik</TableCell>
                <TableCell>Ad</TableCell>
                <TableCell>Uyarılar</TableCell>
                <TableCell>Hatalar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .filter(r => filter==='all' ? true : (filter==='warn' ? (r.warnings?.length>0) : (r.errors?.length>0)))
                .slice(0,50)
                .map((r) => {
                const id = r.proformaNumber || r.poNumber || r.entityId || '';
                const name = r.companyName || r.supplierName || '';
                return (
                  <TableRow key={r.index} hover>
                    <TableCell>{r.index}</TableCell>
                    <TableCell>{r.action}</TableCell>
                    <TableCell>{id}</TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>
                      <Tooltip title={(r.warnings||[]).join('\n')}>
                        <span>{r.warnings?.length || 0}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={(r.errors||[]).join('\n')}>
                        <span>{r.errors?.length || 0}</span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">Kayıt yok</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={downloadJSON} variant="text">JSON indir</Button>
        <Button onClick={downloadCSV} variant="text">CSV indir</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Vazgeç</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">İçe aktarımı başlat</Button>
      </DialogActions>
    </Dialog>
  );
}
