import React, { useEffect, useState } from 'react';
import { Box, Stack, Button, CircularProgress, Chip, Grid, Typography, Card, CardContent } from '@mui/material';
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
        createdAt: inv.createdAt
      })));
      // dashboard summary
      try {
        const dash = await axios.get('/finance/dashboard');
        setSummary(dash.data?.summary || null);
      } catch (dErr) { console.warn('Dashboard summary okunamadı', dErr); }
    } catch(e) { console.error('Finance load error', e); toast.error('Faturalar alınamadı'); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);
  const statusColor = (s) => {
    switch(s){
      case 'paid': return 'success';
      case 'approved': return 'info';
      case 'draft': return 'default';
      case 'overdue': return 'error';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };
  const columns = [
    { field:'invoiceNumber', headerName:'Fatura No', flex:0.9, minWidth:160 },
    { field:'status', headerName:'Durum', flex:0.7, minWidth:130, renderCell: ({ value }) => <Chip size="small" label={value} color={statusColor(value)} variant={value==='draft' ? 'outlined':'filled'} /> },
    { field:'subtotal', headerName:'Ara Toplam', flex:0.6, minWidth:130 },
    { field:'tax', headerName:'Vergi', flex:0.5, minWidth:110 },
    { field:'total', headerName:'Toplam', flex:0.6, minWidth:130 },
    { field:'dueDate', headerName:'Vade', flex:0.7, minWidth:140, valueGetter: ({ value }) => value ? new Date(value).toLocaleDateString('tr-TR') : '-' },
    { field:'createdAt', headerName:'Oluşturma', flex:0.9, minWidth:160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' }
  ];
  return (
    <Box>
  <PageHeader title="Finans" description="Fatura listesi" right={<Button onClick={load} variant="outlined">Yenile</Button>} />
      {summary && (
        <Grid container spacing={2} sx={{ mt:0.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent><Typography variant="caption" color="text.secondary">Toplam Fatura</Typography><Typography variant="h5">{summary.totalInvoices}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent><Typography variant="caption" color="text.secondary">Bekleyen</Typography><Typography variant="h5">{summary.pendingInvoices}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent><Typography variant="caption" color="text.secondary">Ödenen</Typography><Typography variant="h5">{summary.paidInvoices}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent><Typography variant="caption" color="text.secondary">Geciken</Typography><Typography variant="h5" color={summary.overdueInvoices>0?'error.main':'inherit'}>{summary.overdueInvoices}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent><Typography variant="caption" color="text.secondary">Ödenmemiş Tutar</Typography><Typography variant="h6">₺ {Number(summary.unpaidAmount).toLocaleString('tr-TR')}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent><Typography variant="caption" color="text.secondary">Bu Ay Ödenen</Typography><Typography variant="h6">₺ {Number(summary.thisMonthPaid).toLocaleString('tr-TR')}</Typography></CardContent></Card>
          </Grid>
        </Grid>
      )}
      <MainCard content={false} sx={{ mt:1 }}>
        <Box sx={{ height:520 }}>
          {loading ? <Stack alignItems="center" justifyContent="center" sx={{ height:'100%' }}><CircularProgress /></Stack> : (
            <DataGrid rows={rows} columns={columns} pageSizeOptions={[10,25]} initialState={{ pagination:{ paginationModel:{ pageSize:10 }}}} />
          )}
        </Box>
      </MainCard>
    </Box>
  );
}
