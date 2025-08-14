import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Divider, IconButton, InputAdornment, List, ListItem, ListItemAvatar, ListItemText, Stack, TextField, Typography, Avatar, Chip } from '@mui/material';
import { listCompanyUsers, getChatWith, sendText, listGroups, getGroupChat, sendFile, adminListConversations, adminGetChat, adminEditMessage, adminDeleteMessage } from '../api/messages';
import { useChat } from '../contexts/ChatContext';
import { Paperclip, Send } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';

export default function Messages(){
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState({ type: 'dm', id: null });
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { presence, socket } = useChat() || {};
  const { user } = useAuth();
  const isAdmin = (user?.role === 'admin');
  const [adminConvos, setAdminConvos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [tmpSeq, setTmpSeq] = useState(0);

  useEffect(()=>{ (async ()=>{
    try {
      const [u, g] = await Promise.all([listCompanyUsers(), listGroups()]);
      setUsers(u); setGroups(g);
  } catch { /* ignore */ }
  if (isAdmin) { try { setAdminConvos(await adminListConversations()); } catch { /* ignore */ } }
  })(); }, [isAdmin]);

  useEffect(() => {
    if (!active.id) return;
    (async () => {
      try {
  if (active.type === 'dm') setMessages(await getChatWith(active.id));
        else setMessages(await getGroupChat(active.id));
      } catch { /* ignore */ }
    })();
  }, [active]);

  // Aktif konuşmayı yenile yardımcı
  const refreshActive = useCallback(async () => {
    try {
      if (active.type === 'dm' && active.id) setMessages(await getChatWith(active.id));
      else if (active.type === 'group' && active.id) setMessages(await getGroupChat(active.id));
      else if (active.type === 'admin-dm' && typeof active.id === 'string') {
        const [u1s, u2s] = String(active.id).split('-');
        const u1 = Number(u1s), u2 = Number(u2s);
        if (u1 && u2) setMessages(await adminGetChat(u1, u2));
      }
    } catch { /* ignore */ }
  }, [active]);

  // Socket olaylarıyla canlı güncelleme
  useEffect(() => {
    if (!socket) return;
    const myId = Number(user?.id || 0);
    const matchesActive = (m) => {
      if (!m) return false;
      if (active.type === 'group' && active.id) return Number(m.groupId || 0) === Number(active.id);
      if (active.type === 'dm' && active.id && myId) {
        const a = Number(active.id);
        return (!m.groupId) && ((m.senderId === myId && m.receiverId === a) || (m.senderId === a && m.receiverId === myId));
      }
      if (active.type === 'admin-dm' && typeof active.id === 'string') {
        const [u1s, u2s] = String(active.id).split('-');
        const u1 = Number(u1s), u2 = Number(u2s);
        if (!u1 || !u2) return false;
        return (!m.groupId) && ((m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1));
      }
      return false;
    };
    const onNew = ({ message }) => { if (matchesActive(message)) refreshActive(); if (isAdmin) { adminListConversations().then(setAdminConvos).catch(() => {}); } };
  const onEdit = () => { /* daha hafif: sadece aktifse yenile */ refreshActive(); };
  const onDelete = () => { refreshActive(); };
    // Okundu bilgisi: sadece ilgili DM açıksa yerelde mesajları işaretle
    const onRead = ({ by, ids }) => {
      if (!Array.isArray(ids) || ids.length === 0) return;
      const byNum = Number(by || 0);
      const isActiveDm = (active.type === 'dm' && Number(active.id || 0) === byNum)
        || (active.type === 'admin-dm' && typeof active.id === 'string' && active.id.split('-').includes(String(byNum)));
      if (!isActiveDm) return;
      const idSet = new Set([...ids, ...ids.map((x)=> String(x))]);
      setMessages(prev => prev.map(m => idSet.has(m.id) || idSet.has(String(m.id))
        ? { ...m, isRead: true, readAt: m.readAt || new Date().toISOString() }
        : m));
    };
    socket.on('message:new', onNew);
    socket.on('message:edit', onEdit);
    socket.on('message:delete', onDelete);
    socket.on('message:read', onRead);
    return () => {
      socket.off?.('message:new', onNew);
      socket.off?.('message:edit', onEdit);
      socket.off?.('message:delete', onDelete);
      socket.off?.('message:read', onRead);
    };
  }, [socket, active, user?.id, isAdmin, refreshActive]);

  const onSend = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    // Optimistik geçici mesaj ekle
    const tmpId = `tmp-${Date.now()}-${tmpSeq}`;
    setTmpSeq(s => s + 1);
    const self = user || {};
    const optimistic = {
      id: tmpId,
      content,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      senderId: self.id,
      receiverId: active.type==='dm' ? active.id : null,
      groupId: active.type==='group' ? active.id : null,
      sender: { id: self.id, username: self.username, firstName: self.firstName, lastName: self.lastName },
      __pending: true,
    };
    setMessages(prev => [...prev, optimistic]);
    // Gönder ve sonuçla senkronize ol
    try {
      await sendText({ receiverId: optimistic.receiverId || undefined, groupId: optimistic.groupId || undefined, content });
      // Başarı: socket 'message:new' tetikleyecek; yine de fallback olarak kısa süre sonra yenile
      setTimeout(() => { refreshActive(); }, 1500);
    } catch {
      // Hata: pending mesajı hata durumuna geçir
      setMessages(prev => prev.map(m => m.id===tmpId ? { ...m, __pending:false, __error:true } : m));
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Optimistik dosya mesajı
    const tmpId = `tmp-file-${Date.now()}-${tmpSeq}`;
    setTmpSeq(s => s + 1);
    const self = user || {};
    const optimistic = {
      id: tmpId,
      content: `Dosya: ${file.name}`,
      messageType: 'file',
      fileName: file.name,
      createdAt: new Date().toISOString(),
      senderId: self.id,
      receiverId: active.type==='dm' ? active.id : null,
      groupId: active.type==='group' ? active.id : null,
      sender: { id: self.id, username: self.username, firstName: self.firstName, lastName: self.lastName },
      __pending: true,
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      await sendFile({ receiverId: optimistic.receiverId || undefined, groupId: optimistic.groupId || undefined, file });
      setTimeout(() => { refreshActive(); }, 2000);
    } catch {
      setMessages(prev => prev.map(m => m.id===tmpId ? { ...m, __pending:false, __error:true } : m));
    }
  };

  const presenceMap = presence || {};
  const isOnline = (id) => !!presenceMap[id];

  const startEdit = (m) => { setEditingId(m.id); setEditingText(m.content||''); };
  const cancelEdit = () => { setEditingId(null); setEditingText(''); };
  const saveEdit = async (m) => {
    try { await adminEditMessage(m.id, editingText.trim()); setEditingId(null); setEditingText('');
      // refresh current view
      if (active.type==='dm' && active.id) setMessages(await getChatWith(active.id));
      else if (active.type==='group' && active.id) setMessages(await getGroupChat(active.id));
      else if (isAdmin && adminConvos.length) setAdminConvos(await adminListConversations());
    } catch { /* ignore */ }
  };
  const deleteMsg = async (m) => {
    try { await adminDeleteMessage(m.id);
      if (active.type==='dm' && active.id) setMessages(await getChatWith(active.id));
      else if (active.type==='group' && active.id) setMessages(await getGroupChat(active.id));
      else if (isAdmin && adminConvos.length) setAdminConvos(await adminListConversations());
    } catch { /* ignore */ }
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2 }}>
      <Card sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0 }}>
        <CardContent>
          <Typography variant="h6">Sohbetler</Typography>
          <Divider sx={{ my: 1 }} />
          {isAdmin && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="overline" color="text.secondary">Admin: Tüm Konuşmalar</Typography>
              <List dense sx={{ maxHeight: 200, overflow:'auto', border:'1px dashed', borderColor:'divider', borderRadius:1, mb:1 }}>
                {adminConvos.map(c => (
                  <ListItem key={`${c.u1?.id}-${c.u2?.id}`} button onClick={async ()=> {
                    setActive({ type:'dm', id: null });
                    try { setMessages(await adminGetChat(c.u1?.id, c.u2?.id)); setActive({ type:'admin-dm', id:`${c.u1?.id}-${c.u2?.id}` }); } catch { /* ignore */ }
                  }}>
                    <ListItemAvatar><Avatar>{(c.u1?.firstName||c.u1?.username||'?')[0]}</Avatar></ListItemAvatar>
                    <ListItemText primary={`${c.u1?.firstName||c.u1?.username} ↔ ${c.u2?.firstName||c.u2?.username}`} secondary={c.lastMessage?.content} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          <Typography variant="overline" color="text.secondary">Kişiler</Typography>
          <List dense>
            {users.map(u => (
              <ListItem key={u.id} button selected={active.type==='dm' && active.id===u.id} onClick={()=> setActive({ type: 'dm', id: u.id })}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: isOnline(u.id) ? 'success.main' : 'grey.500' }}>{(u.firstName||u.username||'?')[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={`${u.firstName||''} ${u.lastName||''}`.trim() || u.username} secondary={isOnline(u.id) ? 'Çevrimiçi' : 'Çevrimdışı'} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Typography variant="overline" color="text.secondary">Gruplar</Typography>
          <List dense>
            {groups.map(g => (
              <ListItem key={g.id} button selected={active.type==='group' && active.id===g.id} onClick={()=> setActive({ type: 'group', id: g.id })}>
                <ListItemAvatar><Avatar>{(g.name||'?')[0]}</Avatar></ListItemAvatar>
                <ListItemText primary={g.name} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1, minHeight: 520 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flex: 1, overflow: 'auto', mb: 1 }}>
            {messages.map(m => (
              <Box key={m.id} sx={{ mb: 1.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Avatar sx={{ width: 28, height: 28 }}>{(m.sender?.firstName||m.sender?.username||'?')[0]}</Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">{new Date(m.createdAt).toLocaleString()}</Typography>
                  {editingId===m.id ? (
                    <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
                      <TextField size="small" value={editingText} onChange={(e)=> setEditingText(e.target.value)} />
                      <Button size="small" variant="contained" onClick={()=> saveEdit(m)}>Kaydet</Button>
                      <Button size="small" onClick={cancelEdit}>Vazgeç</Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: m.__pending? 0.6 : 1 }}>{m.content}</Typography>
                  )}
                  {m.messageType==='file' && (
                    <Typography variant="body2" color="primary">📎 {m.fileName}</Typography>
                  )}
                  {/* Okundu göstergesi: sadece benim gönderdiğim ve okundu olan DM mesajları için */}
                  {m.senderId === user?.id && (m.isRead || m.readAt) && !m.__pending && (
                    <Typography variant="caption" color="text.secondary">✓ Okundu</Typography>
                  )}
                  {(m.__pending || m.__error) && (
                    <Box sx={{ mt:.5 }}>
                      {m.__pending && <Chip size="small" label="Gönderiliyor…" />}
                      {m.__error && <Chip size="small" color="error" label="Gönderilemedi" />}
                    </Box>
                  )}
                  {isAdmin && (
                    <Box sx={{ mt:.5, display:'flex', gap:1 }}>
                      <Chip size="small" label="Düzenle" onClick={()=> startEdit(m)} />
                      <Chip size="small" color="error" label="Sil" onClick={()=> deleteMsg(m)} />
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth size="small" placeholder="Mesaj yazın..." value={text} onChange={(e)=> setText(e.target.value)} InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton component="label">
                    <Paperclip size={18} />
                    <input type="file" hidden onChange={onFile} />
                  </IconButton>
                </InputAdornment>
              )
            }} />
            <Button variant="contained" endIcon={<Send size={16} />} onClick={onSend}>Gönder</Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
