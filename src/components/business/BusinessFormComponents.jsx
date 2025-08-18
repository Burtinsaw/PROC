// Business Form Components
// Enterprise-grade form controls optimized for business workflows

import React, { useState } from 'react';
import { 
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Typography,
  Stack,
  Divider,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Add,
  Remove,
  AttachFile,
  CalendarToday,
  Search
} from '@mui/icons-material';

import { BusinessSectionCard } from './BusinessLayoutComponents';

// Enhanced Auto-complete for suppliers, categories, etc.
export const BusinessAutoComplete = ({ 
  label,
  options = [],
  value,
  onChange,
  multiple = false,
  freeSolo = false,
  placeholder,
  required = false,
  dense = true,
  ...props 
}) => {

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={onChange}
      multiple={multiple}
      freeSolo={freeSolo}
      size={dense ? 'small' : 'medium'}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          variant="outlined"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: dense ? '0.75rem' : '0.875rem'
            },
            '& .MuiInputLabel-root': {
              fontSize: dense ? '0.75rem' : '0.875rem'
            }
          }}
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={index}
            variant="outlined"
            label={option}
            size="small"
            sx={{ fontSize: '0.6875rem', height: 20 }}
            {...getTagProps({ index })}
          />
        ))
      }
      PaperProps={{
        sx: {
          '& .MuiAutocomplete-option': {
            fontSize: dense ? '0.75rem' : '0.875rem',
            py: 0.5
          }
        }
      }}
      {...props}
    />
  );
};

