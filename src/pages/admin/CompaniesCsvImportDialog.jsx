import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Slider,
  Stack,
  Tooltip,
  Typography,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
} from '@mui/material';
import { Upload, CheckSquare, Square, FileText, RefreshCcw } from 'lucide-react';
import { parseCompaniesCsv } from '../../utils/bulkImport/parseCompaniesCsv';
import { clusterBySimilarity } from '../../utils/bulkImport/clusterBySimilarity';
import companyService from '../../services/companyService';

export default function CompaniesCsvImportDialog({ open, onClose, onImported }){
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  // keep raw text if we want to surface diagnostics in future; omit for now to satisfy lints
  const [parsed, setParsed] = useState({ rows: [], meta: {} });
  const [threshold, setThreshold] = useState(0.82);
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(new Set()); // Set<number> of row index in parsed.rows
  const [existing, setExisting] = useState({ codes: new Set(), names: new Set() });
  const [includeConflicts, setIncludeConflicts] = useState(false);

  useEffect(() => {
    if (!open) {
      // reset state when closed
      setLoading(false);
      setFileName('');
      setParsed({ rows: [], meta: {} });
      setGroups([]);
      setSelected(new Set());
      setThreshold(0.82);
    }
  }, [open]);

  const stats = useMemo(() => ({
    total: parsed.rows?.length || 0,
    groups: groups?.length || 0,
    selected: selected.size,
  }), [parsed.rows, groups, selected]);

  function handleFilePick(e){
    const file = e.target.files?.[0];
    if(!file) return;
    setFileName(file.name);
    setLoading(true);
  file.text().then(async t => {
      const p = parseCompaniesCsv(t);
      setParsed(p);
      const g = clusterBySimilarity(p.rows, { threshold });
      setGroups(g);
      // fetch existing list to mark conflicts (code or exact name)
      try {
        const existingList = await companyService.exportCompanies();
        const arr = Array.isArray(existingList) ? existingList : (Array.isArray(existingList?.companies) ? existingList.companies : []);
        const codes = new Set(arr.map(x => String(x.code||'').trim()).filter(Boolean));
        const names = new Set(arr.map(x => String(x.name||'').trim().toLowerCase()).filter(Boolean));
        setExisting({ codes, names });
        // preselect all EXCEPT conflicts
        const selectSet = new Set();
        p.rows.forEach((row, i) => {
          const code = String(row.code||'').trim();
          const name = String(row.name||'').trim().toLowerCase();
          const conflict = (code && codes.has(code)) || (name && names.has(name));
          if(includeConflicts || !conflict) selectSet.add(i);
        });
        // if none selected (e.g., all conflicted and includeConflicts=false), fall back to select all
        setSelected(selectSet.size ? selectSet : new Set(p.rows.map((_,i)=>i)));
  } catch {
        // if export fails, just preselect all
        setSelected(new Set(p.rows.map((_,i)=>i)));
      }
    }).catch(err => {
      alert('Dosya okunamadı: ' + (err?.message||'bilinmiyor'));
    }).finally(() => setLoading(false));
  }

  // Recompute selection when includeConflicts toggles, if we have parsed rows and existing cache
  useEffect(() => {
    if(!parsed.rows?.length) return;
    if(!existing) return;
    const selectSet = new Set();
    parsed.rows.forEach((row, i) => {
      const code = String(row.code||'').trim();
      const name = String(row.name||'').trim().toLowerCase();
      const conflict = (code && existing.codes.has(code)) || (name && existing.names.has(name));
      if(includeConflicts || !conflict) selectSet.add(i);
    });
    setSelected(selectSet.size ? selectSet : new Set(parsed.rows.map((_,i)=>i)));
  }, [includeConflicts, existing, parsed.rows]);

  function recomputeClusters(newThreshold){
    if(!parsed.rows?.length) return;
    const g = clusterBySimilarity(parsed.rows, { threshold: newThreshold });
    setGroups(g);
    // keep selection for existing indices
    setSelected(prev => new Set([...prev].filter(i => i >= 0 && i < parsed.rows.length)));
  }

  function toggleGroup(group){
    const allInGroup = group.items.map(it => it.index);
    const allSelected = allInGroup.every(i => selected.has(i));
    const next = new Set(selected);
    if(allSelected){
      allInGroup.forEach(i => next.delete(i));
    } else {
      allInGroup.forEach(i => next.add(i));
    }
    setSelected(next);
  }

  function toggleItem(index){
    const next = new Set(selected);
    if(next.has(index)) next.delete(index); else next.add(index);
    setSelected(next);
  }

  async function handleImport(){
    if(!selected.size){
      alert('Seçili kayıt yok.');
      return;
    }
    try{
      setLoading(true);
      const payload = [...selected].sort((a,b)=>a-b).map(i => parsed.rows[i]);
      const res = await companyService.importCompanies(payload);
      const created = res?.created ?? 0;
      const updated = res?.updated ?? 0;
      alert(`İçe aktarma tamamlandı. Yeni: ${created}, Güncellenen: ${updated}`);
      onImported && onImported();
      onClose && onClose(true);
    }catch(err){
      alert('İçe aktarma hatası: ' + (err?.response?.data?.message || err?.message || 'bilinmiyor'));
    }finally{
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose && onClose(false)} maxWidth="lg" fullWidth>
      <DialogTitle>Şirketler - CSV Önizleme ve İçe Aktarma</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="outlined" component="label" startIcon={<Upload size={16} />}>
                  CSV Dosyası Seç
                  <input type="file" hidden accept=".csv,.tsv,.txt" onChange={handleFilePick} />
                </Button>
                {fileName && <Typography variant="body2" color="text.secondary">{fileName}</Typography>}
                {!!parsed.rows?.length && (
                  <Tooltip title="Tümünü Seç/Kaldır">
                    <IconButton onClick={()=>{
                      if(selected.size === parsed.rows.length) setSelected(new Set());
                      else setSelected(new Set(parsed.rows.map((_,i)=>i)));
                    }}>
                      {selected.size === parsed.rows.length ? <CheckSquare size={18} /> : <Square size={18} />}
                    </IconButton>
                  </Tooltip>
                )}
                {!!parsed.rows?.length && (
                  <FormControlLabel
                    sx={{ ml: 1 }}
                    control={<Checkbox size="small" checked={includeConflicts} onChange={(_,v)=> setIncludeConflicts(v)} />}
                    label={<Typography variant="caption">Var olanları da içeri al (güncelle)</Typography>}
                  />
                )}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" sx={{ display:'block' }}>Benzerlik Eşiği: {threshold.toFixed(2)}</Typography>
              <Slider min={0.5} max={0.98} step={0.01} value={threshold} onChange={(_,v)=>{
                const t = Array.isArray(v) ? v[0] : v;
                setThreshold(t);
              }} onChangeCommitted={(_,v)=>{
                const t = Array.isArray(v) ? v[0] : v;
                recomputeClusters(t);
              }} />
            </Grid>
          </Grid>
        </Box>

        {loading && <LinearProgress sx={{ my:1 }} />}

        <Stack direction="row" spacing={2} sx={{ my:1 }}>
          <Typography variant="body2">Toplam: <b>{stats.total}</b></Typography>
          <Typography variant="body2">Gruplar: <b>{stats.groups}</b></Typography>
          <Typography variant="body2">Seçili: <b>{stats.selected}</b></Typography>
        </Stack>

        {!parsed.rows?.length && (
          <Typography variant="body2" color="text.secondary">
            CSV/TSV dosyanızda başlıklar varsa otomatik eşlenir. Desteklenen sütun isimleri: ad/name, kod/code, tür/type, email, telefon/phone.
          </Typography>
        )}

        {!!groups.length && (
          <Box sx={{ maxHeight: 420, overflow: 'auto', border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
            {groups.map((g, gi) => {
              const allIdx = g.items.map(it => it.index);
              const allSelected = allIdx.every(i => selected.has(i));
              const someSelected = !allSelected && allIdx.some(i => selected.has(i));
              return (
                <Box key={g.id} sx={{ p:1.5, borderBottom: theme => `1px dashed ${theme.palette.divider}` }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FormControlLabel
                        control={<Checkbox checked={allSelected} indeterminate={someSelected} onChange={()=> toggleGroup(g)} />}
                        label={<Typography variant="subtitle2">Grup #{gi+1}: {g.representative?.name || '(adsız)'} {g.representative?.code ? `• ${g.representative.code}` : ''}</Typography>}
                      />
                    </Stack>
                    <Tooltip title="Grubu Çevir">
                      <IconButton size="small" onClick={()=>{
                        const next = new Set(selected);
                        allIdx.forEach(i => next.has(i) ? next.delete(i) : next.add(i));
                        setSelected(next);
                      }}>
                        <RefreshCcw size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Grid container spacing={1}>
                    {g.items.map((it, ii) => (
                      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`${g.id}-${ii}`}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent sx={{ p:1.25 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Checkbox size="small" checked={selected.has(it.index)} onChange={()=> toggleItem(it.index)} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{it.row?.name || '(adsız)'}</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display:'block' }}>
                              {it.row?.code ? `Kod: ${it.row.code} • ` : ''}
                              {it.row?.type || 'tip yok'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display:'block' }}>
                              {it.row?.email || 'email yok'} {it.row?.phone ? `• ${it.row.phone}` : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display:'block' }}>
                              {it.row?.preferredCurrency ? `PB: ${String(it.row.preferredCurrency).toUpperCase()}` : 'PB yok'}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <FileText size={14} />
                              <Typography variant="caption" color="text.secondary">Benzerlik: {(it.score*100).toFixed(0)}%</Typography>
                              {(() => {
                                const code = String(it.row?.code||'').trim();
                                const name = String(it.row?.name||'').trim().toLowerCase();
                                const conflict = (code && existing.codes.has(code)) || (name && existing.names.has(name));
                                return conflict ? (
                                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                    • Var olan kayıt (kod/ad)
                                  </Typography>
                                ) : null;
                              })()}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose && onClose(false)}>Kapat</Button>
        <Button variant="contained" disabled={!selected.size} onClick={handleImport}>Seçilileri İçe Aktar</Button>
      </DialogActions>
    </Dialog>
  );
}
