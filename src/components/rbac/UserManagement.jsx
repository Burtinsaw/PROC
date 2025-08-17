import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Button, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { toast } from 'sonner';
import ContentContainer from '../layout/ContentContainer';
import { lazy, Suspense } from 'react';
import axios from '../../utils/axios';
import { updateStatus, resetPassword, deleteUser, createUser } from '../../services/adminUsersService';
const UsersGrid = lazy(() => import('./UsersGrid'));

const UserManagement = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', role: 'user', department: 'Genel' });
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({ firstName:'', lastName:'', email:'', role:'user', department:'Genel' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/admin/users');
      if (res.data?.success) {
        const list = res.data.data || res.data.users || [];
        setRows(Array.isArray(list) ? list : []);
      } else {
        setError(res.data?.message || 'Kullanıcılar alınamadı');
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (e) {
      alert(e?.response?.data?.message || 'Silme hatası');
    }
  }, [fetchUsers]);

  const handleToggleStatus = useCallback(async (row) => {
    const next = row.status === 'active' ? 'inactive' : 'active';
    try {
  await updateStatus(row.id, next);
  toast.success(`Durum güncellendi: ${next}`);
      fetchUsers();
    } catch (e) {
      alert(e?.response?.data?.message || 'Durum güncellenemedi');
    }
  }, [fetchUsers]);

  const handleResetPassword = useCallback(async (row) => {
    if (!window.confirm(`${row.username} için şifre sıfırlansın mı?`)) return;
    try {
  const res = await resetPassword(row.id);
      const tmp = res?.tempPassword;
  if(tmp) toast.success(`Geçici şifre: ${tmp}`); else toast.success('Şifre sıfırlandı');
    } catch (e) {
      alert(e?.response?.data?.message || 'Şifre sıfırlanamadı');
    }
  }, []);

  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Kullanıcı Adı', flex: 1, minWidth: 140 },
    { field: 'email', headerName: 'E-posta', flex: 1.2, minWidth: 200 },
    { field: 'firstName', headerName: 'Ad', width: 120 },
    { field: 'lastName', headerName: 'Soyad', width: 120 },
    { field: 'role', headerName: 'Rol', width: 110 },
    { field: 'department', headerName: 'Departman', width: 150 },
    { field: 'status', headerName: 'Durum', width: 110 },
    {
      field: 'lastLogin',
      headerName: 'Son Giriş',
      width: 160,
  // MUI X v7: valueGetter imzası (value, row, column, apiRef)
  valueGetter: (value) => value ? new Date(value).toLocaleString('tr-TR') : ''
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => handleToggleStatus(params.row)}>
            {params.row.status === 'active' ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button size="small" onClick={() => { setEditRow(params.row); setEditForm({ firstName: params.row.firstName||'', lastName: params.row.lastName||'', email: params.row.email||'', role: params.row.role||'user', department: params.row.department||'Genel' }); setEditOpen(true); }}>Düzenle</Button>
          <Button size="small" onClick={() => handleResetPassword(params.row)}>Şifre</Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>Sil</Button>
        </Stack>
      )
    }
  ], [handleDelete, handleToggleStatus, handleResetPassword]);

  return (
    <ContentContainer sx={{ p: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h5">Kullanıcı Yönetimi</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={fetchUsers}>Yenile</Button>
          <Button variant="contained" size="small" onClick={() => setCreateOpen(true)}>Yeni Kullanıcı</Button>
        </Stack>
      </Stack>
      {error && (
        <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>
      )}
      <div style={{ height: 520, width: '100%' }}>
        <Suspense fallback={<Typography variant="body2" color="text.secondary">Tablo yükleniyor…</Typography>}>
          <UsersGrid rows={rows} columns={columns} loading={loading} />
        </Suspense>
      </div>
      <Dialog open={createOpen} onClose={() => !creating && setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Kullanıcı</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Kullanıcı Adı"
              value={form.username}
              onChange={(e)=>setForm(f=>({ ...f, username: e.target.value }))}
              required
              size="small"
            />
            <TextField
              label="E-posta"
              type="email"
              value={form.email}
              onChange={(e)=>setForm(f=>({ ...f, email: e.target.value }))}
              required
              size="small"
            />
            <TextField
              label="Rol"
              select
              value={form.role}
              onChange={(e)=>setForm(f=>({ ...f, role: e.target.value }))}
              size="small"
            >
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="manager">manager</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </TextField>
            <TextField
              label="Departman"
              value={form.department}
              onChange={(e)=>setForm(f=>({ ...f, department: e.target.value }))}
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={creating} onClick={()=>setCreateOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            disabled={creating || !form.username || !form.email}
            onClick={async ()=>{
              setCreating(true);
              try{
                const res = await createUser(form);
                const tmp = res?.tempPassword;
                if(tmp) toast.success(`Geçici şifre: ${tmp}`); else toast.success('Kullanıcı oluşturuldu');
                setCreateOpen(false);
                setForm({ username:'', email:'', role:'user', department:'Genel' });
                fetchUsers();
              }catch(e){
                alert(e?.response?.data?.message || 'Kullanıcı oluşturulamadı');
              } finally {
                setCreating(false);
              }
            }}
          >Kaydet</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Ad" value={editForm.firstName} onChange={(e)=>setEditForm(f=>({ ...f, firstName: e.target.value }))} size="small" />
            <TextField label="Soyad" value={editForm.lastName} onChange={(e)=>setEditForm(f=>({ ...f, lastName: e.target.value }))} size="small" />
            <TextField label="E-posta" type="email" value={editForm.email} onChange={(e)=>setEditForm(f=>({ ...f, email: e.target.value }))} size="small" />
            <TextField label="Rol" select value={editForm.role} onChange={(e)=>setEditForm(f=>({ ...f, role: e.target.value }))} size="small">
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="manager">manager</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </TextField>
            <TextField label="Departman" value={editForm.department} onChange={(e)=>setEditForm(f=>({ ...f, department: e.target.value }))} size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setEditOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={async ()=>{
            try{
              await axios.put(`/admin/users/${editRow.id}`, editForm);
              toast.success('Kullanıcı güncellendi');
              setEditOpen(false);
              fetchUsers();
            }catch(e){
              alert(e?.response?.data?.message || 'Güncellenemedi');
            }
          }}>Kaydet</Button>
        </DialogActions>
      </Dialog>
  </ContentContainer>
  );
};

export default UserManagement;
