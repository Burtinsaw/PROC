import React from 'react';
import { Box, Typography, Stack, Paper, Stepper, Step, StepLabel, Button, Chip, TextField, Divider, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, CircularProgress } from '@mui/material';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../utils/axios';
import { talepExtractFromText, talepExtractFromFiles, talepGetStaging, talepCommitStaging } from '../../api/talep';
import { toast } from 'sonner';

const steps = ['Oluşturuldu','İnceleme','Onay','Satınalma','Tamamlandı'];

export default function TalepTakip(){
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id') || 'TLP-001';
  const [talep, setTalep] = React.useState(null);
  const activeStep = 2; // placeholder
  const [busy, setBusy] = React.useState(false);
  const [extractText, setExtractText] = React.useState('');
  const [staging, setStaging] = React.useState({ jobId:null, items:[], count:0 });
  const [selected, setSelected] = React.useState(new Set());
  const [uploading, setUploading] = React.useState(false);

  const confChip = (c)=>{
    if (c == null) return <Chip size="small" label="-" variant="outlined" />;
    const val = Number(c);
    const color = val >= 0.75 ? 'success' : val >= 0.5 ? 'warning' : 'error';
    const pct = `${Math.round(val*100)}%`;
    return <Chip size="small" color={color} variant="outlined" label={pct} />;
  };

  React.useEffect(()=>{
    let mounted = true;
    (async ()=>{
  try {
        // If id looks like code (has dashes and letters), fetch by code; else by numeric id
        const byCode = /[A-Z]+-\d{4}-\d{4}-/.test(id);
        const url = byCode ? `/talepler/code/${encodeURIComponent(id)}` : `/talepler/${encodeURIComponent(id)}`;
        const { data } = await axios.get(url);
        if(mounted) setTalep(data);
        // Staging'i getir (varsa)
        try {
          const s = await talepGetStaging(data?.id || id).catch(()=>null);
          if(mounted && s?.ok){
            setStaging({ jobId: s.jobId, items: s.items||[], count: s.count||0 });
          }
        } catch{/* ignore */}
      } catch {/* ignore */}
  finally { /* noop */ }
    })();
    return ()=>{ mounted = false; };
  }, [id]);

  const onExtractFromText = async ()=>{
    if(!extractText.trim()) return toast.warning('Metin girin');
    try{
      setBusy(true);
      const res = await talepExtractFromText(talep?.id || id, extractText.trim());
      if(res?.ok){
        setStaging({ jobId: res.jobId, items: res.items||[], count: res.count||0 });
        setSelected(new Set(res.items?.map(it=>it.id)));
        toast.success(`${res.count||0} satır çıkarıldı`);
      }
    } catch(e){ toast.error(e?.response?.data?.message || 'Çıkarım başarısız'); }
    finally{ setBusy(false); }
  };

  const onUploadFiles = async (files)=>{
    if(!files?.length) return;
    try{
      setUploading(true);
      const res = await talepExtractFromFiles(talep?.id || id, files);
      if(res?.ok){
        setStaging({ jobId: res.jobId, items: res.items||[], count: res.count||0 });
        setSelected(new Set(res.items?.map(it=>it.id)));
        toast.success(`${res.count||0} satır çıkarıldı`);
      }
    } catch(e){ toast.error(e?.response?.data?.message || 'Dosya yükleme/çıkarım hatası'); }
    finally{ setUploading(false); }
  };

  const onCommit = async ()=>{
    if(!staging.jobId) return toast.warning('Önce çıkarım yapın');
    try{
      setBusy(true);
      const itemIds = Array.from(selected);
      const res = await talepCommitStaging(talep?.id || id, staging.jobId, itemIds);
      if(res?.ok){ toast.success(`${res.committed||0} kalem işlendi`); }
    } catch(e){ toast.error(e?.response?.data?.message || 'Aktarım hatası'); }
    finally{ setBusy(false); }
  };
  return (
    <Box p={3} sx={{ display:'flex', flexDirection:'column', gap:3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={2} alignItems="center">
          <Button size="small" variant="text" startIcon={<ArrowLeft size={16} />} onClick={()=>navigate('/talep')}>Geri</Button>
          <Typography variant="h4" fontWeight={600}>Talep Takip</Typography>
        </Stack>
      </Stack>
      <Paper elevation={0} sx={{ p:3, borderRadius:3, display:'flex', flexDirection:'column', gap:3 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="subtitle1" fontWeight={600}>{id}</Typography>
          {talep?.proformaNumber && (
            <Chip size="small" color="info" variant="outlined" label={talep.proformaNumber}
              onClick={()=> navigate(`/proforma/${encodeURIComponent(talep.proformaNumber)}`)} />
          )}
        </Stack>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* AI Maestro: Talep Extract Staging Paneli */}
        <Divider sx={{ my:1 }} />
        <Typography variant="h6" fontWeight={600}>Ürün Çıkarım (AI Maestro)</Typography>
        <Stack direction={{ xs:'column', md:'row' }} gap={2} alignItems={{ xs:'stretch', md:'flex-start' }}>
          <Box flex={1}>
            <TextField
              label="Metinden çıkar (her satır bir ürün olabilir)"
              multiline
              minRows={4}
              fullWidth
              value={extractText}
              onChange={(e)=>setExtractText(e.target.value)}
            />
            <Stack direction="row" gap={1} sx={{ mt:1 }}>
              <Button variant="contained" disabled={busy} onClick={onExtractFromText}>Metinden Çıkar</Button>
              <Button component="label" variant="outlined" startIcon={<Upload size={16} />} disabled={uploading}>
                Dosya Yükle
                <input type="file" multiple accept=".txt,.pdf,.doc,.docx,.xlsx,.xls,.csv,.tsv,.png,.jpg,.jpeg,.bmp,.tif,.tiff,.webp,.html,.htm" hidden onChange={(e)=>onUploadFiles(Array.from(e.target.files||[]))} />
              </Button>
              {busy || uploading ? <CircularProgress size={20} /> : null}
            </Stack>
          </Box>
          <Box flex={2}>
            <Typography variant="subtitle2" gutterBottom>Staging Kalemleri ({staging.count||0})</Typography>
            <Paper variant="outlined" sx={{ maxHeight: 360, overflow:'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox
                      indeterminate={selected.size>0 && selected.size<(staging.items?.length||0)}
                      checked={selected.size>0 && selected.size===(staging.items?.length||0)}
                      onChange={(e)=>{
                        if(e.target.checked) setSelected(new Set((staging.items||[]).map(i=>i.id)));
                        else setSelected(new Set());
                      }} /></TableCell>
                    <TableCell>Satır</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>Marka</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Artikel</TableCell>
                    <TableCell>Miktar</TableCell>
                    <TableCell>Birim</TableCell>
                    <TableCell>Güven</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(staging.items||[]).map(it=> (
                    <TableRow key={it.id} hover>
                      <TableCell padding="checkbox"><Checkbox checked={selected.has(it.id)} onChange={(e)=>{
                        setSelected(prev => { const s=new Set(prev); if(e.target.checked) s.add(it.id); else s.delete(it.id); return s; });
                      }} /></TableCell>
                      <TableCell>{it.rawLine || it.name || '-'}</TableCell>
                      <TableCell>{it.description || '-'}</TableCell>
                      <TableCell>{it.brand || '-'}</TableCell>
                      <TableCell>{it.model || '-'}</TableCell>
                      <TableCell>{it.article_code || it.articleCode || '-'}</TableCell>
                      <TableCell>{it.quantity || 1}</TableCell>
                      <TableCell>{it.unit || '-'}</TableCell>
                      <TableCell>{confChip(it.confidence)}</TableCell>
                    </TableRow>
                  ))}
                  {!(staging.items||[]).length && (
                    <TableRow><TableCell colSpan={9} align="center">Henüz staging yok</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
            <Stack direction="row" justifyContent="flex-end" sx={{ mt:1 }}>
              <Button variant="contained" disabled={!staging.jobId || selected.size===0 || busy} onClick={onCommit}>Seçilenleri İçe Aktar</Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
