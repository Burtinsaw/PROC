import React, { useEffect, useState } from 'react';
import { Box, Stack, Button, CircularProgress, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../components/common/PageHeader';
import MainCard from '../components/common/MainCard';
import axios from '../utils/axios';
import { toast } from 'sonner';

export default function PurchaseOrders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/purchase-orders');
      const list = data?.purchaseOrders || data || [];
      setRows(list.map(po => ({
        id: po.id,
        poNumber: po.poNumber,
        status: po.status,
        supplier: po.supplier?.name || '-',
        totalAmount: po.totalAmount,
        createdAt: po.createdAt
      })));
    } catch (e) {
      console.error('PO list error', e);
      toast.error('Purchase Orders alınamadı');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const statusColor = (s) => {
    switch(s){
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'default';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'primary';
    }
  };
  const columns = [
    { field: 'poNumber', headerName: 'PO No', flex: 0.8, minWidth: 140 },
    { field: 'supplier', headerName: 'Tedarikçi', flex: 1, minWidth: 180 },
    { field: 'status', headerName: 'Durum', flex: 0.7, minWidth: 130, renderCell: ({ value }) => <Chip size="small" label={value} color={statusColor(value)} variant={value==='draft'?'outlined':'filled'} /> },
    { field: 'totalAmount', headerName: 'Tutar', flex: 0.6, minWidth: 120 },
    { field: 'createdAt', headerName: 'Oluşturma', flex: 0.9, minWidth: 160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ];

  return (
    <Box>
      <PageHeader title="Purchase Orders" description="Oluşturulan satın alma siparişleri" right={<Button onClick={load} variant="outlined">Yenile</Button>} />
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
