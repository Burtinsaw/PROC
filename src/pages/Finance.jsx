import React, { useEffect, useState } from 'react';
import { Box, Stack, Button, CircularProgress, Chip, Grid, Typography, Card, CardContent } from '@mui/material';
import StatusChip from '../components/common/StatusChip';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../components/common/PageHeader';
import MainCard from '../components/common/MainCard';
import axios from '../utils/axios';
import { toast } from 'sonner';

export default function Finance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/finance/invoices');
      const list = data?.invoices || data || [];
      setRows(list.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        status: inv.status,
        total: inv.totalAmount,
        subtotal: inv.subtotal,
        tax: inv.taxAmount,
        dueDate: inv.dueDate,
        createdAt: inv.createdAt,
        syncStatus: inv.syncStatus,
        parasutStatus: inv.parasutStatus,
        syncError: inv.syncError
      })));
      // dashboard summary
      try {
        const dash = await axios.get('/finance/dashboard');
        setSummary(dash.data?.summary || null);
      } catch (dErr) { console.warn('Dashboard summary okunamadı', dErr); }
    } catch(e) { console.error('Finance load error', e); toast.error('Faturalar alınamadı'); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);
  const pushParasut = async (id) => {
    try { await axios.post(`/finance/invoices/${id}/push-parasut`); toast.success('Parasut senkron başlatıldı'); load(); } catch(e){ toast.error(e?.response?.data?.error || 'Push başarısız'); }
  };
  const columns = [
    { field:'invoiceNumber', headerName:'Fatura No', flex:0.9, minWidth:160 },
  { field:'status', headerName:'Durum', flex:0.7, minWidth:130, renderCell: ({ value }) => <StatusChip status={value} /> },
  { field:'parasutStatus', headerName:'Parasut', flex:0.6, minWidth:120, renderCell: ({ value }) => <StatusChip status={value} /> },
  { field:'syncStatus', headerName:'Sync', flex:0.6, minWidth:120, renderCell: ({ row }) => <StatusChip status={row.syncStatus} title={row.syncError||''} /> },
    { field:'subtotal', headerName:'Ara Toplam', flex:0.6, minWidth:130 },
    { field:'tax', headerName:'Vergi', flex:0.5, minWidth:110 },
    { field:'total', headerName:'Toplam', flex:0.6, minWidth:130 },
    { field:'dueDate', headerName:'Vade', flex:0.7, minWidth:140, valueGetter: ({ value }) => value ? new Date(value).toLocaleDateString('tr-TR') : '-' },
    { field:'actions', headerName:'', width:160, sortable:false, filterable:false, renderCell: (params)=> <Stack direction="row" spacing={1}>{['pending_sync','failed','pending_local'].includes(params.row.syncStatus) && <Button size="small" onClick={()=>pushParasut(params.row.id)}>Push</Button>} </Stack> },
    { field:'createdAt', headerName:'Oluşturma', flex:0.9, minWidth:160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ];
  return (
    <Box>
  <PageHeader title="Finans" description="Fatura listesi" right={<Button onClick={load} variant="outlined">Yenile</Button>} />
      {summary && (
        <Grid container spacing={2} sx={{ mt:0.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={(t)=>({ background: t.palette.mode==='dark'? 'rgba(255,255,255,0.04)': t.palette.primary.light+'22', border:'1px solid', borderColor: t.palette.divider, borderRadius: 3 })}>
              <CardContent sx={{ py:2.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing:'.5px' }}>Toplam Fatura</Typography>
                <Typography variant="h5" sx={{ fontWeight:700 }}>{summary.totalInvoices}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={(t)=>({ background: t.palette.mode==='dark'? 'rgba(255,255,255,0.045)': t.palette.warning.light+'22', border:'1px solid', borderColor: t.palette.divider, borderRadius: 3 })}>
              <CardContent sx={{ py:2.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing:'.5px' }}>Bekleyen</Typography>
                <Typography variant="h5" sx={{ fontWeight:700 }}>{summary.pendingInvoices}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={(t)=>({ background: t.palette.mode==='dark'? 'rgba(255,255,255,0.04)': t.palette.success.light+'22', border:'1px solid', borderColor: t.palette.divider, borderRadius: 3 })}>
              <CardContent sx={{ py:2.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing:'.5px' }}>Ödenen</Typography>
                <Typography variant="h5" sx={{ fontWeight:700 }}>{summary.paidInvoices}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={(t)=>({ background: t.palette.mode==='dark'? 'rgba(255,255,255,0.05)': t.palette.error.light+'22', border:'1px solid', borderColor: t.palette.divider, borderRadius: 3 })}>
              <CardContent sx={{ py:2.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing:'.5px' }}>Geciken</Typography>
                <Typography variant="h5" sx={{ fontWeight:700 }} color={summary.overdueInvoices>0?'error.main':'text.primary'}>{summary.overdueInvoices}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={(t)=>({ background: t.palette.mode==='dark'? 'rgba(255,255,255,0.035)': t.palette.info.light+'22', border:'1px solid', borderColor: t.palette.divider, borderRadius: 3 })}>
              <CardContent sx={{ py:2.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing:'.5px' }}>Ödenmemiş Tutar</Typography>
                <Typography variant="h6" sx={{ fontWeight:700 }}>₺ {Number(summary.unpaidAmount).toLocaleString('tr-TR')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={(t)=>({ background: t.palette.mode==='dark'? 'rgba(255,255,255,0.04)': t.palette.success.light+'22', border:'1px solid', borderColor: t.palette.divider, borderRadius: 3 })}>
              <CardContent sx={{ py:2.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing:'.5px' }}>Bu Ay Ödenen</Typography>
                <Typography variant="h6" sx={{ fontWeight:700 }}>₺ {Number(summary.thisMonthPaid).toLocaleString('tr-TR')}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      <MainCard content={false} sx={{ mt:1 }}>
        <Box sx={{ height:520 }}>
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
