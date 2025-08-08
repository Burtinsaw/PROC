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
  Divider,
  Alert,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Language as TranslateIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  SmartToy as AIIcon,
  AddBox as AddAllIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon,
  ExpandMore as ExpandIcon,
  Description as FileIcon,
  Image as ImageIcon,
  TableChart as ExcelIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const UnifiedRequestSystem = () => {
  const theme = useTheme();
  
  // Form states
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Talep Bilgileri
    customerName: '', // Talep Alıcı Firma/Kişi
    requesterName: '', // Talebi Gönderen
    requestTitle: '', // Talep Başlığı (Orjinal dosya adı, Request no, Zayafka no, Proje bilgisi)
    description: '', // Açıklama
    requestDate: new Date().toISOString().split('T')[0],
    
    // Ürün bilgileri - AI ile dolacak
    items: [],
    
    // Dosya bilgileri
    uploadedFiles: [],
    extractedProducts: [], // AI ile çıkarılan ürünler
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [targetLanguage, setTargetLanguage] = useState('tr'); // tr: Türkçe, en: İngilizce
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);

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

  // Dosya yükleme işlemi
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setProcessingFile(true);
    setExtractionProgress(0);

    // Dosya tipini kontrol et
    const validTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'image/jpeg', 'image/png', 'image/jpg'];
    
    if (!validTypes.includes(file.type)) {
      alert('Desteklenmeyen dosya tipi! PDF, Excel, Word veya resim dosyası yükleyin.');
      setProcessingFile(false);
      return;
    }

    try {
      // Dosyayı FormData ile gönder
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetLanguage', targetLanguage);

      setExtractionProgress(20);

      // Gemini API ile dosyayı işle
      const aiService = await import('../../services/aiService');
      const response = await aiService.default.processFileWithGemini(file, targetLanguage);
      
      setExtractionProgress(80);

      if (response.success) {
        setFormData(prev => ({
          ...prev,
          extractedProducts: response.products,
          uploadedFiles: [{
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString()
          }]
        }));
        
        // Tüm ürünleri varsayılan olarak seç
        setSelectedProducts(response.products.map((_, index) => index));
      }

      setExtractionProgress(100);
      setTimeout(() => {
        setProcessingFile(false);
        alert(`${response.products.length} ürün başarıyla çıkarıldı!`);
      }, 500);

    } catch (error) {
      console.error('Dosya işleme hatası:', error);
      alert('Dosya işlenirken bir hata oluştu!');
      setProcessingFile(false);
    }
  };



  // Seçili ürünleri talebe ekle
  const handleAddSelectedProducts = () => {
    const productsToAdd = formData.extractedProducts.filter((_, index) => 
      selectedProducts.includes(index)
    );

    const newItems = productsToAdd.map((product, index) => ({
      id: formData.items.length + index + 1,
      brand: product.brand || '',
      name: product.productName || '',
      articleNumber: product.articleNumber || '',
      quantity: product.quantity || 1,
      unit: product.unit || 'adet',
      description: product.description || '',
      extractedByAI: true
    }));

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));

    alert(`${newItems.length} ürün talebe eklendi!`);
    
    // Eklenen ürünleri listeden kaldır
    const remainingProducts = formData.extractedProducts.filter((_, index) => 
      !selectedProducts.includes(index)
    );
    setFormData(prev => ({
      ...prev,
      extractedProducts: remainingProducts
    }));
    setSelectedProducts([]);
  };

  // Tüm ürünleri seç/seçimi kaldır
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProducts(formData.extractedProducts.map((_, index) => index));
    } else {
      setSelectedProducts([]);
    }
  };

  // Tek ürün seçimi
  const handleSelectProduct = (index) => {
    setSelectedProducts(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Ürünü sil
  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.customerName) newErrors.customerName = 'Talep alıcı firma/kişi gereklidir';
        if (!formData.requesterName) newErrors.requesterName = 'Talebi gönderen kişi gereklidir';
        if (!formData.requestTitle) newErrors.requestTitle = 'Talep başlığı gereklidir';
        break;
        
      case 1:
        if (formData.items.length === 0) {
          newErrors.items = 'En az bir ürün eklemelisiniz';
        }
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
      console.log('Talep gönderiliyor:', formData);
      
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Talep başarıyla oluşturuldu!');
      
      // Formu sıfırla
      setActiveStep(0);
      setFormData({
        customerName: '',
        requesterName: '',
        requestTitle: '',
        description: '',
        requestDate: new Date().toISOString().split('T')[0],
        items: [],
        uploadedFiles: [],
        extractedProducts: []
      });
      
    } catch (error) {
      console.error('Talep gönderme hatası:', error);
      alert('Talep gönderilirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="primary" />
                  Talep Bilgileri
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Talep Alıcı Firma/Kişi (Müşteri)"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Talebi Gönderen (Adı)"
                  value={formData.requesterName}
                  onChange={(e) => handleInputChange('requesterName', e.target.value)}
                  error={!!errors.requesterName}
                  helperText={errors.requesterName}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Talep Başlığı"
                  value={formData.requestTitle}
                  onChange={(e) => handleInputChange('requestTitle', e.target.value)}
                  error={!!errors.requestTitle}
                  helperText={errors.requestTitle || "Orjinal talep dosya adı, Request no, Zayafka no, Proje bilgisi vb."}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Açıklama"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  helperText="Talep ile ilgili ek bilgiler"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Talep Tarihi"
                  value={formData.requestDate}
                  onChange={(e) => handleInputChange('requestDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
            {/* Dosya Yükleme Bölümü */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UploadIcon color="primary" />
                Talep Dosyası Yükleme
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ 
                    border: '2px dashed',
                    borderColor: theme.palette.divider,
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: theme.palette.action.hover
                    }
                  }}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                      disabled={processingFile}
                    />
                    <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                      Dosya seçmek için tıklayın veya sürükleyip bırakın
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PDF, Excel, Word veya Resim dosyası (Max 10MB)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Çeviri Dili</InputLabel>
                    <Select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      label="Çeviri Dili"
                    >
                      <MenuItem value="tr">Türkçe</MenuItem>
                      <MenuItem value="en">İngilizce</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {uploadedFile && (
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Yüklenen Dosya:
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {uploadedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>

              {processingFile && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AIIcon color="primary" />
                    AI ile dosya işleniyor...
                  </Typography>
                  <LinearProgress variant="determinate" value={extractionProgress} sx={{ mt: 1 }} />
                </Box>
              )}
            </Paper>

            {/* Çıkarılan Ürünler */}
            {formData.extractedProducts.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AIIcon color="primary" />
                    AI ile Çıkarılan Ürünler ({formData.extractedProducts.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddAllIcon />}
                    onClick={handleAddSelectedProducts}
                    disabled={selectedProducts.length === 0}
                  >
                    Seçili Ürünleri Ekle ({selectedProducts.length})
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedProducts.length === formData.extractedProducts.length}
                            indeterminate={selectedProducts.length > 0 && selectedProducts.length < formData.extractedProducts.length}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell>Marka</TableCell>
                        <TableCell>Ürün Adı</TableCell>
                        <TableCell>Artikel No</TableCell>
                        <TableCell>Adet</TableCell>
                        <TableCell>Birim</TableCell>
                        <TableCell>Açıklama</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.extractedProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedProducts.includes(index)}
                              onChange={() => handleSelectProduct(index)}
                            />
                          </TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell>{product.articleNumber}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>{product.unit}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{product.description}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Orjinal: {product.originalText}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* Talebe Eklenen Ürünler */}
            {formData.items.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color="success" />
                  Talebe Eklenen Ürünler ({formData.items.length})
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Marka</TableCell>
                        <TableCell>Ürün Adı</TableCell>
                        <TableCell>Artikel No</TableCell>
                        <TableCell>Adet</TableCell>
                        <TableCell>Birim</TableCell>
                        <TableCell>İşlem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.brand}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.articleNumber}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => removeItem(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {errors.items && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.items}
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>Talep Özeti</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Talep Bilgileri
                    </Typography>
                    <Box sx={{ '& > div': { mb: 1 } }}>
                      <Box><strong>Müşteri:</strong> {formData.customerName}</Box>
                      <Box><strong>Gönderen:</strong> {formData.requesterName}</Box>
                      <Box><strong>Başlık:</strong> {formData.requestTitle}</Box>
                      {formData.description && (
                        <Box><strong>Açıklama:</strong> {formData.description}</Box>
                      )}
                      <Box><strong>Tarih:</strong> {new Date(formData.requestDate).toLocaleDateString('tr-TR')}</Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Ürün Listesi ({formData.items.length} ürün)
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Marka</TableCell>
                            <TableCell>Ürün</TableCell>
                            <TableCell>Artikel No</TableCell>
                            <TableCell>Adet</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formData.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.brand}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.articleNumber}</TableCell>
                              <TableCell>{item.quantity} {item.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Yeni Talep Oluştur
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI destekli dosya işleme ile hızlı talep oluşturma
        </Typography>
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
                  <Box sx={{ mt: 2, mb: 3 }}>
                    {renderStepContent(index)}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Geri
                    </Button>
                    
                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading ? null : <SendIcon />}
                      >
                        {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                      >
                        İleri
                      </Button>
                    )}
                    
                    <Button
                      variant="text"
                      startIcon={<SaveIcon />}
                      disabled={loading}
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
