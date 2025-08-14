import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import { Plus, MoreVertical, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchRequests, REQUEST_STATUS_LABELS } from '../../api/requests';
import { toast } from 'sonner';

// ==============================|| REQUEST LIST PAGE ||============================== //

const RequestList = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  // removed unused selectedRequest state
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState(() => {
    const seg = location.pathname.split('/').pop();
    if(['pending','approved','rejected','all'].includes(seg)) return seg === 'all' ? '' : seg;
    return '';
  });

  const load = async ()=>{
    try {
      setLoading(true);
      const data = await fetchRequests({ page, q: searchTerm||undefined, status: statusFilter||undefined });
      setRows(data.rows);
      setTotal(data.total);
  } catch{
      toast.error('Talepler alınamadı');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  useEffect(()=>{ const timer = setTimeout(()=>{ setPage(1); load(); }, 500); return ()=>clearTimeout(timer); // search debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const requests = rows;

  const handleMenuClick = (event, request) => {
    setAnchorEl(event.currentTarget);
    (event.currentTarget)._row = request; // attach for retrieval
  };

  const handleMenuClose = () => setAnchorEl(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'draft': return 'default';
      case 'review': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };


  const filteredRequests = requests; // server-side filtered

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Talep Listesi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tüm satın alma taleplerini görüntüleyin ve yönetin
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate('/procurement/requests/new')}
          size="large"
        >
          Yeni Talep
        </Button>
      </Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs:12, md:3 }}>
              <TextField fullWidth select label="Durum" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} size="small">
                <MenuItem value=''>Tümü</MenuItem>
                {Object.entries(REQUEST_STATUS_LABELS).map(([k,v])=> <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                fullWidth
                placeholder="Talep ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs:12, md:3 }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="outlined">Filtrele</Button>
                <Button variant="outlined">Dışa Aktar</Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Yükleniyor...' : `${total} talep bulundu`}
        </Typography>
      </Box>
      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Talep Başlığı</strong></TableCell>
                <TableCell><strong>Talep Eden</strong></TableCell>
                <TableCell><strong>Departman</strong></TableCell>
                <TableCell><strong>Tarih</strong></TableCell>
                <TableCell><strong>Tutar</strong></TableCell>
                <TableCell><strong>Aciliyet</strong></TableCell>
                <TableCell><strong>Durum</strong></TableCell>
                <TableCell align="center"><strong>İşlemler</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow 
                  key={request.id}
                  sx={{ 
                    '&:hover': { bgcolor: 'grey.50' },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell>{request.code}</TableCell>
                  <TableCell>{request.contactName || '-'}</TableCell>
                  <TableCell>{request.company?.name || '-'}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><Chip label={REQUEST_STATUS_LABELS[request.status] || request.status} size="small" color={getStatusColor(request.status)} /></TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuClick(event, request)}
                    >
                      <MoreVertical size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 150 }
        }}
      >
        <MenuItem onClick={()=>{ if(anchorEl && anchorEl._row){ navigate(`/requests/${anchorEl._row.id}`); } handleMenuClose(); }}>
          <Eye size={18} style={{ marginRight: 8 }} />Görüntüle
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Pencil size={18} style={{ marginRight: 8 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Trash2 size={18} style={{ marginRight: 8 }} />
          Sil
        </MenuItem>
      </Menu>
      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Talep bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Arama kriterlerinizi değiştirin veya yeni bir talep oluşturun
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate('/procurement/requests/new')}
          >
            Yeni Talep Oluştur
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RequestList;