// Dynamic Field Array Component (for line items, contacts, etc.)
export const BusinessFieldArray = ({ 
  fields, 
  onAdd, 
  onRemove, 
  onUpdate,
  title,
  addButtonText = 'Yeni Ekle',
  dense = true,
  ...props 
}) => {
  const theme = useTheme();

  return (
    <BusinessSectionCard 
      title={title}
      headerActions={
        <Button
          size="small"
          variant="outlined"
          startIcon={<Add sx={{ fontSize: 14 }} />}
          onClick={onAdd}
          sx={{ 
            fontSize: '0.6875rem',
            height: 28,
            px: 1
          }}
        >
          {addButtonText}
        </Button>
      }
      dense={dense}
      {...props}
    >
      <Stack spacing={1.5}>
        {fields.map((field, index) => (
          <Box
            key={field.id || index}
            sx={{
              p: 1.5,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.background.paper, 0.5)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Ürün Adı"
                      value={field.productName || ''}
                      onChange={(e) => onUpdate(index, 'productName', e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { fontSize: '0.75rem' },
                        '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Miktar"
                      type="number"
                      value={field.quantity || ''}
                      onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { fontSize: '0.75rem' },
                        '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Birim"
                      value={field.unit || ''}
                      onChange={(e) => onUpdate(index, 'unit', e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { fontSize: '0.75rem' },
                        '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Birim Fiyat"
                      type="number"
                      value={field.unitPrice || ''}
                      onChange={(e) => onUpdate(index, 'unitPrice', e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { fontSize: '0.75rem' },
                        '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Açıklama"
                      multiline
                      rows={2}
                      value={field.description || ''}
                      onChange={(e) => onUpdate(index, 'description', e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { fontSize: '0.75rem' },
                        '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
              <IconButton
                size="small"
                color="error"
                onClick={() => onRemove(index)}
                sx={{ mt: 0.5 }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        ))}
        
        {fields.length === 0 && (
          <Box
            sx={{
              py: 3,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.text.disabled, 0.02)
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Henüz öğe eklenmedi. Yukarıdaki butona tıklayarak ekleyebilirsiniz.
            </Typography>
          </Box>
        )}
      </Stack>
    </BusinessSectionCard>
  );
};

// Business Form Layout Component
export const BusinessFormLayout = ({ 
  title,
  subtitle,
  children,
  actions,
  dense = true,
  ...props 
}) => {

  return (
    <Box sx={{ p: dense ? 2 : 3 }} {...props}>
      {/* Form Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                fontSize: dense ? '1.25rem' : '1.5rem',
                color: 'text.primary',
                mb: subtitle ? 0.5 : 0
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Stack direction="row" spacing={1}>
              {actions}
            </Stack>
          )}
        </Box>
        <Divider />
      </Box>

      {/* Form Content */}
      <Box sx={{ maxWidth: 1200 }}>
        {children}
      </Box>
    </Box>
  );
};

// Sample RFQ Form using business components
export const SampleRFQForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    supplier: null,
    category: null,
    priority: 'medium',
    dueDate: '',
    items: []
  });

  const [suppliers] = useState([
    'ABC Tedarik Ltd.',
    'TechCorp A.Ş.',
    'Clean Plus Ltd.',
    'SecureTech A.Ş.',
    'OfficeWorld Ltd.'
  ]);

  const [categories] = useState([
    'Ofis',
    'Teknoloji',
    'Temizlik',
    'Güvenlik',
    'Kırtasiye'
  ]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      productName: '',
      quantity: '',
      unit: '',
      unitPrice: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const formActions = [
    <Button key="cancel" variant="outlined" size="small">
      İptal
    </Button>,
    <Button key="draft" variant="outlined" size="small">
      Taslak Kaydet
    </Button>,
    <Button key="submit" variant="contained" size="small">
      Gönder
    </Button>
  ];

  return (
    <BusinessFormLayout
      title="Yeni RFQ Oluştur"
      subtitle="Tedarik talebi formu"
      actions={formActions}
    >
      <Stack spacing={3}>
        {/* Basic Information */}
        <BusinessSectionCard title="Temel Bilgiler">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="RFQ Başlığı"
                required
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                sx={{
                  '& .MuiInputBase-root': { fontSize: '0.75rem' },
                  '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Açıklama"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                sx={{
                  '& .MuiInputBase-root': { fontSize: '0.75rem' },
                  '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <BusinessAutoComplete
                label="Tedarikçi"
                options={suppliers}
                value={formData.supplier}
                onChange={(event, newValue) => handleFieldChange('supplier', newValue)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <BusinessAutoComplete
                label="Kategori"
                options={categories}
                value={formData.category}
                onChange={(event, newValue) => handleFieldChange('category', newValue)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.75rem' }}>Öncelik</InputLabel>
                <Select
                  value={formData.priority}
                  label="Öncelik"
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                  sx={{
                    '& .MuiSelect-select': { fontSize: '0.75rem' },
                    '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                  }}
                >
                  <MenuItem value="low" sx={{ fontSize: '0.75rem' }}>Düşük</MenuItem>
                  <MenuItem value="medium" sx={{ fontSize: '0.75rem' }}>Orta</MenuItem>
                  <MenuItem value="high" sx={{ fontSize: '0.75rem' }}>Yüksek</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Son Teslim Tarihi"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dueDate}
                onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                sx={{
                  '& .MuiInputBase-root': { fontSize: '0.75rem' },
                  '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                }}
              />
            </Grid>
          </Grid>
        </BusinessSectionCard>

        {/* Items */}
        <BusinessFieldArray
          title="Ürün/Hizmet Detayları"
          fields={formData.items}
          onAdd={handleAddItem}
          onRemove={handleRemoveItem}
          onUpdate={handleUpdateItem}
          addButtonText="Ürün Ekle"
        />

        {/* Attachments */}
        <BusinessSectionCard 
          title="Ek Dosyalar"
          headerActions={
            <Button
              size="small"
              variant="outlined"
              startIcon={<AttachFile sx={{ fontSize: 14 }} />}
              sx={{ fontSize: '0.6875rem', height: 28, px: 1 }}
            >
              Dosya Ekle
            </Button>
          }
        >
          <Box
            sx={{
              py: 3,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Dosya yüklemek için sürükleyip bırakın veya yukarıdaki butona tıklayın
            </Typography>
          </Box>
        </BusinessSectionCard>
      </Stack>
    </BusinessFormLayout>
  );
};

export default {
  BusinessAutoComplete,
  BusinessFieldArray,
  BusinessFormLayout,
  SampleRFQForm
};
