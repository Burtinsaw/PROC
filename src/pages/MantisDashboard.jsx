import { Box, Grid, Typography, Stack, Button, List, ListItem, ListItemAvatar, ListItemText, Avatar, AvatarGroup } from '@mui/material';
import MainCard from '../components/MainCard';
import AnalyticEcommerce from '../components/AnalyticEcommerce';
import { lazy, Suspense } from 'react';
const UniqueVisitorCard = lazy(() => import('../components/UniqueVisitorCard'));
const MonthlyBarChart = lazy(() => import('../components/MonthlyBarChart'));
import { Gift, MessageSquare, Settings } from 'lucide-react';
import { UniversalPageHeader } from '../components/universal';

const MantisDashboard = () => {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Page Title */}
      <Grid size={12}>
        <UniversalPageHeader title="Dashboard" />
      </Grid>

      {/* Statistics Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total Page Views" 
          count="4,42,236" 
          percentage={59.3} 
          extra="35,000" 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total Users" 
          count="78,250" 
          percentage={70.5} 
          extra="8,900" 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total Order" 
          count="18,800" 
          percentage={27.4} 
          isLoss 
          color="warning" 
          extra="1,943" 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total Sales" 
          count="35,078" 
          percentage={27.4} 
          isLoss 
          color="warning" 
          extra="20,395" 
        />
      </Grid>

      {/* Unique Visitor Chart */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Suspense fallback={null}>
          <UniqueVisitorCard />
        </Suspense>
      </Grid>

      {/* Income Overview */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5" sx={{ 
              fontSize: '1.25rem',
              fontWeight: 600
            }}>
              Income Overview
            </Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack spacing={2}>
              <Typography variant="h6" color="text.secondary" sx={{ 
                fontSize: '1rem',
                fontWeight: 500
              }}>
                This Week Statistics
              </Typography>
              <Typography variant="h3" sx={{ 
                fontSize: '1.75rem',
                fontWeight: 700
              }}>
                $7,650
              </Typography>
            </Stack>
          </Box>
          <Suspense fallback={null}>
            <MonthlyBarChart />
          </Suspense>
        </MainCard>
      </Grid>

      {/* Recent Orders */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5" sx={{ 
              fontSize: '1.25rem',
              fontWeight: 600
            }}>
              Recent Orders
            </Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 1.75 }} content={false}>
          <Box sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Latest orders and transactions
            </Typography>
          </Box>
        </MainCard>
      </Grid>

      {/* Analytics Report */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5" sx={{ 
              fontSize: '1.25rem',
              fontWeight: 600
            }}>
              Analytics Report
            </Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 1.75 }}>
          <List sx={{ py: 0 }}>
            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
              <ListItemAvatar>
                <Avatar 
                  sx={{ 
                    color: 'error.main', 
                    bgcolor: 'error.lighter',
                    width: 36,
                    height: 36 
                  }}
                >
                  <Gift size={18} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Company Finance Growth"
                secondary={
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    10 minutes ago
                  </Typography>
                }
              />
            </ListItem>
            
            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
              <ListItemAvatar>
                <Avatar 
                  sx={{ 
                    color: 'primary.main', 
                    bgcolor: 'primary.lighter',
                    width: 36,
                    height: 36 
                  }}
                >
                  <MessageSquare size={18} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Received New Messages"
                secondary={
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    2 hours ago
                  </Typography>
                }
              />
            </ListItem>
            
            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
              <ListItemAvatar>
                <Avatar 
                  sx={{ 
                    color: 'secondary.main', 
                    bgcolor: 'secondary.lighter',
                    width: 36,
                    height: 36 
                  }}
                >
                  <Settings size={18} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Project has been approved"
                secondary={
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    1 day ago
                  </Typography>
                }
              />
            </ListItem>
          </List>
          
          <Grid container>
            <Grid size={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                  <Avatar sx={{ bgcolor: 'error.main' }}>H</Avatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>U</Avatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>J</Avatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>+</Avatar>
                </AvatarGroup>
              </Box>
            </Grid>
            <Grid size={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" size="small">
                  Monthly
                </Button>
              </Box>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default MantisDashboard;
