import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid } from '@mui/material';

export default function CompanyDialog({ open, onClose, onSubmit, initial }){
  const [form, setForm] = useState({ name:'', code:'', type:'', email:'', phone:'' });
  const [saving, setSaving] = useState(false);
  useEffect(()=>{
    if(open){
      setForm({ name:'', code:'', type:'', email:'', phone:'', ...(initial||{}) });
    }
  }, [open, initial]);

  const handleSubmit = async ()=>{
    setSaving(true);
    try {
      await onSubmit(form);
      onClose(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={()=> onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.id ? 'Şirketi Düzenle' : 'Yeni Şirket'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt:0.25 }}>
          <Grid size={{ xs: 12 }}>
            <TextField label="Ad" value={form.name} onChange={(e)=> setForm(f=>({...f,name:e.target.value}))} fullWidth required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Kod" value={form.code||''} onChange={(e)=> setForm(f=>({...f,code:e.target.value}))} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Tür" value={form.type||''} onChange={(e)=> setForm(f=>({...f,type:e.target.value}))} fullWidth placeholder="supplier|customer|logistics|warehouse|customs" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="E-posta" value={form.email||''} onChange={(e)=> setForm(f=>({...f,email:e.target.value}))} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Telefon" value={form.phone||''} onChange={(e)=> setForm(f=>({...f,phone:e.target.value}))} fullWidth />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=> onClose(false)} disabled={saving}>Vazgeç</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>{initial?.id ? 'Kaydet' : 'Oluştur'}</Button>
      </DialogActions>
    </Dialog>
  );
}
