import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip
} from '@mui/material';
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AIIcon from '@mui/icons-material/SmartToy';
import axios from '../utils/axios';
import { toast } from 'sonner';

const FileUpload = ({ 
  onFilesProcessed, 
  onProductsExtracted, // optional callback with normalized products
  multiple = true, 
  maxFiles = 5, 
  enableAI = false,
  aiOptions = {},
  showPreview = true 
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    
    if (selectedFiles.length === 0) return;

    // Dosya sayısı kontrolü
    if (multiple && selectedFiles.length > maxFiles) {
      alert(`En fazla ${maxFiles} dosya seçebilirsiniz.`);
      return;
    }

    setUploading(true);
    setProgress(0);

    const processFiles = async () => {
      try {
        // If AI is enabled, call backend extraction
  if (enableAI) {
          const form = new FormData();
          selectedFiles.forEach(f => form.append('files', f));
          const { data } = await axios.post('/ai/extract-products', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (evt) => {
              if (evt.total) setProgress(Math.min(99, (evt.loaded / evt.total) * 100));
            }
          });
          const rawResults = Array.isArray(data?.results) ? data.results : [];
          const processed = rawResults.map(r => ({
            ...r,
            file: { name: r.file?.name, size: r.file?.size || 0 }
          }));
          setFiles(prev => [...prev, ...processed]);
          if (onFilesProcessed) onFilesProcessed(processed);
          // UX: summarize extraction
          const totalProducts = rawResults.reduce((acc, r) => acc + (r?.result?.aiAnalysis?.results?.productExtraction?.products?.length || 0), 0);
          if (totalProducts > 0) {
            toast.success(`${totalProducts} ürün tespit edildi`);
          } else {
            toast.info('Ürün tespit edilemedi');
          }
          // If consumer wants the extracted products, normalize and emit
          if (onProductsExtracted) {
            const allProducts = [];
            for (const r of rawResults) {
              const products = r?.result?.aiAnalysis?.results?.productExtraction?.products || [];
              const meta = r?.result?.aiAnalysis?.results?.productExtraction?.meta;
              for (const p of products) {
                const normalized = {
                  description: p.name || p.productName || p.description || 'Ürün',
                  qty: Number(p.quantity || p.qty || 1),
                  uom: p.unit || p.uom || 'ADET',
                  brand: p.brand,
                  model: p.model,
                  articleNumber: p.articleNumber || p.article || p.sku,
                  productType: p.productType || p.type,
                  meta: { aiConfidence: p.confidence ?? meta?.confidence, attributes: p.attributes || meta?.attributes }
                };
                allProducts.push(normalized);
              }
            }
            if (allProducts.length) onProductsExtracted(allProducts);
          }
        } else {
          // No AI: just keep file list locally
          const processed = selectedFiles.map((file, i) => ({ id: Date.now() + i, file, status: 'success' }));
          setFiles(prev => [...prev, ...processed]);
          if (onFilesProcessed) onFilesProcessed(processed);
        }
      } catch (err) {
        console.error('Upload/extract error:', err);
        const processed = selectedFiles.map((file, i) => ({ id: Date.now() + i, file, status: 'error', error: err.response?.data?.message || err.message }));
        setFiles(prev => [...prev, ...processed]);
        if (onFilesProcessed) onFilesProcessed(processed);
        toast.error(err.response?.data?.message || 'AI ürün çıkarma başarısız');
      } finally {
        setUploading(false);
        setProgress(0);
      }
    };

    processFiles();
  }, [multiple, maxFiles, enableAI, onFilesProcessed, onProductsExtracted]);

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UploadIcon />
            Dosya Yükleme
            {enableAI && <AIIcon color="primary" />}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {multiple ? `En fazla ${maxFiles} dosya` : '1 dosya'} seçebilirsiniz. 
            Desteklenen formatlar: PDF, DOCX, XLSX, PNG, JPG
          </Typography>
        </Box>

        <input
          accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
          style={{ display: 'none' }}
          id="file-upload-input"
          type="file"
          multiple={multiple}
          onChange={handleFileSelect}
        />
        
        <label htmlFor="file-upload-input">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadIcon />}
            disabled={uploading}
            sx={{ mb: 2 }}
          >
            {uploading ? 'Yükleniyor...' : 'Dosya Seç'}
          </Button>
        </label>

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {progress.toFixed(0)}% tamamlandı
            </Typography>
          </Box>
        )}

        {enableAI && aiOptions.productExtraction && (
          <Alert severity="info" icon={<AIIcon />} sx={{ mb: 2 }}>
            AI ile otomatik ürün çıkarma aktif. Yüklenen dosyalardan ürün bilgileri otomatik olarak tespit edilecek.
          </Alert>
        )}

        {showPreview && files.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Yüklenen Dosyalar ({files.length})
            </Typography>
            <List dense>
              {files.map((fileData) => (
                <ListItem 
                  key={fileData.id}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => removeFile(fileData.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {fileData.status === 'success' ? (
                      <CheckIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={fileData.file.name}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption">
                          {(fileData.file.size / 1024).toFixed(1)} KB
                        </Typography>
                        {fileData.result?.aiAnalysis?.results?.productExtraction?.success && (
                          <Chip 
                            label={`${fileData.result.aiAnalysis.results.productExtraction.products.length} ürün tespit edildi`}
                            size="small"
                            color="success"
                            icon={<AIIcon />}
                          />
                        )}
                        {/* Show AI confidence if available */}
                        {(() => {
                          const meta = fileData.result?.aiAnalysis?.results?.productExtraction?.meta;
                          const conf = meta?.confidence ?? meta?.avgConfidence;
                          if (typeof conf === 'number') {
                            return <Chip label={`Güven: ${(conf*100).toFixed(0)}%`} size="small" />
                          }
                          return null;
                        })()}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
