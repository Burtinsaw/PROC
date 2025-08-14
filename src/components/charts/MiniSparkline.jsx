import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

/*
  MiniSparkline: Küçük trend grafiği (StatCard içinde kullanılmak üzere)
  Props:
    - data: number[] | { value:number }[]
    - height: default 34
    - positiveColor / negativeColor override opsiyonel
*/
export default function MiniSparkline({ data = [], height = 34, positiveColor, negativeColor }) {
  const theme = useTheme();
  const list = useMemo(() => data.map(d => (typeof d === 'number' ? { value: d } : d)), [data]);
  const delta = list.length > 1 ? (list[list.length - 1].value - list[0].value) : 0;
  const positive = delta >= 0;
  const accent = positive
    ? (positiveColor || theme.palette.success.main)
    : (negativeColor || theme.palette.error.main);
  const accentSoft = positive
    ? theme.palette.success.light || 'rgba(16,185,129,0.35)'
    : theme.palette.error.light || 'rgba(239,68,68,0.4)';
  const gradientId = useMemo(() => `spark-grad-${Math.random().toString(36).slice(2)}` , []);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={list} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={accent} stopOpacity={0.55} />
            <stop offset="85%" stopColor={accentSoft} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
            stroke={accent}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive
            animationDuration={420}
            animationEasing="ease-out"
            dot={false}
            activeDot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
