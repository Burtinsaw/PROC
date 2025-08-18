// Business Data Table Component
// Dense, professional data presentation inspired by enterprise ERP systems

import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import { 
  MoreVert,
  Search,
  FilterList,
  GetApp,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';

import { BusinessStatusChip, BusinessTableContainer } from './BusinessLayoutComponents';

// Sample data for demonstration
const sampleRFQData = [
  {
    id: 'RFQ-2024-001',
    title: 'Ofis Malzemeleri Tedariki',
    supplier: 'ABC Tedarik Ltd.',
    amount: '₺45,320',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-01-25',
    createdBy: 'Ahmet Yılmaz',
    category: 'Ofis'
  },
  {
    id: 'RFQ-2024-002', 
    title: 'IT Ekipmanları',
    supplier: 'TechCorp A.Ş.',
    amount: '₺128,950',
    status: 'approved',
    priority: 'medium',
    dueDate: '2024-01-28',
    createdBy: 'Fatma Kaya',
    category: 'Teknoloji'
  },
  {
    id: 'RFQ-2024-003',
    title: 'Temizlik Malzemeleri',
    supplier: 'Clean Plus Ltd.',
    amount: '₺12,450',
    status: 'draft',
    priority: 'low',
    dueDate: '2024-02-01',
    createdBy: 'Mehmet Demir',
    category: 'Temizlik'
  },
  {
    id: 'RFQ-2024-004',
    title: 'Güvenlik Sistemleri',
    supplier: 'SecureTech A.Ş.',
    amount: '₺75,600',
    status: 'active',
    priority: 'high',
    dueDate: '2024-01-30',
    createdBy: 'Ayşe Öz',
    category: 'Güvenlik'
  },
  {
    id: 'RFQ-2024-005',
    title: 'Kırtasiye Malzemeleri',
    supplier: 'OfficeWorld Ltd.',
    amount: '₺8,950',
    status: 'inactive',
    priority: 'low',
    dueDate: '2024-02-05',
    createdBy: 'Can Yıldız',
    category: 'Ofis'
  }
];

// Business Data Table Component
export const BusinessDataTable = ({ 
  data = sampleRFQData,
  title = 'RFQ Listesi',
  dense = true,
  selectable = true,
  searchable = true,
  filterable = true,
  exportable = true,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  ...props 
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(dense ? 10 : 5);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Filtering and searching
  const filteredData = data.filter(row => 
    Object.values(row).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  // Selection handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(filteredData.map(row => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Menu handlers
  const handleMenuClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // Action handlers
  const handleAction = (action) => {
    if (selectedRow) {
      switch (action) {
        case 'view':
          onView?.(selectedRow);
          break;
        case 'edit':
          onEdit?.(selectedRow);
          break;
        case 'delete':
          onDelete?.(selectedRow);
          break;
        default:
          break;
      }
    }
    handleMenuClose();
  };

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Table filters and actions
  const tableFilters = searchable || filterable ? (
    <Stack direction="row" spacing={1} alignItems="center">
      {searchable && (
        <TextField
          size="small"
          placeholder="Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 16 }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: 200,
            '& .MuiInputBase-root': { 
              fontSize: '0.75rem',
              height: 32
            }
          }}
        />
      )}
      {filterable && (
        <IconButton size="small" sx={{ p: 0.5 }}>
          <FilterList sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Stack>
  ) : null;

  const tableActions = (
    <Stack direction="row" spacing={1}>
      {selected.length > 0 && (
        <Typography variant="body2" sx={{ fontSize: '0.75rem', alignSelf: 'center' }}>
          {selected.length} seçili
        </Typography>
      )}
      {exportable && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<GetApp sx={{ fontSize: 14 }} />}
          sx={{ 
            fontSize: '0.6875rem',
            height: 28,
            px: 1
          }}
        >
          Dışa Aktar
        </Button>
      )}
    </Stack>
  );

  return (
    <>
      <BusinessTableContainer
        title={title}
        filters={tableFilters}
        actions={tableActions}
        dense={dense}
        {...props}
      >
        <TableContainer>
          <Table size={dense ? 'small' : 'medium'} stickyHeader>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox" sx={{ width: 48 }}>
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < filteredData.length}
                      checked={filteredData.length > 0 && selected.length === filteredData.length}
                      onChange={handleSelectAllClick}
                      size="small"
                    />
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>RFQ No</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Başlık</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tedarikçi</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tutar</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Öncelik</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Son Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Kategori</TableCell>
                <TableCell sx={{ width: 48 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => {
                const isItemSelected = isSelected(row.id);
                
                return (
                  <TableRow
                    key={row.id}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    selected={isItemSelected}
                    onClick={() => onRowClick?.(row)}
                    sx={{ 
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onChange={() => handleSelectClick(row.id)}
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 500, fontFamily: 'monospace' }}>
                      {row.id}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', maxWidth: 200 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          {row.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                          {row.createdBy}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.supplier}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' }}>
                      {row.amount}
                    </TableCell>
                    <TableCell>
                      <BusinessStatusChip status={row.status} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.priority}
                        size="small"
                        color={getPriorityColor(row.priority)}
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.625rem',
                          height: 20,
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.dueDate}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.category}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, row)}
                        sx={{ p: 0.25 }}
                      >
                        <MoreVert sx={{ fontSize: 16 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={dense ? [10, 25, 50] : [5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          sx={{
            '& .MuiTablePagination-toolbar': {
              fontSize: '0.75rem'
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.75rem'
            }
          }}
        />
      </BusinessTableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            minWidth: 120,
            '& .MuiMenuItem-root': {
              fontSize: '0.75rem',
              py: 0.5
            }
          }
        }}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <Visibility sx={{ fontSize: 16, mr: 1 }} />
          Görüntüle
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <Edit sx={{ fontSize: 16, mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <Delete sx={{ fontSize: 16, mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>
    </>
  );
};

export default BusinessDataTable;
