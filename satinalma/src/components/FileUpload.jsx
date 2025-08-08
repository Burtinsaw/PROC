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
import {
  CloudUpload as UploadIcon,
  AttachFile as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  SmartToy as AIIcon
} from '@mui/icons-material';

const FileUpload = ({ 
  onFilesProcessed, 
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

    // Simüle edilmiş dosya işleme
    const processFiles = async () => {
      const processedFiles = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProgress(((i + 1) / selectedFiles.length) * 100);

        // Simüle edilmiş AI işleme
        const fileData = {
          id: Date.now() + i,
          file: file,
          status: 'success',
          result: enableAI ? {
            aiAnalysis: {
              results: {
                productExtraction: {
                  success: true,
                  products: [
                    {
                      name: `Ürün ${i + 1} - ${file.name}`,
                      description: `${file.name} dosyasından çıkarılan örnek ürün`,
                      quantity: Math.floor(Math.random() * 10) + 1,
                      unit: 'adet',
                      category: 'Genel',
                      estimatedPrice: (Math.random() * 1000).toFixed(2)
                    }
                  ]
                }
              }
            }
          } : null
        };

        processedFiles.push(fileData);
        
        // Simüle edilmiş gecikme
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setFiles(prev => [...prev, ...processedFiles]);
      setUploading(false);
      setProgress(0);

      // Parent component'e bildir
      if (onFilesProcessed) {
        onFilesProcessed(processedFiles);
      }
    };

    processFiles();
  }, [multiple, maxFiles, enableAI, onFilesProcessed]);

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
