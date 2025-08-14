import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography, Chip, Divider, LinearProgress, ToggleButtonGroup, ToggleButton, Paper } from '@mui/material';
import { parseBulkProducts, mergeProducts, translateProductsIfNeeded } from '../../utils/bulkImport/parseBulkProducts';
import ProductConflictsDialog from './ProductConflictsDialog';

export default function BulkImportDialog({ open, onClose, onApply, existing=[], initialRaw='' }) {
  const [raw, setRaw] = useState(initialRaw);
  const [translating, setTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState('tr');
  const [preview, setPreview] = useState([]);
  const [translateStats, setTranslateStats] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const { products, meta } = useMemo(() => parseBulkProducts(raw), [raw]);

  useEffect(() => {
    if(open && initialRaw && !raw) {
      setRaw(initialRaw);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(()=>{
    // reset when dialog closes
    if(!open) return;
  }, [open]);

  useEffect(()=>{ if(!open) { setRaw(''); } }, [open]);

  useEffect(()=>{ /* keep raw synced with initialRaw if dialog reopened */ }, [initialRaw]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if(!products.length){ setPreview([]); return; }
      if(targetLang === 'orig' || targetLang === meta?.language?.guess){ setPreview(products.slice(0,5)); setTranslateStats(null); return; }
      setTranslating(true);
      const { products: translated, stats } = await translateProductsIfNeeded(products, targetLang === 'orig' ? meta?.language?.guess : targetLang);
      if(!cancelled){
        setPreview(translated.slice(0,5));
        setTranslateStats(stats || null);
      }
      setTranslating(false);
    })();
    return ()=>{ cancelled = true; };
  }, [products, targetLang, meta]);

  const apply = async () => {
    let list = products;
    if(targetLang !== 'orig' && meta?.language?.guess !== targetLang){
      setTranslating(true);
      const res = await translateProductsIfNeeded(products, targetLang);
      list = res.products;
      setTranslating(false);
    }
    // Conflict detection (same name+brand existing)
    const key = (p) => (p.name + '|' + (p.brand||'')).toLowerCase();
    const existingMap = new Map(existing.map(p=>[key(p), p]));
    const incomingConflicts = [];
    list.forEach(p => { const k = key(p); if(existingMap.has(k)) incomingConflicts.push({ key:k, existing: existingMap.get(k), incoming: p }); });
    if(incomingConflicts.length){
      setConflicts(incomingConflicts);
      setShowConflicts(true);
      // store provisional list for later
      setPreview(list.slice(0,5));
      return;
    }
    onApply(mergeProducts(existing, list));
    setRaw('');
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Toplu Ürün İçe Aktar</DialogTitle>
      <DialogContent dividers>
        <Stack gap={2}>
          <Typography variant="body2" color="text.secondary">
            Excel / CSV / tablo verisini yapıştırın. Sütun başlıkları otomatik algılanmaya çalışılır (örn: Name, Qty, Unit, Brand, Model).
          </Typography>
          <TextField
            value={raw}
            onChange={(e)=>setRaw(e.target.value)}
            multiline
            minRows={8}
            placeholder={"Örnek:\nÜrün,Miktar,Birim,Marka,Model\nVida,100,adet,ABC,VR-10"}
            fullWidth
          />
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">Hedef Dil:</Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={targetLang}
                onChange={(_, val) => { if(val) setTargetLang(val); }}
              >
                <ToggleButton value="orig">Orijinal</ToggleButton>
                <ToggleButton value="tr">TR</ToggleButton>
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="ru">RU</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {products.length > 0 && (
              <Typography variant="caption" color="text.secondary">İlk {Math.min(5, products.length)} satır önizleme</Typography>
            )}
          </Stack>
          {meta && !meta.empty && (
            <Stack gap={1}>
              <Divider flexItem />
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Chip size="small" label={`Satır: ${products.length}`} />
                <Chip size="small" label={`Ayracı: ${meta.delimiter === '\t' ? 'TAB' : meta.delimiter}`} />
                {meta.hasHeader && <Chip size="small" color="success" label="Başlık Algılandı" />}
                <Chip size="small" label={`Dil Tahmini: ${meta.language?.guess}`} />
                {translateStats?.stats && (
                  <Chip size="small" color="info" label={`Çevrilen: ${translateStats.stats?.totalTranslatedTokens || 0}`} />
                )}
                {translateStats?.stats?.totalFuzzy > 0 && (
                  <Chip size="small" color="warning" label={`Fuzzy: ${translateStats.stats.totalFuzzy}`} />
                )}
                {translateStats?.stats?.sourceLang && (
                  <Chip size="small" label={`Kaynak Dil: ${translateStats.stats.sourceLang}`} />
                )}
                {translateStats?.stats?.locale && translateStats.stats.locale !== translateStats.stats?.sourceLang && (
                  <Chip size="small" label={`Sunucu Locale: ${translateStats.stats.locale}`} />
                )}
                {translateStats?.stats?.reason === 'same-language' && (
                  <Chip size="small" label="Çeviri Atlandı (aynı dil)" />
                )}
                {meta.stats && (
                  <>
                    <Chip size="small" label={`Ham Satır: ${meta.stats.rawLineCount}`} />
                    <Chip size="small" label={`Boş Atl.: ${meta.stats.skippedEmpty}`} />
                    <Chip size="small" label={`Birim Norm.: ${meta.stats.unitNormalizedCount}`} />
                  </>
                )}
              </Stack>
              {meta.header && (
                <Typography variant="caption" color="text.secondary">
                  Başlık Mapping: {Object.entries(meta.headerMap).map(([i,f])=>`${meta.header[i]}→${f}`).join(', ')}
                </Typography>
              )}
            </Stack>
          )}
          {translating && <LinearProgress />}
          {!!preview.length && (
            <Paper variant="outlined" sx={{ p:1.5, maxHeight: 220, overflowY:'auto' }}>
              <Stack gap={0.75}>
                {preview.map((p,i)=>(
                  <Typography key={i} variant="caption" sx={{ fontFamily:'monospace' }}>
                    {i+1}. {p.name}  |  {p.quantity} {p.unit} {p.brand && `| ${p.brand}`}
                  </Typography>
                ))}
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button disabled={!products.length || translating} variant="contained" onClick={apply}>Ekle ({products.length})</Button>
      </DialogActions>
  </Dialog>
  {showConflicts && (
      <ProductConflictsDialog
        open={showConflicts}
        conflicts={conflicts}
        onCancel={()=>{ setShowConflicts(false); }}
        onResolve={(choices)=>{
          // Reconstruct final list using earlier translation result (preview currently holds subset; reparse raw to be safe)
          let list = products;
          if(targetLang !== 'orig' && meta?.language?.guess !== targetLang){
            // We need to re-run translation to get full translated list
            translateProductsIfNeeded(products, targetLang).then(res => {
              list = res.products;
              const keyFn = (p) => (p.name + '|' + (p.brand||'')).toLowerCase();
              const existingMap2 = new Map(existing.map(p=>[keyFn(p), p]));
              Object.entries(choices).forEach(([k, action]) => {
                const conflict = conflicts.find(c=>c.key===k);
                if(!conflict) return;
                const ex = existingMap2.get(k);
                const inc = list.find(p=>keyFn(p)===k) || conflict.incoming;
                if(!ex || !inc) return;
                if(action === 'merge'){
                  ex.quantity += inc.quantity || 0;
                } else if(action === 'replace'){
                  Object.assign(ex, inc);
                } else if(action === 'keepBoth'){
                  const clone = { ...inc, name: inc.name + ' (kopya)' };
                  existingMap2.set(keyFn(clone)+'__dup'+Math.random(), clone);
                } else if(action === 'skip') {
                  // do nothing
                }
              });
              const mergedFinal = Array.from(existingMap2.values());
              onApply(mergedFinal);
              setShowConflicts(false);
              setRaw('');
            });
          } else {
            const keyFn = (p) => (p.name + '|' + (p.brand||'')).toLowerCase();
            const existingMap2 = new Map(existing.map(p=>[keyFn(p), p]));
            Object.entries(choices).forEach(([k, action]) => {
              const conflict = conflicts.find(c=>c.key===k);
              if(!conflict) return;
              const ex = existingMap2.get(k);
              const inc = list.find(p=>keyFn(p)===k) || conflict.incoming;
              if(!ex || !inc) return;
              if(action === 'merge'){
                ex.quantity += inc.quantity || 0;
              } else if(action === 'replace'){
                Object.assign(ex, inc);
              } else if(action === 'keepBoth'){
                const clone = { ...inc, name: inc.name + ' (kopya)' };
                existingMap2.set(keyFn(clone)+'__dup'+Math.random(), clone);
              } else if(action === 'skip') {
                // do nothing
              }
            });
            const mergedFinal = Array.from(existingMap2.values());
            onApply(mergedFinal);
            setShowConflicts(false);
            setRaw('');
          }
        }}
      />
    )}
    </>
  );
}
