import React, { useEffect, useState } from 'react';
import { Box, Paper, Stack, Typography, Divider, Button, TextField, Chip, IconButton, Breadcrumbs, Link, Tooltip } from '@mui/material';
import ContentContainer from '../../components/layout/ContentContainer';
import { listTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../api/email';
import BorderColorIcon from '@mui/icons-material/BorderColor';

export default function EmailTemplates(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [form, setForm] = useState({ id:null, name:'', html:'', shortcut:'', isShared:false });
  const [open, setOpen] = useState(false);

  const load = async () => {
    try{ setLoading(true); setError(''); const list = await listTemplates(); setItems(list||[]); }
    catch(e){ setError(e.message||'Yüklenemedi'); }
    finally{ setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onNew = () => { setForm({ id:null, name:'', html:'', shortcut:'', isShared:false }); setOpen(true); };
  const onEdit = (t) => { setForm({ id:t.id, name:t.name||'', html:t.html||'', shortcut:t.shortcut||'', isShared:!!t.isShared }); setOpen(true); };
  const onSave = async () => {
    try{
      if (form.id) await updateTemplate(form.id, { name: form.name, html: form.html, shortcut: form.shortcut, isShared: form.isShared });
      else await createTemplate({ name: form.name, html: form.html, shortcut: form.shortcut, isShared: form.isShared });
      setOpen(false); setInfo('Kaydedildi'); await load();
    }catch(e){ setError(e.message||'Kaydedilemedi'); }
  };
  const onDelete = async (t) => {
    if(!t?.id) return; if(!window.confirm('Silinsin mi?')) return;
    try{ await deleteTemplate(t.id); setInfo('Silindi'); await load(); }
    catch(e){ setError(e.message||'Silinemedi'); }
  };

  return (
    <ContentContainer>
      <Stack spacing={1} sx={{ mb:2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 12 }}>
          <Link underline="hover" color="inherit" href="/settings">Ayarlar</Link>
          <Link underline="hover" color="inherit" href="/settings/email">E-Posta</Link>
          <Typography color="text.primary" sx={{ fontSize: 12 }}>Şablonlar</Typography>
        </Breadcrumbs>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Şablonlar</Typography>
      </Stack>
      <Paper variant="outlined" sx={{ p:2, opacity: loading ? 0.6 : 1 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={onNew}>Yeni Şablon</Button>
            <Box flex={1} />
            {info && <Chip label={info} color="success" onDelete={()=> setInfo('')} />}
            {error && <Chip label={error} color="error" onDelete={()=> setError('')} />}
          </Stack>
          <Divider />
          <Stack spacing={1}>
            {items.map(t => (
              <Paper key={t.id} variant="outlined" sx={{ p:1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 600 }}>{t.name}</Typography>
                  {t.shortcut ? <Chip size="small" label={t.shortcut} /> : null}
                  {t.isShared ? <Chip size="small" label="Paylaşılan" color="info" /> : <Chip size="small" label="Özel" />}
                  <Box flex={1} />
                  <Tooltip title="Düzenle"><IconButton size="small" onClick={()=> onEdit(t)}><BorderColorIcon fontSize="inherit" /></IconButton></Tooltip>
                  <Button size="small" color="error" onClick={()=> onDelete(t)}>Sil</Button>
                </Stack>
              </Paper>
            ))}
            {(!items || items.length===0) && (
              <Typography color="text.secondary">Henüz şablon yok.</Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
      {open && (
        <Paper variant="outlined" sx={{ position:'fixed', right:16, bottom:80, width: 520, zIndex: 1300, p:2 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1">Şablon {(form.id ? 'Düzenle' : 'Oluştur')}</Typography>
            <TextField size="small" label="Ad" value={form.name} onChange={(e)=> setForm(s=>({ ...s, name:e.target.value }))} fullWidth />
            <TextField size="small" label="Kısayol" value={form.shortcut} onChange={(e)=> setForm(s=>({ ...s, shortcut:e.target.value }))} fullWidth />
            <TextField label="HTML" value={form.html} onChange={(e)=> setForm(s=>({ ...s, html:e.target.value }))} fullWidth multiline minRows={10} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip size="small" label={form.isShared ? 'Paylaşılan' : 'Özel'} onClick={()=> setForm(s=>({ ...s, isShared: !s.isShared }))} />
              <Box flex={1} />
              <Button onClick={()=> setOpen(false)}>Kapat</Button>
              <Button variant="contained" onClick={onSave} disabled={!form.name || !form.html}>Kaydet</Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </ContentContainer>
  );
}
