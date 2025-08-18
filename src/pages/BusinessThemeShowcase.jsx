// Business Theme Demo Page
// Tam entegrasyon gösterisi için özel sayfa

import React from 'react';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContentContainer from '../components/layout/ContentContainer';
import { useAppTheme } from '../contexts/useAppTheme';

// Business components
import { BusinessLayoutDemo } from '../components/BusinessFullLayoutDemo';
import { 
  BusinessMetricCard, 
  BusinessPageHeader,
  BusinessSectionCard 
} from '../components/business/BusinessLayoutComponents';
import BusinessDataTable from '../components/business/BusinessDataTable';

const BusinessThemeShowcase = () => {
  const { preset, setPreset } = useAppTheme();
  const navigate = useNavigate();

  const handleThemeSwitch = () => {
    if (preset === 'business') {
      setPreset('aurora'); // Geri Aurora'ya dön
    } else {
      setPreset('business'); // Business'a geç
    }
  };

  if (preset === 'business') {
    // Full business layout demo
    return <BusinessLayoutDemo />;
  }

  // Aurora preset'te business preview
  return (
    <ContentContainer>
      <BusinessPageHeader
        title="Business ERP Theme Demo"
        subtitle="Modern enterprise arayüz sistemi - SAP Fiori, Oracle Fusion tarzı"
        actions={[
          <Button 
            key="switch" 
            variant="contained" 
            onClick={handleThemeSwitch}
            size="small"
          >
            Business Theme'i Aktifleştir
          </Button>,
          <Button 
            key="back" 
            variant="outlined" 
            onClick={() => navigate('/dashboard')}
            size="small"
          >
            Ana Dashboard'a Dön
          </Button>
        ]}
        dense
      />

      <Stack spacing={3}>
        {/* Theme Info */}
        <BusinessSectionCard title="Tema Bilgisi">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2">
              Şu anda <Chip label={preset} color="primary" size="small" /> teması aktif.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Business theme'i aktifleştirmek için yukarıdaki butona tıklayın.
            </Typography>
          </Box>
        </BusinessSectionCard>

        {/* Sample Components Preview */}
        <BusinessSectionCard title="Business Component Önizlemesi">
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Aşağıda business theme'in component örnekleri gösterilmektedir:
            </Typography>
            
            {/* Sample Metrics */}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <BusinessMetricCard
                title="Toplam RFQ"
                value="47"
                subtitle="Bu ay"
                trend="up"
                trendValue="+12%"
                status="success"
                dense
              />
              <BusinessMetricCard
                title="Bekleyen Onay"
                value="8"
                subtitle="Acil"
                trend="down"
                trendValue="-3"
                status="warning"
                dense
              />
              <BusinessMetricCard
                title="Tedarikçiler"
                value="156"
                subtitle="Aktif"
                trend="up"
                trendValue="+8"
                status="info"
                dense
              />
            </Box>
          </Stack>
        </BusinessSectionCard>

        {/* Sample Data Table */}
        <BusinessSectionCard title="Veri Tablosu Örneği">
          <Box sx={{ mt: 2 }}>
            <BusinessDataTable
              title="Sample RFQ Listesi"
              dense
              onRowClick={(row) => console.log('Row clicked:', row)}
              onEdit={(row) => console.log('Edit:', row)}
              onDelete={(row) => console.log('Delete:', row)}
              onView={(row) => console.log('View:', row)}
            />
          </Box>
        </BusinessSectionCard>

        {/* Theme Features */}
        <BusinessSectionCard title="Business Theme Özellikleri">
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                🎨 Visual Design
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Corporate Blue renk paleti<br/>
                • Daha yoğun veri sunumu<br/>
                • Professional typography<br/>
                • Minimal shadows & borders
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                📊 Data Density
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Kompakt form kontrolleri<br/>
                • Dense table layouts<br/>
                • Smaller base font size<br/>
                • Optimized spacing (8px grid)
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                🚀 Enterprise Features
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Business navigation<br/>
                • Advanced data tables<br/>
                • Professional forms<br/>
                • ERP-style dashboard
              </Typography>
            </Box>
          </Box>
        </BusinessSectionCard>
      </Stack>
    </ContentContainer>
  );
};

export default BusinessThemeShowcase;
