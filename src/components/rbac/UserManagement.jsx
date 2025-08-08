import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../../utils/axios';

const UserManagement = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (e) {
      alert(e?.response?.data?.message || 'Silme hatası');
    }
  };

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
      valueGetter: (params) => params.value ? new Date(params.value).toLocaleString('tr-TR') : ''
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {/* TODO: Düzenle butonu */}
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>Sil</Button>
        </Stack>
      )
    }
  ], [handleDelete]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h5">Kullanıcı Yönetimi</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={fetchUsers}>Yenile</Button>
          {/* TODO: Yeni Kullanıcı */}
          <Button variant="contained" size="small" disabled>Yeni Kullanıcı</Button>
        </Stack>
      </Stack>
      {error && (
        <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>
      )}
      <div style={{ height: 520, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          loading={loading}
          disableRowSelectionOnClick
        />
      </div>
    </Box>
  );
};

export default UserManagement;
