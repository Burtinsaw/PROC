import React, { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import { Box, Stack, Button, CircularProgress } from '@mui/material';

// Universal Components
import { UniversalPageHeader, UniversalSectionCard, UniversalFilterBar, UniversalStatusChip } from '../components/universal';

// Other components
import TableSkeleton from '../components/common/skeletons/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import ImportDryRunDialog from '../components/common/ImportDryRunDialog';

// Services and utils
import axios from '../utils/axios';
import { toast } from 'sonner';
import { formatMoney } from '../utils/money';

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
    { field: 'status', headerName: 'Durum', flex: 0.7, minWidth: 130, renderCell: ({ value }) => <UniversalStatusChip status={value} /> },
    { field: 'currency', headerName: 'PB', flex: 0.4, minWidth: 80 },
    { field: 'totalAmount', headerName: 'Tutar', flex: 0.8, minWidth: 140, renderCell: ({ row }) => formatMoney(row.totalAmount, row.currency||'TRY') },
    { field: 'createdAt', headerName: 'Oluşturma', flex: 0.9, minWidth: 160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ], []);

  const filteredRows = rows.filter(r => {
    if(statusFilter && r.status !== statusFilter) return false;
    if(currencyFilter && r.currency !== currencyFilter) return false;
    const s = q.trim().toLowerCase();
    if(!s) return true;
    return [r.poNumber, r.supplier, r.status].some(v => v && String(v).toLowerCase().includes(s));
  });

  return (
    <Box>
      <UniversalPageHeader 
        title="Purchase Orders" 
        subtitle="Oluşturulan satın alma siparişleri"
        actions={[
          <Button key="template" onClick={downloadTemplate} variant="outlined" size="small">Şablon</Button>,
          <Button key="csv" onClick={exportCSV} variant="outlined" size="small">CSV</Button>,
          <Button key="import" onClick={triggerImport} variant="contained" size="small">İçe Aktar</Button>,
          <Button key="refresh" onClick={load} variant="contained" size="small">Yenile</Button>
        ]}
      />
      <UniversalSectionCard>
        <UniversalFilterBar
          search={{ value: q, onChange: setQ, placeholder: 'Search purchase orders...' }}
          onRefresh={load}
          onClear={() => { setQ(''); setStatusFilter(''); setCurrencyFilter(''); }}
          onFilter={() => {}}
          onExport={() => {}}
        />
        <Box sx={{ height: 520 }}>
          {loading ? <TableSkeleton rows={8} columns={5} /> : (filteredRows.length===0 ? <EmptyState title="Kayıt yok" description="Filtreleri değiştirin veya veri ekleyin." /> : (
            <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
              <PurchaseOrdersGrid rows={filteredRows} columns={columns} />
            </Suspense>
          ))}
        </Box>
      </UniversalSectionCard>
      <input type="file" ref={fileRef} onChange={onImportFile} accept=".csv,.xlsx" style={{ display:'none' }} />
      <ImportDryRunDialog
        open={dryRunOpen}
        report={dryReport}
        onClose={()=> { setDryRunOpen(false); setDryReport(null); }}
        onConfirm={async ()=>{ if(dryReport?.__doImport) await dryReport.__doImport(); }}
      />
    </Box>
  );
}
