import { useState } from 'react';
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
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ==============================|| REQUEST LIST PAGE ||============================== //

const RequestList = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - gerçekte API'den gelecek
  const requests = [
    {
      id: 1,
      title: 'Ofis Malzemeleri',
      requester: 'Ahmet Yılmaz',
      department: 'IT',
      date: '2025-08-05',
      status: 'Bekliyor',
      amount: '₺2,500',
      urgency: 'Orta'
    },
    {
      id: 2,
      title: 'IT Ekipmanları',
      requester: 'Ayşe Demir',
      department: 'IT',
      date: '2025-08-04',
      status: 'Onaylandı',
      amount: '₺15,000',
      urgency: 'Yüksek'
    },
    {
      id: 3,
      title: 'Temizlik Malzemeleri',
      requester: 'Mehmet Kaya',
      department: 'Operasyon',
      date: '2025-08-03',
      status: 'İnceleniyor',
      amount: '₺800',
      urgency: 'Düşük'
    },
    {
      id: 4,
      title: 'Kırtasiye Malzemeleri',
      requester: 'Fatma Şen',
      department: 'İnsan Kaynakları',
      date: '2025-08-02',
      status: 'Onaylandı',
      amount: '₺1,200',
      urgency: 'Orta'
    },
    {
      id: 5,
      title: 'Mobilya',
      requester: 'Ali Vural',
      department: 'Finans',
      date: '2025-08-01',
      status: 'Reddedildi',
      amount: '₺8,000',
      urgency: 'Düşük'
    }
  ];

  const handleMenuClick = (event, request) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
    console.log('Selected request:', request); // Debug için
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Onaylandı': return 'success';
      case 'Bekliyor': return 'warning';
      case 'İnceleniyor': return 'info';
      case 'Reddedildi': return 'error';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Yüksek': return 'error';
      case 'Orta': return 'warning';
      case 'Düşük': return 'success';
      default: return 'default';
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          startIcon={<AddIcon />}
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Talep ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
          {filteredRequests.length} talep bulundu
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
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                      {request.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{request.requester}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {request.amount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.urgency}
                      size="small"
                      color={getUrgencyColor(request.urgency)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      size="small"
                      color={getStatusColor(request.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuClick(event, request)}
                    >
                      <MoreVertIcon />
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
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon sx={{ mr: 1, fontSize: 20 }} />
          Görüntüle
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
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
            startIcon={<AddIcon />}
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
