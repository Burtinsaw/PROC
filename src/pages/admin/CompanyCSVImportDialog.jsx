import React, { useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack, Checkbox, FormControlLabel, Paper, Chip, Divider } from '@mui/material';
import { parseCSV } from '../../utils/csv';
import fuzzyScore from '../../utils/fuzzyScore';

// Lightweight similarity using fuzzyScore to group near-duplicates
function similarity(a, b){
  const al = (a||'').toLowerCase();
  const bl = (b||'').toLowerCase();
  if(!al || !bl) return 0;
  if(al === bl) return 1;
  const maxLen = Math.max(al.length, bl.length);
  const score = fuzzyScore(al, bl); // higher is better
  const norm = Math.min(1, score / (maxLen*2));
  return norm;
}

function clusterByName(items, threshold=0.72){
  const groups = [];
  const visited = new Set();
  for(let i=0;i<items.length;i++){
    if(visited.has(i)) continue;
    const base = items[i];
    const group = [i];
    visited.add(i);
    for(let j=i+1;j<items.length;j++){
      if(visited.has(j)) continue;
      const s = similarity(base.name, items[j].name);
      if(s >= threshold){ group.push(j); visited.add(j); }
    }
    groups.push(group);
  }
  return groups;
}

function normalizeRow(row){
  // Attempt to map common header variants to our fields
  const map = {};
  for(const [k,v] of Object.entries(row)){
    const key = (k||'').toLowerCase().trim();
    if(['name','isim','ünvan','unvan','firma','şirket','sirket'].includes(key)) map.name = v?.trim();
    if(['code','kod','kodu','firma kodu','company_code'].includes(key)) map.code = v?.trim();
    if(['type','tip','tur','tür','kategori','grup'].includes(key)) map.type = v?.trim();
    if(['email','e-mail','mail'].includes(key)) map.email = v?.trim();
    if(['phone','telefon','tel','gsm'].includes(key)) map.phone = v?.trim();
  }
  // Fallbacks: if no name, try first non-empty column
  if(!map.name){
    const vals = Object.values(row).map(x => (x||'').trim()).filter(Boolean);
    if(vals.length) map.name = vals[0];
  }
  return map;
}

export default function CompanyCSVImportDialog({ open, onClose, onConfirm }){
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState({ headers: [], rows: [] });
  const [selected, setSelected] = useState({}); // key: index, value: boolean
  const [groupExpanded, setGroupExpanded] = useState({});

  const normalized = useMemo(() => parsed.rows.map(normalizeRow).filter(r => r.name), [parsed]);
  const groups = useMemo(() => clusterByName(normalized), [normalized]);

  const total = normalized.length;
  const prechecked = useMemo(() => {
    const obj = {};
    normalized.forEach((_, idx) => { obj[idx] = true; });
    return obj;
  }, [normalized]);

  React.useEffect(() => { setSelected(prechecked); }, [prechecked]);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setFileName(file.name);
    const text = await file.text();
    const result = parseCSV(text);
    setParsed(result);
  };

  const includedItems = useMemo(() => normalized.map((item, idx) => ({...item, __idx: idx})).filter(x => selected[x.__idx]), [normalized, selected]);

  const handleToggle = (idx) => setSelected(s => ({ ...s, [idx]: !s[idx] }));

  const handleConfirm = () => {
    if(!includedItems.length) return onClose?.();
    onConfirm?.(includedItems);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>CSV'den Şirket İçe Aktar (Önizleme ve Seçim)</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button component="label" variant="outlined">CSV Dosyası Seç
              <input hidden type="file" accept=".csv,text/csv" onChange={onPickFile} />
            </Button>
            <Typography variant="body2" color="text.secondary">{fileName || 'Henüz dosya seçilmedi'}</Typography>
            {total>0 && <Chip label={`${total} kayıt`} size="small" />}  
          </Stack>
          {parsed.headers.length>0 && (
            <Typography variant="caption" color="text.secondary">Algılanan sütunlar: {parsed.headers.join(', ')}</Typography>
          )}

          {groups.length>0 ? (
            <Stack spacing={1}>
              {groups.map((groupIdxs, gIdx) => {
                const sample = normalized[groupIdxs[0]];
                const title = sample?.name || `Grup ${gIdx+1}`;
                const dup = groupIdxs.length>1;
                return (
                  <Paper key={gIdx} variant={dup?"outlined":"elevation"} sx={{ p:1, borderColor: dup? 'warning.main': undefined }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FormControlLabel control={<Checkbox checked={groupIdxs.every(i => selected[i])} indeterminate={!groupIdxs.every(i=>selected[i]) && groupIdxs.some(i=>selected[i])} onChange={(e)=>{
                        const val = e.target.checked; setSelected(s=>{ const ns={...s}; groupIdxs.forEach(i=> ns[i]=val); return ns; });
                      }} />} label={<Typography fontWeight={600}>{title}</Typography>} />
                      {dup && <Chip color="warning" size="small" label="Benzerler bulundu" />}
                      <Button size="small" onClick={()=> setGroupExpanded(x=> ({...x, [gIdx]: !x[gIdx]}))}>{groupExpanded[gIdx]? 'Gizle':'Detay'}</Button>
                    </Stack>
                    {(groupExpanded[gIdx] || dup) && (
                      <Box sx={{ pl:4, pt:1 }}>
                        {groupIdxs.map((i) => (
                          <Stack key={i} direction="row" spacing={2} alignItems="center" sx={{ py:0.5 }}>
                            <Checkbox checked={!!selected[i]} onChange={()=>handleToggle(i)} />
                            <Typography sx={{ minWidth: 320 }}>{normalized[i].name}</Typography>
                            <Divider orientation="vertical" flexItem />
                            <Typography variant="body2" color="text.secondary">{normalized[i].code || '—'}</Typography>
                            <Typography variant="body2" color="text.secondary">{normalized[i].type || '—'}</Typography>
                            <Typography variant="body2" color="text.secondary">{normalized[i].email || '—'}</Typography>
                            <Typography variant="body2" color="text.secondary">{normalized[i].phone || '—'}</Typography>
                          </Stack>
                        ))}
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">CSV dosyasını seçin; benzer kayıtlar otomatik gruplanır. İlk satır başlık olarak kabul edilir.</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={!includedItems.length}>Seçilenleri İçe Aktar</Button>
      </DialogActions>
    </Dialog>
  );
}
