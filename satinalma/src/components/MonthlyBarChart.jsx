import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mo', value: 80 },
  { name: 'Tu', value: 120 },
  { name: 'We', value: 95 },
  { name: 'Th', value: 70 },
  { name: 'Fr', value: 110 },
  { name: 'Sa', value: 85 },
  { name: 'Su', value: 140 }
];

const MonthlyBarChart = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 14 }}
        />
        <YAxis hide />
        <Bar 
          dataKey="value" 
          fill="#4fc3f7"
          radius={[4, 4, 0, 0]}
          maxBarSize={35}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyBarChart;
