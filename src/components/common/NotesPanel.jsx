import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Box, Stack, Typography, Paper, TextField, Divider, IconButton, Button } from '@mui/material';
import { Trash2 } from 'lucide-react';
import axios from '../../utils/axios';
import { toast } from 'sonner';
import AuthContext from '../../contexts/AuthContext';

/**
 * NotesPanel
 * Props:
 * - base (string): entity base path, e.g. '/rfqs', '/purchase-orders', '/talepler', '/shipments'
 * - entityId (string|number): id of the entity
 * - title (string, optional): header title (default: 'Notlar')
 */
export default function NotesPanel({ base, entityId, title = 'Notlar' }) {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const canDelete = (() => {
    const r = (user?.role || '').toLowerCase();
    return ['admin', 'satinalma_muduru', 'purchase_manager', 'procurement_manager'].includes(r);
  })();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${base}/${entityId}/notes`);
      setNotes(data?.notes || data || []);
    } catch (e) {
      // Sessiz geç; bazı sayfalarda opsiyonel olabilir
      if (e?.response?.status !== 403) console.warn('Notes load error', e?.message);
    } finally { setLoading(false); }
  }, [base, entityId]);

  useEffect(() => { load(); }, [load]);

  const addNote = async () => {
    const txt = (draft || '').trim();
    if (!txt) { toast.error('Not boş olamaz'); return; }
    try {
      const { data } = await axios.post(`${base}/${entityId}/notes`, { text: txt });
      setNotes(prev => [...prev, data]);
      setDraft('');
    } catch {
      toast.error('Not eklenemedi');
    }
  };

  const removeNote = async (id) => {
    if (!canDelete) return;
  try {
      await axios.delete(`${base}/${entityId}/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
  } catch { toast.error('Not silinemedi'); }
  };

  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      <Paper variant="outlined" sx={{ p: 1.5, mt: 1 }}>
        <Stack spacing={1}>
          <TextField
            multiline
            minRows={2}
            maxRows={6}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Yeni not ekle"
            disabled={loading}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="contained" onClick={addNote} disabled={loading}>Ekle</Button>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            {(notes || []).map((n) => (
              <Box key={n.id} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={1}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{n.text}</Typography>
                  {canDelete && (
                    <IconButton size="small" onClick={() => removeNote(n.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {(n.createdByName || '')}{(n.createdByName && ' • ')}{n.createdAt ? new Date(n.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                </Typography>
              </Box>
            ))}
            {(!notes || notes.length === 0) && (
              <Typography variant="body2" color="text.secondary">Henüz not yok.</Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
