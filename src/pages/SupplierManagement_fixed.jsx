import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Plus } from 'lucide-react';
import { UniversalPageHeader } from '../components/universal';

const SupplierManagement = () => {
  // theme şu an kullanılmıyor, ileride stil için eklenebilir

  const onAddSupplier = () => {
    // TODO: Yeni tedarikçi diyalogu ya da yönlendirme
    // Geçici olarak sadece bir log bırakıyoruz
    try { console.log('Add Supplier clicked'); } catch { /* ignore */ }
  };

  return (
    <Box sx={{ 
      p: 2,
      bgcolor: 'background.default',
      minHeight: 'calc(100vh - 64px)',
      width: '100%'
    }}>
      <Box sx={{ mb: 3 }}>
        <UniversalPageHeader
          title="Supplier Management"
          subtitle="Manage suppliers, track performance and add new suppliers"
          actions={[
            <Button key="add" variant="contained" startIcon={<Plus />} onClick={onAddSupplier}>
              Add Supplier
            </Button>
          ]}
        />
      </Box>
  <Typography variant="body2" color="text.secondary">Bu sayfa yakında geliştirilecek.</Typography>
    </Box>
  );
};

export default SupplierManagement;
