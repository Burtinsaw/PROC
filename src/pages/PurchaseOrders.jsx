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
import ImportDryRunDialog from '../components/common/ImportDryRunDialog';
import { formatMoney } from '../utils/money';
import { orderedCurrencies } from '../constants/currencies';
const PurchaseOrdersGrid = lazy(() => import('../tables/PurchaseOrdersGrid'));

export default function PurchaseOrders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const fileRef = React.useRef(null);
  const [dryRunOpen, setDryRunOpen] = useState(false);
  const [dryReport, setDryReport] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/purchase-orders');
      const list = data?.purchaseOrders || data || [];
      setRows(list.map(po => ({
        id: po.id,
        poNumber: po.poNumber,
        status: po.status,
        currency: po.currency || 'TRY',
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

  const currencyOptions = useMemo(() => {
    const uniq = Array.from(new Set(rows.map(r => r.currency).filter(Boolean)));
    if (uniq.length === 0) return [];
    const priority = orderedCurrencies();
    const inPriority = priority.filter(c => uniq.includes(c));
    const rest = uniq.filter(c => !inPriority.includes(c)).sort();
    return [...inPriority, ...rest];
  }, [rows]);

  const download = (blob, name) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };
  const exportCSV = async()=>{ try{ const r = await axios.get('/purchase-orders/export.csv', { responseType:'blob' }); download(r.data, 'purchase_orders.csv'); } catch{ toast.error('CSV alınamadı'); } };
  const downloadTemplate = async()=>{ try{ const r = await axios.get('/purchase-orders/_template', { responseType:'blob' }); download(r.data, 'po_template.xlsx'); } catch{ toast.error('Şablon indirilemedi'); } };
  const triggerImport = ()=> fileRef.current?.click();
  const onImportFile = async (e)=>{
    const file = e.target.files?.[0]; e.target.value = '';
    if(!file) return;
    try{
      const fd1 = new FormData(); fd1.append('file', file);
      const { data: dry } = await axios.post('/purchase-orders/import?dryRun=1', fd1, { headers:{ 'Content-Type':'multipart/form-data' } });
      const doImport = async ()=>{
        const fd = new FormData(); fd.append('file', file);
        const { data } = await axios.post('/purchase-orders/import', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
        toast.success(`İçe aktarıldı: ${data.created} yeni, ${data.updated} güncellendi, ${data.itemCreated} kalem`);
        setDryRunOpen(false); setDryReport(null);
        load();
      };
      setDryReport({ ...dry, __doImport: doImport });
      setDryRunOpen(true);
    } catch(err){ toast.error(err?.response?.data?.error || 'İçe aktarılamadı'); }
  };

  const columns = useMemo(() => [
    { field: 'poNumber', headerName: 'PO No', flex: 0.8, minWidth: 140 },
    { field: 'supplier', headerName: 'Tedarikçi', flex: 1, minWidth: 180 },
  { field: 'status', headerName: 'Durum', flex: 0.7, minWidth: 130, renderCell: ({ value }) => <StatusChip status={value} /> },
    { field: 'currency', headerName: 'PB', flex: 0.4, minWidth: 80 },
    { field: 'totalAmount', headerName: 'Tutar', flex: 0.8, minWidth: 140, renderCell: ({ row }) => formatMoney(row.totalAmount, row.currency||'TRY') },
    { field: 'createdAt', headerName: 'Oluşturma', flex: 0.9, minWidth: 160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ], []);

  const statusOptions = Array.from(new Set(rows.map(r=> r.status).filter(Boolean)));
  const filteredRows = rows.filter(r => {
    if(statusFilter && r.status !== statusFilter) return false;
    if(currencyFilter && r.currency !== currencyFilter) return false;
    const s = q.trim().toLowerCase();
    if(!s) return true;
    return [r.poNumber, r.supplier, r.status].some(v => v && String(v).toLowerCase().includes(s));
  });

  return (
    <Box>
      <PageHeader title="Purchase Orders" description="Oluşturulan satın alma siparişleri" right={(
        <Stack direction="row" gap={1}>
          <Button onClick={downloadTemplate} variant="outlined" size="small">Şablon</Button>
          <Button onClick={exportCSV} variant="outlined" size="small">CSV</Button>
          <Button onClick={triggerImport} variant="contained" size="small">İçe Aktar</Button>
          <Button onClick={load} variant="contained" size="small">Yenile</Button>
          <input type="file" ref={fileRef} onChange={onImportFile} accept=".csv,.xlsx" style={{ display:'none' }} />
        </Stack>
      )} />
      <MainCard content={false} sx={{ mt:1 }}>
        <FilterBar
          search={{ value: q, onChange: setQ, placeholder: 'Ara...' }}
          filters={[
            { key:'status', label:'Durum', options: statusOptions, value: statusFilter, onChange: setStatusFilter },
            { key:'currency', label:'PB', options: currencyOptions, value: currencyFilter, onChange: setCurrencyFilter }
          ]}
          onRefresh={load}
          onClear={() => { setQ(''); setStatusFilter(''); setCurrencyFilter(''); }}
        />
        <Box sx={{ height: 520 }}>
          {loading ? <TableSkeleton rows={8} columns={5} /> : (filteredRows.length===0 ? <EmptyState title="Kayıt yok" description="Filtreleri değiştirin veya veri ekleyin." /> : (
            <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
              <PurchaseOrdersGrid rows={filteredRows} columns={columns} />
            </Suspense>
          ))}
        </Box>
      </MainCard>
      <ImportDryRunDialog
        open={dryRunOpen}
        report={dryReport}
        onClose={()=> { setDryRunOpen(false); setDryReport(null); }}
        onConfirm={async ()=>{ if(dryReport?.__doImport) await dryReport.__doImport(); }}
      />
    </Box>
  );
}
