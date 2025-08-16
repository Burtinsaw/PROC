import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip } from 'recharts';

const CategoryDistributionPie = ({ data, reduceMotion = false, height = 220 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          isAnimationActive={!reduceMotion}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ReTooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryDistributionPie;
