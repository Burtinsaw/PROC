import React, { useEffect, useState } from 'react';
import { Box, Stack, Button, CircularProgress, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../components/common/PageHeader';
import MainCard from '../components/common/MainCard';
import axios from '../utils/axios';
import { toast } from 'sonner';

export default function Shipments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/shipments');
      const list = data?.shipments || data || [];
      setRows(list.map(s => ({ id: s.id, trackingNo: s.trackingNo || s.code, status: s.status, carrier: s.carrier || '-', eta: s.eta, createdAt: s.createdAt })));
    } catch(e) { console.error('Shipments error', e); toast.error('Sevkiyatlar alınamadı'); } finally { setLoading(false);} }
  useEffect(()=>{ load(); },[]);

  const statusColor = (s) => {
    switch(s){
      case 'in-transit': return 'info';
      case 'delivered': return 'success';
      case 'pending': return 'warning';
      case 'delayed': return 'error';
      default: return 'default';
    }
  };
  const columns = [
    { field:'trackingNo', headerName:'Takip No', flex:0.8, minWidth:140 },
    { field:'carrier', headerName:'Taşıyıcı', flex:0.8, minWidth:140 },
    { field:'status', headerName:'Durum', flex:0.7, minWidth:130, renderCell: ({ value }) => <Chip size="small" label={value} color={statusColor(value)} variant={value==='pending'?'outlined':'filled'} /> },
    { field:'eta', headerName:'ETA', flex:0.6, minWidth:140, valueGetter: ({ value }) => value ? new Date(value).toLocaleDateString('tr-TR') : '-' },
    { field:'createdAt', headerName:'Oluşturma', flex:0.9, minWidth:160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ];

  return (
    <Box>
      <PageHeader title="Sevkiyatlar" description="Takipteki sevkiyatlar" right={<Button onClick={load} variant="outlined">Yenile</Button>} />
      <MainCard content={false} sx={{ mt:1 }}>
        <Box sx={{ height: 520 }}>
          {loading ? <Stack alignItems="center" justifyContent="center" sx={{ height:'100%' }}><CircularProgress /></Stack> : (
            <DataGrid rows={rows} columns={columns} pageSizeOptions={[10,25]} initialState={{ pagination:{ paginationModel:{ pageSize:10 }}}} />
          )}
        </Box>
      </MainCard>
    </Box>
  );
}
