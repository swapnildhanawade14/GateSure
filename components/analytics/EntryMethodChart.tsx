'use client';

import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface EntryMethodStats {
  method: string;
  count: number;
  percentage: number;
}

interface EntryMethodChartProps {
  data: EntryMethodStats[];
}

const COLORS = {
  Face: '#10b981',
  Manual: '#f59e0b',
  QR: '#3b82f6',
};

export default function EntryMethodChart({ data }: EntryMethodChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.method as keyof typeof COLORS] ?? '#6b7280'}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} entries`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
