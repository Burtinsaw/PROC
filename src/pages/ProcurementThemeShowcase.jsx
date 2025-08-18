// Procurement Theme Demo Page
// Modern yeşil-turuncu temizlik procurement arayüzü

import React from 'react';
import { Box, Typography, Button, Stack, Chip, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContentContainer from '../components/layout/ContentContainer';
import { useAppTheme } from '../contexts/useAppTheme';

// Procurement components
import { 
  ProcurementMetricCard, 
  ProcurementPageHeader,
  ProcurementSectionCard,
  ProcurementFilterBar,
  ProcurementStatusChip
} from '../components/procurement/ProcurementComponents';

const ProcurementThemeShowcase = () => {
  const { preset, setPreset } = useAppTheme();
  const navigate = useNavigate();

  const handleThemeSwitch = () => {
    if (preset === 'procurement') {
      setPreset('aurora'); // Geri Aurora'ya dön
    } else {
      setPreset('procurement'); // Procurement'a geç
    }
  };

  const mockMetrics = [
    { title: 'Total Procurement Value', value: '€2.4M', trend: 'up', trendValue: '+18%', status: 'success' },
    { title: 'Active Suppliers', value: '156', trend: 'up', trendValue: '+12', status: 'success' },
    { title: 'Pending Approvals', value: '8', trend: 'down', trendValue: '-3', status: 'warning' },
    { title: 'Cost Savings', value: '€340K', trend: 'up', trendValue: '+24%', status: 'success' },
    { title: 'Avg Response Time', value: '2.1 days', trend: 'down', trendValue: '-15%', status: 'success' },
    { title: 'Contract Compliance', value: '94.8%', trend: 'up', trendValue: '+2.1%', status: 'success' }
  ];

  return (
    <ContentContainer>
      <ProcurementPageHeader
        title="Procurement Theme Showcase"
        subtitle="Modern yeşil-turuncu tonlarında procurement odaklı arayüz sistemi"
        actions={[
          <Button 
            key="switch" 
            variant={preset === 'procurement' ? 'outlined' : 'contained'}
            onClick={handleThemeSwitch}
            size="small"
          >
            {preset === 'procurement' ? 'Aurora Theme\'e Geç' : 'Procurement Theme\'i Aktifleştir'}
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
        <Alert severity={preset === 'procurement' ? 'success' : 'info'} variant="outlined">
          <Typography variant="body2">
            <strong>Aktif Tema:</strong> <Chip label={preset} color="primary" size="small" sx={{ ml: 1 }} />
            {preset === 'procurement' 
              ? ' • Modern procurement arayüzü aktif!' 
              : ' • Procurement theme\'i görmek için yukarıdaki butona tıklayın.'
            }
          </Typography>
        </Alert>

        {/* Theme Features */}
        <ProcurementSectionCard title="🎨 Procurement Theme Özellikleri">
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                🌿 Modern Renk Paleti
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Primary:</strong> Emerald Green (#10b981)<br/>
                • <strong>Secondary:</strong> Amber Orange (#f59e0b)<br/>
                • <strong>Accent:</strong> Modern Blue (#3b82f6)<br/>
                • <strong>Status:</strong> Semantic color system
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'secondary.main' }}>
                ✨ Premium Typography
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Font:</strong> Poppins (modern & clean)<br/>
                • <strong>Hierarchy:</strong> Clear visual hierarchy<br/>
                • <strong>Spacing:</strong> Optimized line height<br/>
                • <strong>Weight:</strong> Strategic font weights
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                🚀 Component Design
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Cards:</strong> Elevated with hover effects<br/>
                • <strong>Status:</strong> Color-coded status chips<br/>
                • <strong>Filters:</strong> Advanced filter components<br/>
                • <strong>Responsive:</strong> Mobile-first design
              </Typography>
            </Box>
          </Box>
        </ProcurementSectionCard>

        {/* Sample Metrics */}
        <ProcurementSectionCard title="📊 Key Performance Indicators" subtitle="Real-time procurement metrics">
          <Box sx={{ 
            display: 'grid', 
            gap: 2, 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            mt: 2
          }}>
            {mockMetrics.map((metric, index) => (
              <ProcurementMetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                subtitle="Last 30 days"
                trend={metric.trend}
                trendValue={metric.trendValue}
                status={metric.status}
                dense
              />
            ))}
          </Box>
        </ProcurementSectionCard>

        {/* Status Chips Demo */}
        <ProcurementSectionCard title="🏷️ Status Components" subtitle="Color-coded status indicators">
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <ProcurementStatusChip status="approved" label="Approved" />
            <ProcurementStatusChip status="pending" label="Pending Review" />
            <ProcurementStatusChip status="rejected" label="Rejected" />
            <ProcurementStatusChip status="draft" label="Draft" />
            <ProcurementStatusChip status="active" label="Active Contract" />
            <ProcurementStatusChip status="shipped" label="Shipped" />
          </Box>
        </ProcurementSectionCard>

        {/* Filter Bar Demo */}
        <ProcurementSectionCard title="🔍 Advanced Filter System" subtitle="Comprehensive procurement data filtering">
          <Box sx={{ mt: 2 }}>
            <ProcurementFilterBar
              onSearch={(value) => console.log('Search:', value)}
              onFilter={(type, value) => console.log('Filter:', type, value)}
              onExport={() => console.log('Export data')}
              dense
            />
          </Box>
        </ProcurementSectionCard>

        {/* Color Palette */}
        <ProcurementSectionCard title="🎨 Color Palette" subtitle="Modern procurement color system">
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', mt: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: '100%', 
                height: 60, 
                backgroundColor: '#10b981', 
                borderRadius: 1, 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600
              }}>
                Primary
              </Box>
              <Typography variant="caption">#10b981 • Emerald</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: '100%', 
                height: 60, 
                backgroundColor: '#f59e0b', 
                borderRadius: 1, 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600
              }}>
                Secondary
              </Box>
              <Typography variant="caption">#f59e0b • Amber</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: '100%', 
                height: 60, 
                backgroundColor: '#3b82f6', 
                borderRadius: 1, 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600
              }}>
                Accent
              </Box>
              <Typography variant="caption">#3b82f6 • Blue</Typography>
            </Box>
          </Box>
        </ProcurementSectionCard>

        {/* Usage Info */}
        <ProcurementSectionCard title="🔧 Usage Guide" subtitle="How to implement procurement theme">
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>1. Theme Activation:</strong> Go to Settings → Design Style → Select "Procurement"
            </Typography>
            <Typography variant="body2">
              <strong>2. Component Usage:</strong> Import procurement components from `components/procurement/`
            </Typography>
            <Typography variant="body2">
              <strong>3. Global Toggle:</strong> Theme automatically applies across all pages
            </Typography>
            <Typography variant="body2">
              <strong>4. Customization:</strong> Modify `procurementTheme.js` for custom colors
            </Typography>
          </Stack>
        </ProcurementSectionCard>
      </Stack>
    </ContentContainer>
  );
};

export default ProcurementThemeShowcase;
