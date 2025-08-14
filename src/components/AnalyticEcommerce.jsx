import { Chip, Grid, Stack, Typography, Box } from '@mui/material';
import MainCard from './MainCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AnalyticEcommerce = ({ 
  title, 
  count, 
  percentage, 
  isLoss = false, 
  color = 'primary', 
  extra 
}) => {
  return (
    <MainCard contentSX={{ p: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h6" color="text.secondary" sx={{ 
          fontSize: '1rem',
          fontWeight: 500
        }}>
          {title}
        </Typography>
        <Grid container alignItems="center">
          <Grid>
            <Typography variant="h3" color="inherit" sx={{ 
              fontSize: '2rem',
              fontWeight: 700
            }}>
              {count}
            </Typography>
          </Grid>
          {percentage && (
            <Grid>
              <Chip
                variant="combined"
                color={color}
                icon={
                  isLoss ? (
                    <TrendingDown style={{ fontSize: '0.9rem', color: 'inherit' }} />
                  ) : (
                    <TrendingUp style={{ fontSize: '0.9rem', color: 'inherit' }} />
                  )
                }
                label={`${percentage}%`}
                sx={{ 
                  ml: 1.5, 
                  pl: 1,
                  height: 28,
                  '& .MuiChip-label': {
                    fontSize: '0.825rem',
                    fontWeight: 600
                  }
                }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
      <Box sx={{ pt: 2.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ 
          fontSize: '0.875rem'
        }}>
          You made an extra{' '}
          <Typography 
            component="span"
            variant="body2" 
            sx={{ 
              color: (theme) => theme.palette[color]?.main || theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {extra}
          </Typography>{' '}
          this year
        </Typography>
      </Box>
    </MainCard>
  );
};

export default AnalyticEcommerce;
