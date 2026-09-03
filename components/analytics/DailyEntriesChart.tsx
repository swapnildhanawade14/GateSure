'use client';

import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DailyEntry {
  date: string;
  count: number;
}

interface DailyEntriesChartProps {
  data: DailyEntry[];
}

export default function DailyEntriesChart({ data }: DailyEntriesChartProps) {
  const chartData = data.map((entry) => ({
    ...entry,
    label: new Date(entry.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value} entries`, 'Entries']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#06b6d4"
          dot={{ fill: '#06b6d4', r: 4 }}
          activeDot={{ r: 6 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
