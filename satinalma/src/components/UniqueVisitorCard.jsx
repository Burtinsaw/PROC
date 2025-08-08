import { useState } from 'react';
import { Box, Button, ButtonGroup, Grid, Stack, Typography } from '@mui/material';
import MainCard from './MainCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Jan', pageViews: 85, sessions: 70 },
  { name: 'Feb', pageViews: 60, sessions: 55 },
  { name: 'Mar', pageViews: 150, sessions: 100 },
  { name: 'Apr', pageViews: 35, sessions: 30 },
  { name: 'May', pageViews: 60, sessions: 45 },
  { name: 'Jun', pageViews: 100, sessions: 80 },
  { name: 'Jul', pageViews: 25, sessions: 20 },
  { name: 'Aug', pageViews: 115, sessions: 90 },
  { name: 'Sep', pageViews: 85, sessions: 65 },
  { name: 'Oct', pageViews: 110, sessions: 85 },
  { name: 'Nov', pageViews: 40, sessions: 30 },
  { name: 'Dec', pageViews: 150, sessions: 120 }
];

const UniqueVisitorCard = () => {
  const [slot, setSlot] = useState('Month');

  return (
    <>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid>
          <Typography variant="h5" sx={{ 
            fontSize: '1.25rem',
            fontWeight: 600
          }}>
            Unique Visitor
          </Typography>
        </Grid>
        <Grid>
          <ButtonGroup variant="outlined" aria-label="period selection">
            <Button 
              onClick={() => setSlot('Month')} 
              variant={slot === 'Month' ? 'contained' : 'outlined'}
            >
              Month
            </Button>
            <Button 
              onClick={() => setSlot('Week')} 
              variant={slot === 'Week' ? 'contained' : 'outlined'}
            >
              Week
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <MainCard content={false} sx={{ mt: 1.5 }}>
        <Box sx={{ pt: 1, pr: 2 }}>
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14 }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'pageViews' ? 'Page views' : 'Sessions']}
                  labelStyle={{ color: '#666' }}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="pageViews" 
                  stackId="1"
                  stroke="#2196f3" 
                  fill="#2196f3"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stackId="1"
                  stroke="#1976d2" 
                  fill="#1976d2"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </MainCard>
    </>
  );
};

export default UniqueVisitorCard;
