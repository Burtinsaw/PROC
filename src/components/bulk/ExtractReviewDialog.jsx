import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, TextField } from '@mui/material';

export default function ExtractReviewDialog({ open, items = [], onCancel, onApply }){
  const [rows, setRows] = useState([]);
  const allChecked = rows.length > 0 && rows.every(r => !!r.include);

  useEffect(()=>{
    if(open) {
      setRows(items.map((p, idx)=> ({ id: idx+1, include: true, ...p, quantity: Number(p.quantity)||1, unit: p.unit || 'adet' })));
    }
  }, [open, items]);

  const update = (i, key, val) => setRows(arr => arr.map((r, idx)=> idx===i ? { ...r, [key]: val } : r));
  const toggleAll = (checked) => setRows(arr => arr.map(r => ({ ...r, include: checked })));

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>İçe Aktarılan Ürünleri Gözden Geçir</DialogTitle>
      <DialogContent dividers>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allChecked}
                  indeterminate={!allChecked && rows.some(r => r.include)}
                  onChange={(e)=> toggleAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>Ürün Adı</TableCell>
              <TableCell width={90}>Miktar</TableCell>
              <TableCell width={110}>Birim</TableCell>
              <TableCell>Marka</TableCell>
              <TableCell>Model/Kod</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i)=>(
              <TableRow key={r.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox checked={!!r.include} onChange={(e)=> update(i, 'include', e.target.checked)} />
                </TableCell>
                <TableCell>
                  <TextField
                    value={r.name||''}
                    onChange={(e)=> update(i, 'name', e.target.value)}
                    size="small"
                    fullWidth
                    required
                    error={!r.name}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={r.quantity||1}
                    onChange={(e)=> update(i, 'quantity', Number(e.target.value)||1)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 1 }}
                    required
                    error={!r.quantity || Number(r.quantity) < 1}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={r.unit||'adet'}
                    onChange={(e)=> update(i, 'unit', e.target.value)}
                    size="small"
                    fullWidth
                    required
                    error={!r.unit}
                  />
                </TableCell>
                <TableCell>
                  <TextField value={r.brand||''} onChange={(e)=> update(i, 'brand', e.target.value)} size="small" fullWidth />
                </TableCell>
                <TableCell>
                  <TextField value={r.articleNumber||''} onChange={(e)=> update(i, 'articleNumber', e.target.value)} size="small" fullWidth />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>İptal</Button>
        <Button
          variant="contained"
          onClick={() => {
            const selected = rows
              .filter(r => r.include)
              .map(r => ({
                name: r.name || '',
                quantity: Number(r.quantity) || 1,
                unit: r.unit || 'adet',
                brand: r.brand || '',
                articleNumber: r.articleNumber || ''
              }));
            onApply(selected);
          }}
        >
          Ekle ({rows.filter(r=> r.include).length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
