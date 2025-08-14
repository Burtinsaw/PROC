import React, { useEffect, useState, useMemo, useRef, useDeferredValue } from 'react';
import { Dialog, DialogContent, TextField, List, ListItemButton, Typography, Box, Fade, ListItemIcon, Chip } from '@mui/material';
import navConfig from '../../navigation/navConfig';
import fuzzyScore from '../../utils/fuzzyScore';
import { useNavigate } from 'react-router-dom';

function buildCommands() {
  const cmds = [];
  navConfig.forEach(item => {
    if(item.path) {
      cmds.push({ id:item.id, label:item.label, labelLower: item.label.toLowerCase(), path:item.path, section:item.label, icon:item.icon });
    }
    if(item.groups) {
      item.groups.forEach(g => {
        g.links.forEach(l => {
          cmds.push({ id:l.id, label:l.label, labelLower: l.label.toLowerCase(), path:l.path, section:item.label, group:g.label, icon:item.icon });
        });
      });
    }
  });
  return cmds;
}

// scoring moved to utils/fuzzyScore

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef();
  const lastFocusedRef = useRef(null);
  const commands = useMemo(()=> buildCommands(), []);
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(()=> {
    if(!deferredQuery.trim()) return commands.slice(0, 30);
    const arr = [];
    for(const c of commands) {
  const sc = fuzzyScore(c.labelLower, deferredQuery);
      if(sc>=0) arr.push({ ...c, _score:sc });
    }
    return arr.sort((a,b)=> b._score - a._score).slice(0,50);
  }, [commands, deferredQuery]);

  const highlight = (label) => {
    if(!deferredQuery.trim()) return label;
    const ql = deferredQuery.toLowerCase();
    const ll = label.toLowerCase();
    const idx = ll.indexOf(ql);
    if(idx>=0) {
      return <span>{label.slice(0,idx)}<mark style={{ background:'transparent', color:'var(--mui-palette-primary-main)', fontWeight:600 }}>{label.slice(idx, idx+deferredQuery.length)}</mark>{label.slice(idx+deferredQuery.length)}</span>;
    }
    // Fallback: no contiguous substring, return plain label
    return label;
  };

  useEffect(()=> {
    if(open){
      lastFocusedRef.current = document.activeElement;
      setQuery('');
      setFocusIdx(0);
      setTimeout(()=> inputRef.current?.focus(), 40);
    } else if(lastFocusedRef.current){
      // restore focus to invoker
      setTimeout(()=> lastFocusedRef.current?.focus?.(), 10);
    }
  }, [open]);

  const handleKey = (e) => {
    if(e.key==='ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(results.length-1, i+1)); }
    if(e.key==='ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(0, i-1)); }
    if(e.key==='Home') { e.preventDefault(); setFocusIdx(0); }
    if(e.key==='End') { e.preventDefault(); setFocusIdx(results.length-1); }
    if(e.key==='Enter') {
      const sel = results[focusIdx];
      if(sel) { navigate(sel.path); onClose(); }
    }
    if(e.key==='Escape') { onClose(); }
    if(e.key==='Tab') {
      // keep focus within dialog (simple trap: return to input)
      if(!e.shiftKey) {
        e.preventDefault();
        setTimeout(()=> inputRef.current?.focus(), 0);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" TransitionComponent={Fade} keepMounted aria-modal="true" role="dialog" aria-labelledby="cmd-pal-title" aria-describedby="cmd-pal-desc">
      <DialogContent sx={(theme)=>({
        p:0,
        background: theme.preset==='aurora'
          ? (theme.palette.mode==='dark'
              ? 'linear-gradient(135deg, rgba(17,24,39,0.92), rgba(30,41,59,0.85))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.90), rgba(240,247,255,0.85))')
          : undefined,
        backdropFilter: theme.preset==='aurora'? 'blur(28px)': undefined,
        border: '1px solid', borderColor: 'divider', borderRadius: 3,
        boxShadow:'0 12px 40px -4px rgba(0,0,0,0.35)'
      })}>
        <Box sx={{ p:1.5, borderBottom:'1px solid', borderColor:'divider' }}>
          <Typography id="cmd-pal-title" variant="body2" sx={{ position:'absolute', left:-10000, top:'auto', width:1, height:1, overflow:'hidden' }}>Komut Paleti</Typography>
          <Typography id="cmd-pal-desc" variant="body2" sx={{ position:'absolute', left:-10000, top:'auto', width:1, height:1, overflow:'hidden' }}>Aramak için yazın, ok tuşlarıyla gezin, Enter ile seçin, Esc ile kapatın.</Typography>
          <TextField
            inputRef={inputRef}
            value={query}
            onChange={e=> { setQuery(e.target.value); setFocusIdx(0);} }
            onKeyDown={handleKey}
            placeholder="Komut veya sayfa ara..."
            fullWidth size="small"
            InputProps={{ sx:{ borderRadius:2, fontSize:14, py:0.5 } }}
          />
          <Box sx={{ display:'flex', gap:1, mt:1, flexWrap:'wrap' }}>
            <Chip size="small" label="Ctrl+K" variant="outlined" />
            <Chip size="small" label="Esc" variant="outlined" />
            <Chip size="small" label="↑↓" variant="outlined" />
            <Chip size="small" label="Enter" variant="outlined" />
          </Box>
          <Box role="status" aria-live="polite" sx={{ mt:0.5, fontSize:11, opacity:0.6 }}>
            {results.length} sonuç
          </Box>
        </Box>
        <Box sx={{ maxHeight:400, overflowY:'auto', py:0.5 }} onKeyDown={handleKey}>
          {results.length ? (
            <List dense disablePadding role="listbox" aria-label="Komut sonuçları">
              {results.map((r,i)=> {
                const Icon = r.icon;
                const selected = i===focusIdx;
                return (
                  <ListItemButton
                    key={r.id}
                    selected={selected}
                    role="option"
                    aria-selected={selected}
                    tabIndex={selected? 0 : -1}
                    onFocus={()=> setFocusIdx(i)}
                    onMouseEnter={()=> setFocusIdx(i)}
                    onClick={()=> { navigate(r.path); onClose(); }}
                    sx={(theme)=>({
                      gap:1,
                      alignItems:'flex-start',
                      '&.Mui-selected': { background: theme.palette.action.selected, '&:hover': { background: theme.palette.action.selected } }
                    })}
                  >
                    {Icon && (
                      <ListItemIcon sx={{ minWidth:26, mt:0.3 }}>
                        <Icon size={16} />
                      </ListItemIcon>
                    )}
                    <Box sx={{ display:'flex', flexDirection:'column' }}>
                      <Typography variant="body2" sx={{ fontWeight:500 }}>{highlight(r.label)}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.section}{r.group? ' • '+r.group: ''}</Typography>
                    </Box>
                  </ListItemButton>
                );
              })}
            </List>
          ) : (
            <Box sx={{ p:3, textAlign:'center' }}>
              <Typography variant="body2" color="text.secondary" role="status" aria-live="polite">Sonuç yok</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
