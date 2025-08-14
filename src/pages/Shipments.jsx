import React, { useEffect, useState } from 'react';
import { Box, Stack, Button, CircularProgress } from '@mui/material';
import StatusChip from '../components/common/StatusChip';
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

  const columns = [
    { field:'trackingNo', headerName:'Takip No', flex:0.8, minWidth:140 },
    { field:'carrier', headerName:'Taşıyıcı', flex:0.8, minWidth:140 },
  { field:'status', headerName:'Durum', flex:0.7, minWidth:130, renderCell: ({ value }) => <StatusChip status={value} /> },
    { field:'eta', headerName:'ETA', flex:0.6, minWidth:140, valueGetter: ({ value }) => value ? new Date(value).toLocaleDateString('tr-TR') : '-' },
    { field:'createdAt', headerName:'Oluşturma', flex:0.9, minWidth:160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ];

  return (
    <Box>
      <PageHeader title="Sevkiyatlar" description="Takipteki sevkiyatlar" right={<Button onClick={load} variant="outlined">Yenile</Button>} />
      <MainCard content={false} sx={{ mt:1 }}>
        <Box sx={{ height: 520 }}>
          {loading ? <Stack alignItems="center" justifyContent="center" sx={{ height:'100%' }}><CircularProgress /></Stack> : (
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[10,25]}
              initialState={{ pagination:{ paginationModel:{ pageSize:10 }}}}
              density="compact"
              sx={(theme)=>({
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                '& .MuiDataGrid-columnHeaders': { fontWeight:600 },
                '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: theme.palette.mode==='dark'? 'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)' },
                '& .MuiDataGrid-row.Mui-selected': { backgroundColor: theme.palette.action.selected, '&:hover': { backgroundColor: theme.palette.action.selected }},
                '& .MuiDataGrid-cell': { outline: 'none !important' }
              })}
            />
          )}
        </Box>
      </MainCard>
    </Box>
  );
}
