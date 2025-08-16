import React from 'react';
import { useTheme } from '@mui/material/styles';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Area } from 'recharts';

const MonthlyTrendsChart = ({ data, reduceMotion = false }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;
  const neutralGrid = theme.palette.mode==='dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const axisColor = theme.palette.text.secondary;
  const soft = (c)=> theme.palette.mode==='dark'? `${c}33` : `${c}22`;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={neutralGrid} />
        <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
        <YAxis stroke={axisColor} fontSize={12} />
        <ReTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '12px',
            boxShadow: theme.palette.mode==='dark'? '0 4px 18px -4px rgba(0,0,0,0.6)': '0 6px 20px -4px rgba(0,0,0,0.12)'
          }}
        />
        <Area isAnimationActive={!reduceMotion} type="monotone" dataKey="talepler" stroke={primary} fill={soft(primary)} strokeWidth={2.4} name="Toplam Talepler" />
        <Area isAnimationActive={!reduceMotion} type="monotone" dataKey="tamamlanan" stroke={success} fill={soft(success)} strokeWidth={2.4} name="Tamamlanan" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MonthlyTrendsChart;
