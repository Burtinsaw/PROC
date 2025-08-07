import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  FormHelperText,
  RadioGroup,
  Radio,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon,
  CloudUpload as UploadIcon,
  Language as TranslateIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  SmartToy as AIIcon,
  AddBox as AddAllIcon,
  Flight as InternationalIcon,
  Home as DomesticIcon
} from '@mui/icons-material';
import FileUpload from '../../components/FileUpload';


const UnifiedRequestSystem = () => {
  // Hot reload için değişiklik - Yeni tasarım aktif
  console.log('🎨 YENİ TASARIM ÇALIŞIYOR - CARD TABANLI GÖRÜNÜM');
  
  // Form states
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Talep Bilgileri
    title: '', // Talep Başlığı
    customerName: '', // Talep Alıcı Firma/Kişi
    requesterName: '', // Talebi Gönderen
    requestTitle: '', // Talep Başlığı (Orjinal dosya adı, Request no, Zayafka no, Proje bilgisi)
    description: '', // Açıklama
    requestDate: new Date().toISOString().split('T')[0],
    department: '', // Departman
    urgency: 'medium', // Aciliyet
    requestedBy: '', // Talep Eden
    expectedDeliveryDate: '', // Beklenen Teslimat Tarihi
    
    // Ürün bilgileri - AI ile dolacak
    items: [],
    
    // Dosya bilgileri
    uploadedFiles: [],
    extractedProducts: [], // AI ile çıkarılan ürünler
    
    // Diğer bilgiler (ileride eklenecek)
    supplier: '',
    budget: '',
    logistics: '',
    currency: 'TRY', // Para birimi
    paymentTerms: '', // Ödeme koşulları
    
    // Gümrük bilgileri (international için)
    customsInfo: {
      hsCode: '',
      origin: '',
      weight: '',
      dimensions: '',
      incoterms: 'CIF'
    },
    
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [requestType, setRequestType] = useState('domestic'); // domestic: Yurtiçi, international: Uluslararası
  
  // Sabit değerler
  const urgencyOptions = [
    { value: 'low', label: 'Düşük', color: 'success' },
    { value: 'medium', label: 'Orta', color: 'warning' },
    { value: 'high', label: 'Yüksek', color: 'error' }
  ];
  
  const incotermOptions = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FOB', 'CFR', 'CIF'];
  
  const currencyOptions = [
    { value: 'TRY', label: 'TRY (₺)', symbol: '₺' },
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' }
  ];

  const steps = [
    {
      label: 'Talep Bilgileri',
      description: 'Talep alıcı ve gönderen bilgileri'
    },
    {
      label: 'Dosya Yükleme ve Ürün Çıkarma',
      description: 'AI ile dosyadan ürün bilgilerini çıkarın'
    },
    {
      label: 'Onay ve Gönderim',
      description: 'Talep detaylarını gözden geçirin ve gönderin'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  const handleCustomsInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      customsInfo: {
        ...prev.customsInfo,
        [field]: value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: prev.items.length + 1,
          name: '',
          description: '',
          quantity: 1,
          unit: 'adet',
          estimatedPrice: '',
          category: ''
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // File Upload Handlers
  const handleFilesProcessed = (processedFiles) => {
    console.log('📁 Processed files:', processedFiles);
    
    // Başarılı dosyaları formData'ya ekle
    const successfulFiles = processedFiles.filter(file => file.status === 'success');
    
    setFormData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...successfulFiles]
    }));

    // AI ile çıkarılan ürünleri işle
    const allExtractedProducts = [];
    successfulFiles.forEach(fileData => {
      if (fileData.result?.aiAnalysis?.results?.productExtraction?.success) {
        const products = fileData.result.aiAnalysis.results.productExtraction.products || [];
        products.forEach(product => {
          allExtractedProducts.push({
            ...product,
            sourceFile: fileData.file.name,
            fileId: fileData.id
          });
        });
      }
    });

    if (allExtractedProducts.length > 0) {
      // Kullanıcıya onay soralım - otomatik ekleme
      if (window.confirm(`${allExtractedProducts.length} ürün tespit edildi. Tümünü talebe otomatik olarak eklemek ister misiniz?`)) {
        // Ürünleri forma ekle
        addExtractedProductsToFormAuto(allExtractedProducts);
      }
    }
  };

  // Otomatik ürün ekleme fonksiyonu
  const addExtractedProductsToFormAuto = (products) => {
    const newItems = products.map((product, index) => ({
      id: formData.items.length + index + 1,
      name: product.name || '',
      description: product.description || '',
      quantity: parseInt(product.quantity) || 1,
      unit: product.unit || 'adet',
      estimatedPrice: product.estimatedPrice || '',
      category: product.category || '',
      sourceFile: product.sourceFile,
      extractedByAI: true
    }));

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));

    console.log(`✅ ${newItems.length} ürün otomatik olarak forma eklendi`);
    alert(`${newItems.length} ürün dosyalardan çıkarılarak talebe eklendi!`);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.title) newErrors.title = 'Talep başlığı gereklidir';
        if (!formData.description) newErrors.description = 'Açıklama gereklidir';
        if (!formData.department) newErrors.department = 'Departman seçimi gereklidir';
        break;
        
      case 1:
        formData.items.forEach((item, index) => {
          if (!item.name) newErrors[`item_${index}_name`] = 'Ürün adı gereklidir';
          if (!item.quantity || item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Geçerli miktar giriniz';
        });
        break;
        
      case 2:
        if (requestType === 'international') {
          if (!formData.supplierCountry) newErrors.supplierCountry = 'Tedarikçi ülkesi gereklidir';
          if (!formData.customsInfo.origin) newErrors.origin = 'Menşe ülkesi gereklidir';
        }
        break;
        
      case 3:
        if (!formData.budget) newErrors.budget = 'Bütçe bilgisi gereklidir';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    setLoading(true);
    try {
      // API call simulation
      console.log('Submitting request:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Talep başarıyla oluşturuldu!');
      
      // Reset form
      setActiveStep(0);
      setFormData({
        title: '',
        description: '',
        urgency: 'normal',
        department: '',
        requestedBy: '',
        requestDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        supplier: '',
        supplierCountry: '',
        supplierContact: '',
        items: [{
          id: 1,
          name: '',
          description: '',
          quantity: 1,
          unit: 'adet',
          estimatedPrice: '',
          category: ''
        }],
        customsInfo: {
          hsCode: '',
          origin: '',
          weight: '',
          dimensions: '',
          incoterms: 'CIF'
        },
        budget: '',
        currency: requestType === 'international' ? 'USD' : 'TRY',
        paymentTerms: '',
        attachments: []
      });
      
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Talep gönderilirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ maxWidth: '1000px', mx: 'auto', p: 2 }}>
            {/* Kişi Bilgileri Card */}
            <Card 
              elevation={0} 
              sx={{ 
                mb: 3, 
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <InfoIcon />
                <Typography variant="h6" fontWeight={600}>
                  Kişi ve İletişim Bilgileri
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Talep Alıcı Firma/Kişi"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      error={!!errors.customerName}
                      helperText={errors.customerName || "Bu talebi kimin için yapıyorsunuz?"}
                      required
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Talebi Gönderen"
                      value={formData.requesterName}
                      onChange={(e) => handleInputChange('requesterName', e.target.value)}
                      error={!!errors.requesterName}
                      helperText={errors.requesterName || "Adınız ve soyadınız"}
                      required
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Talep Detayları Card */}
            <Card 
              elevation={0} 
              sx={{ 
                mb: 3, 
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  bgcolor: 'secondary.main', 
                  color: 'white', 
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AddIcon />
                <Typography variant="h6" fontWeight={600}>
                  Talep Detayları
                </Typography>
              </Box>
              <CardContent sx={{ p: 3, '& > *': { mb: 3 }, '& > *:last-child': { mb: 0 } }}>
                <TextField
                  fullWidth
                  label="Talep Başlığı"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title || "Talep konusu, proje adı veya referans numarası giriniz"}
                  required
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Açıklama"
                  placeholder="Talep detaylarını, özel isteklerinizi ve diğer önemli bilgileri buraya yazınız..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description || "Detaylı açıklama talep sürecini hızlandırır"}
                  required
                  variant="outlined"
                />
              </CardContent>
            </Card>

            {/* Sistem Bilgileri Card */}
            <Card 
              elevation={0} 
              sx={{ 
                mb: 3, 
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  bgcolor: 'success.main', 
                  color: 'white', 
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CheckIcon />
                <Typography variant="h6" fontWeight={600}>
                  Sistem ve Tarih Bilgileri
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth required error={!!errors.department}>
                      <InputLabel>Departman</InputLabel>
                      <Select
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        label="Departman"
                      >
                        <MenuItem value="IT">Bilgi İşlem</MenuItem>
                        <MenuItem value="HR">İnsan Kaynakları</MenuItem>
                        <MenuItem value="Finance">Finans</MenuItem>
                        <MenuItem value="Operations">Operasyon</MenuItem>
                        <MenuItem value="Marketing">Pazarlama</MenuItem>
                        <MenuItem value="Production">Üretim</MenuItem>
                      </Select>
                      {errors.department && (
                        <FormHelperText>{errors.department}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Talep Tarihi"
                      value={formData.requestDate}
                      onChange={(e) => handleInputChange('requestDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            {/* File Upload Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                📁 Dosya Yükleme ve AI Ürün Çıkarma
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                PDF, Excel, Word veya resim dosyalarından AI ile otomatik ürün çıkarma
              </Typography>
              
              <FileUpload
                onFilesProcessed={handleFilesProcessed}
                multiple={true}
                maxFiles={5}
                enableAI={true}
                aiOptions={{
                  translation: true,
                  productExtraction: true
                }}
                showPreview={true}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Ürün/Hizmet Detayları</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addItem}
                size="small"
              >
                Ürün Ekle
              </Button>
            </Box>
            
            <Box container spacing={{ xs: 2, sm: 3 }}>
              {formData.items.map((item, index) => (
                <Box key={item.id} sx={{ width: '100%', mb: 2 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1">
                          Ürün #{index + 1}
                          {item.extractedByAI && (
                            <Chip 
                              label={`AI: ${item.sourceFile}`} 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        {formData.items.length > 1 && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                          <TextField
                            fullWidth
                            label="Ürün/Hizmet Adı"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            error={!!errors[`item_${index}_name`]}
                            helperText={errors[`item_${index}_name`]}
                            required
                          />
                        </Box>
                        
                        <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                          <TextField
                            fullWidth
                            label="Kategori"
                            value={item.category}
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                          />
                        </Box>
                        
                        <Box sx={{ flex: '1 1 100%', width: '100%' }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Açıklama"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          />
                        </Box>
                        
                        <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Miktar"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            error={!!errors[`item_${index}_quantity`]}
                            helperText={errors[`item_${index}_quantity`]}
                            required
                          />
                        </Box>
                        
                        <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
                          <FormControl fullWidth>
                            <InputLabel>Birim</InputLabel>
                            <Select
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              label="Birim"
                            >
                              <MenuItem value="adet">Adet</MenuItem>
                              <MenuItem value="kg">Kilogram</MenuItem>
                              <MenuItem value="lt">Litre</MenuItem>
                              <MenuItem value="m">Metre</MenuItem>
                              <MenuItem value="m2">Metrekare</MenuItem>
                              <MenuItem value="m3">Metreküp</MenuItem>
                              <MenuItem value="paket">Paket</MenuItem>
                              <MenuItem value="kutu">Kutu</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
                          <TextField
                            fullWidth
                            label="Tahmini Fiyat"
                            value={item.estimatedPrice}
                            onChange={(e) => handleItemChange(index, 'estimatedPrice', e.target.value)}
                            InputProps={{
                              endAdornment: formData.currency
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="h6" gutterBottom>Tedarikçi Bilgileri</Typography>
              </Box>
            
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Tedarikçi Adı"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
              />
            </Box>
            
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="İletişim Bilgisi"
                value={formData.supplierContact}
                onChange={(e) => handleInputChange('supplierContact', e.target.value)}
              />
            </Box>
            
            {requestType === 'international' && (
              <>
                <Box sx={{ width: '100%' }}>
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Uluslararası Talep - Ek Bilgiler" color="primary" />
                  </Divider>
                </Box>
                
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Tedarikçi Ülkesi"
                    value={formData.supplierCountry}
                    onChange={(e) => handleInputChange('supplierCountry', e.target.value)}
                    error={!!errors.supplierCountry}
                    helperText={errors.supplierCountry}
                    required
                  />
                </Box>
                
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Menşe Ülkesi"
                    value={formData.customsInfo.origin}
                    onChange={(e) => handleCustomsInfoChange('origin', e.target.value)}
                    error={!!errors.origin}
                    helperText={errors.origin}
                    required
                  />
                </Box>
                
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="HS Kodu"
                    value={formData.customsInfo.hsCode}
                    onChange={(e) => handleCustomsInfoChange('hsCode', e.target.value)}
                    helperText="Gümrük tarife pozisyon kodu"
                  />
                </Box>
                
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Incoterms</InputLabel>
                    <Select
                      value={formData.customsInfo.incoterms}
                      onChange={(e) => handleCustomsInfoChange('incoterms', e.target.value)}
                      label="Incoterms"
                    >
                      {incotermOptions.map(term => (
                        <MenuItem key={term} value={term}>{term}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Toplam Ağırlık (kg)"
                    value={formData.customsInfo.weight}
                    onChange={(e) => handleCustomsInfoChange('weight', e.target.value)}
                  />
                </Box>
                
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Boyutlar (cm)"
                    value={formData.customsInfo.dimensions}
                    onChange={(e) => handleCustomsInfoChange('dimensions', e.target.value)}
                    placeholder="Uzunluk x Genişlik x Yükseklik"
                  />
                </Box>
              </>
            )}
          </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="h6" gutterBottom>Finansal Bilgiler</Typography>
              </Box>
            
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Toplam Bütçe"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                error={!!errors.budget}
                helperText={errors.budget}
                required
              />
            </Box>
            
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth>
                <InputLabel>Para Birimi</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  label="Para Birimi"
                >
                  {currencyOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ width: '100%' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Ödeme Koşulları"
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                placeholder="Örn: 30 gün vadeli, %50 peşin %50 teslimatta, vs."
              />
            </Box>
          </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>Talep Özeti</Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Genel Bilgiler
                    </Typography>
                    <Box sx={{ '& > div': { mb: 1 } }}>
                      <Box><strong>Tür:</strong> {requestType === 'international' ? 'Uluslararası' : 'Yurtiçi'}</Box>
                      <Box><strong>Başlık:</strong> {formData.title}</Box>
                      <Box><strong>Departman:</strong> {formData.department}</Box>
                      <Box><strong>Aciliyet:</strong> 
                        <Chip 
                          size="small" 
                          label={urgencyOptions.find(o => o.value === formData.urgency)?.label}
                          color={urgencyOptions.find(o => o.value === formData.urgency)?.color}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Finansal Bilgiler
                    </Typography>
                    <Box sx={{ '& > div': { mb: 1 } }}>
                      <Box><strong>Bütçe:</strong> {formData.budget} {formData.currency}</Box>
                      <Box><strong>Ürün Sayısı:</strong> {formData.items.length}</Box>
                      {formData.supplier && (
                        <Box><strong>Tedarikçi:</strong> {formData.supplier}</Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ width: '100%' }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Ürün Listesi
                    </Typography>
                    {formData.items.map((item) => (
                      <Box key={item.id} sx={{ 
                        p: 2, 
                        mb: 2, 
                        bgcolor: 'grey.50', 
                        borderRadius: 1,
                        '&:last-child': { mb: 0 }
                      }}>
                        <Typography variant="subtitle2">
                          {item.name}
                          {item.extractedByAI && (
                            <Chip 
                              label="AI Çıkarım" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.quantity} {item.unit}
                          {item.estimatedPrice && ` - ${item.estimatedPrice} ${formData.currency}`}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      maxWidth: '1200px',
      mx: 'auto'
    }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Birleşik Talep Sistemi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Yurtiçi ve uluslararası talepleri tek bir sistemde yönetin
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="h6">{step.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ 
                    mt: 2, 
                    mb: 3, 
                    px: { xs: 0, sm: 1, md: 2 },
                    py: { xs: 1, sm: 2 },
                    maxWidth: '100%'
                  }}>
                    {renderStepContent(index)}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 3 }, flexWrap: 'wrap' }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      variant="outlined"
                      size="medium"
                    >
                      Geri
                    </Button>
                    
                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading ? null : <SendIcon />}
                        size="medium"
                      >
                        {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        size="medium"
                      >
                        İleri
                      </Button>
                    )}
                    
                    <Button
                      variant="text"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                      size="medium"
                    >
                      Taslak Kaydet
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UnifiedRequestSystem;
