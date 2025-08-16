import React, { useEffect, useState } from 'react';
import { Box, Stack, Button, CircularProgress } from '@mui/material';
import StatusChip from '../components/common/StatusChip';
import { lazy, Suspense, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import FilterBar from '../components/table/FilterBar';
import TableSkeleton from '../components/common/skeletons/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import MainCard from '../components/common/MainCard';
import axios from '../utils/axios';
import { toast } from 'sonner';
const PurchaseOrdersGrid = lazy(() => import('../tables/PurchaseOrdersGrid'));

export default function PurchaseOrders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const columns = useMemo(() => [
    { field: 'poNumber', headerName: 'PO No', flex: 0.8, minWidth: 140 },
    { field: 'supplier', headerName: 'Tedarikçi', flex: 1, minWidth: 180 },
  { field: 'status', headerName: 'Durum', flex: 0.7, minWidth: 130, renderCell: ({ value }) => <StatusChip status={value} /> },
    { field: 'totalAmount', headerName: 'Tutar', flex: 0.6, minWidth: 120 },
    { field: 'createdAt', headerName: 'Oluşturma', flex: 0.9, minWidth: 160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ], []);

  const statusOptions = Array.from(new Set(rows.map(r=> r.status).filter(Boolean)));
  const filteredRows = rows.filter(r => {
    if(statusFilter && r.status !== statusFilter) return false;
    const s = q.trim().toLowerCase();
    if(!s) return true;
    return [r.poNumber, r.supplier, r.status].some(v => v && String(v).toLowerCase().includes(s));
  });

  return (
    <Box>
      <PageHeader title="Purchase Orders" description="Oluşturulan satın alma siparişleri" right={<Button onClick={load} variant="contained">Yenile</Button>} />
      <MainCard content={false} sx={{ mt:1 }}>
        <FilterBar
          search={{ value: q, onChange: setQ, placeholder: 'Ara...' }}
          filters={[{ key:'status', label:'Durum', options: statusOptions, value: statusFilter, onChange: setStatusFilter }]}
          onRefresh={load}
          onClear={() => { setQ(''); setStatusFilter(''); }}
        />
        <Box sx={{ height: 520 }}>
          {loading ? <TableSkeleton rows={8} columns={5} /> : (filteredRows.length===0 ? <EmptyState title="Kayıt yok" description="Filtreleri değiştirin veya veri ekleyin." /> : (
            <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
              <PurchaseOrdersGrid rows={filteredRows} columns={columns} />
            </Suspense>
          ))}
        </Box>
      </MainCard>
    </Box>
  );
}
