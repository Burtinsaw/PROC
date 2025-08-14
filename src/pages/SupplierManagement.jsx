import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Stack,
  Divider,
  Rating,
  LinearProgress
} from '@mui/material';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { useAppTheme } from '../contexts/useAppTheme';
import StatusChip from '../components/common/StatusChip';

// Mock data
const mockSuppliers = [
  {
    id: 1,
    name: 'ABC Teknoloji Ltd.',
    category: 'Teknoloji',
    country: 'Türkiye',
    city: 'İstanbul',
    email: 'info@abcteknoloji.com',
    phone: '+90 212 555 0101',
    website: 'www.abcteknoloji.com',
    rating: 4.5,
    totalOrders: 156,
    totalValue: 2500000,
    status: 'active',
    performance: 94,
    deliveryTime: 5,
    qualityScore: 4.7,
    priceCompetitiveness: 4.2,
    reliability: 4.8,
    lastOrderDate: '2025-01-15',
    establishedYear: 2015,
    employeeCount: 150,
    certifications: ['ISO 9001', 'ISO 14001', 'CE'],
    specialties: ['Bilgisayar', 'Ağ Ekipmanları', 'Yazılım']
  },
  {
    id: 2,
    name: 'Güvenlik Sistemleri A.Ş.',
    category: 'Güvenlik',
    country: 'Türkiye',
    city: 'Ankara',
    email: 'satış@guvenliksistem.com',
    phone: '+90 312 555 0202',
    website: 'www.guvenliksistem.com',
    rating: 4.8,
    totalOrders: 89,
    totalValue: 1800000,
    status: 'active',
    performance: 97,
    deliveryTime: 3,
    qualityScore: 4.9,
    priceCompetitiveness: 3.8,
    reliability: 4.9,
    lastOrderDate: '2025-01-20',
    establishedYear: 2010,
    employeeCount: 75,
    certifications: ['ISO 27001', 'TSE'],
    specialties: ['CCTV', 'Alarm Sistemleri', 'Erişim Kontrolü']
  }
];

const categories = ['Tümü', 'Teknoloji', 'Güvenlik', 'Mobilya', 'Tıbbi Malzeme'];
const countries = ['Tümü', 'Türkiye', 'Almanya', 'Çin', 'ABD'];

const SupplierManagement = () => {
  const { theme } = useAppTheme();
  const [suppliers] = useState(mockSuppliers);
  const [filteredSuppliers, setFilteredSuppliers] = useState(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedCountry, setSelectedCountry] = useState('Tümü');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let filtered = suppliers;

    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(supplier => supplier.category === selectedCategory);
    }

    if (selectedCountry !== 'Tümü') {
      filtered = filtered.filter(supplier => supplier.country === selectedCountry);
    }

    setFilteredSuppliers(filtered);
  }, [searchTerm, selectedCategory, selectedCountry, suppliers]);

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const supplierStatusMap = {
    active: 'approved',
    pending: 'pending',
    suspended: 'rejected'
  };

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'active').length,
    avgRating: (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1),
    totalValue: suppliers.reduce((sum, s) => sum + s.totalValue, 0)
  };

  return (
    <Box sx={{ 
      p: 2,
      bgcolor: 'background.default',
      minHeight: 'calc(100vh - 64px)',
      width: '100%'
    }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: theme.colors.primary }}>
          Tedarikçi Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tedarikçilerinizi yönetin, performanslarını takip edin ve yeni tedarikçiler ekleyin
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`, color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Toplam Tedarikçi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.colors.success} 0%, #4caf50 100%)`, color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.active}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Aktif Tedarikçi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #3f51b5 100%)`, color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.avgRating}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ortalama Puan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, #9c27b0 100%)`, color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₺{(stats.totalValue / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Toplam İşlem Hacmi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid
            size={{
              xs: 12,
              md: 4
            }}>
            <TextField
              fullWidth
              placeholder="Tedarikçi ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={16} style={{ color: 'var(--mui-palette-text-secondary)', marginRight: 4 }} />
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Kategori"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <FormControl fullWidth>
              <InputLabel>Ülke</InputLabel>
              <Select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                label="Ülke"
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4
            }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                sx={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)` }}
              >
                Yeni Tedarikçi
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download size={16} />}
              >
                Dışa Aktar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.colors.background }}>
                <TableCell>Tedarikçi</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Konum</TableCell>
                <TableCell>Puan</TableCell>
                <TableCell>Performans</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.colors.primary }}>
                        {supplier.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {supplier.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {supplier.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={supplier.category} 
                      size="small" 
                      sx={{ 
                        backgroundColor: theme.colors.background,
                        color: theme.colors.primary,
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{supplier.city}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {supplier.country}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating value={supplier.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="caption">({supplier.rating})</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <Typography variant="caption">{supplier.performance}%</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={supplier.performance}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: theme.colors.background
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={supplierStatusMap[supplier.status] || supplier.status} />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Görüntüle">
                        <IconButton
                          size="small"
                          onClick={() => handleViewSupplier(supplier)}
                          sx={{ color: theme.colors.info }}
                        >
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton
                          size="small"
                          sx={{ color: theme.colors.primary }}
                        >
                          <Pencil size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          size="small"
                          sx={{ color: theme.colors.error }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tedarikçi Detayları</DialogTitle>
        <DialogContent>
          {selectedSupplier && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">{selectedSupplier.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSupplier.email}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierManagement;
