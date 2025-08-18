// Business Layout Demo
// Full business theme showcase with complete ERP-style layout

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Tabs, 
  Tab,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import { useAppTheme } from '../contexts/useAppTheme';

// Business components
import { 
  BusinessMetricCard, 
  BusinessPageHeader,
  BusinessSectionCard,
  BusinessFormComponents,
  BusinessNavigationDockBar
} from '../components/business/BusinessLayoutComponents';
import BusinessDataTable from '../components/business/BusinessDataTable';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`business-tabpanel-${index}`}
    aria-labelledby={`business-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export const BusinessLayoutDemo = () => {
  const { setPreset } = useAppTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleThemeSwitch = () => {
    setPreset('aurora'); // Geri Aurora'ya dön
  };

  const mockData = {
    kpis: [
      { title: 'Total RFQs', value: '247', subtitle: 'This Quarter', trend: 'up', trendValue: '+23%', status: 'success' },
      { title: 'Pending Approval', value: '18', subtitle: 'Requires Action', trend: 'stable', trendValue: '0', status: 'warning' },
      { title: 'Active Suppliers', value: '342', subtitle: 'Verified', trend: 'up', trendValue: '+15', status: 'info' },
      { title: 'Cost Savings', value: '€156K', subtitle: 'YTD', trend: 'up', trendValue: '+8.2%', status: 'success' },
      { title: 'Avg. Response Time', value: '2.3 days', subtitle: 'Last 30 days', trend: 'down', trendValue: '-12%', status: 'success' },
      { title: 'Contract Compliance', value: '94.2%', subtitle: 'Current', trend: 'up', trendValue: '+1.8%', status: 'success' }
    ]
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      {/* Business Header with Navigation */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        px: 3,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Enterprise Procurement Suite
          </Typography>
          <Chip 
            label="Business Theme" 
            color="secondary" 
            size="small"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'inherit',
              fontWeight: 500
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" size="small">
            <NotificationsIcon />
          </IconButton>
          <Button 
            color="inherit" 
            onClick={handleThemeSwitch}
            size="small"
            variant="outlined"
            sx={{ 
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': { 
                borderColor: 'rgba(255,255,255,0.7)',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Deactivate Business Theme
          </Button>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        px: 3
      }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<AssignmentIcon />} label="RFQ Management" />
          <Tab icon={<BusinessIcon />} label="Supplier Portal" />
          <Tab icon={<AssessmentIcon />} label="Analytics" />
          <Tab icon={<SettingsIcon />} label="Configuration" />
        </Tabs>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Dashboard Tab */}
        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            {/* Alert */}
            <Alert severity="info" variant="outlined">
              <strong>Business Theme aktif:</strong> Enterprise ERP tarzı arayüz gösterilmektedir. 
              SAP Fiori ve Oracle Fusion'dan ilham alınmıştır.
            </Alert>

            {/* KPI Metrics Grid */}
            <BusinessSectionCard title="Key Performance Indicators" subtitle="Real-time procurement metrics">
              <Box sx={{ 
                display: 'grid', 
                gap: 2, 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                mt: 2
              }}>
                {mockData.kpis.map((kpi, index) => (
                  <BusinessMetricCard
                    key={index}
                    title={kpi.title}
                    value={kpi.value}
                    subtitle={kpi.subtitle}
                    trend={kpi.trend}
                    trendValue={kpi.trendValue}
                    status={kpi.status}
                    dense
                  />
                ))}
              </Box>
            </BusinessSectionCard>

            {/* Recent Activity Table */}
            <BusinessSectionCard title="Recent RFQ Activity" subtitle="Latest procurement requests">
              <Box sx={{ mt: 2 }}>
                <BusinessDataTable
                  title="Active Requests"
                  dense
                  onRowClick={(row) => console.log('Row clicked:', row)}
                  onEdit={(row) => console.log('Edit:', row)}
                  onDelete={(row) => console.log('Delete:', row)}
                  onView={(row) => console.log('View:', row)}
                />
              </Box>
            </BusinessSectionCard>
          </Stack>
        </TabPanel>

        {/* RFQ Management Tab */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            <BusinessPageHeader
              title="RFQ Management"
              subtitle="Request for Quotation lifecycle management"
              actions={[
                <Button key="new" variant="contained" size="small">
                  New RFQ
                </Button>,
                <Button key="import" variant="outlined" size="small">
                  Import Data
                </Button>
              ]}
              dense
            />
            
            <BusinessSectionCard title="RFQ Processing Pipeline">
              <BusinessFormComponents />
            </BusinessSectionCard>

            <BusinessSectionCard title="All RFQ Records">
              <BusinessDataTable
                title="Complete RFQ Database"
                dense
                onRowClick={(row) => console.log('View RFQ:', row)}
                onEdit={(row) => console.log('Edit RFQ:', row)}
                onDelete={(row) => console.log('Delete RFQ:', row)}
                onView={(row) => console.log('View Details:', row)}
              />
            </BusinessSectionCard>
          </Stack>
        </TabPanel>

        {/* Supplier Portal Tab */}
        <TabPanel value={activeTab} index={2}>
          <Stack spacing={3}>
            <BusinessPageHeader
              title="Supplier Portal"
              subtitle="Vendor management and relationship tracking"
              dense
            />
            
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
              <BusinessSectionCard title="Supplier Categories">
                <Typography variant="body2" color="text.secondary">
                  Manage vendor classifications and categories
                </Typography>
              </BusinessSectionCard>
              
              <BusinessSectionCard title="Performance Metrics">
                <Typography variant="body2" color="text.secondary">
                  Track supplier delivery and quality KPIs
                </Typography>
              </BusinessSectionCard>
              
              <BusinessSectionCard title="Contract Management">
                <Typography variant="body2" color="text.secondary">
                  Monitor contract terms and compliance
                </Typography>
              </BusinessSectionCard>
            </Box>
          </Stack>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={3}>
          <Stack spacing={3}>
            <BusinessPageHeader
              title="Analytics & Reporting"
              subtitle="Procurement intelligence and insights"
              dense
            />
            
            <BusinessSectionCard title="Executive Dashboard">
              <Typography variant="body2" color="text.secondary">
                High-level procurement analytics and trends
              </Typography>
            </BusinessSectionCard>
          </Stack>
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel value={activeTab} index={4}>
          <Stack spacing={3}>
            <BusinessPageHeader
              title="System Configuration"
              subtitle="Procurement system settings and preferences"
              dense
            />
            
            <BusinessSectionCard title="Theme Settings">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2">
                  Business theme'den çıkmak için:
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={handleThemeSwitch}
                  size="small"
                >
                  Aurora Theme'e Geç
                </Button>
              </Box>
            </BusinessSectionCard>
          </Stack>
        </TabPanel>
      </Box>

      {/* Business Navigation Dock */}
      <BusinessNavigationDockBar />
    </Box>
  );
};
