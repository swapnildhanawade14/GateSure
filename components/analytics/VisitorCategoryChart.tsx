'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface VisitorCategory {
  category: string;
  count: number;
  percentage: number;
}

interface VisitorCategoryChartProps {
  data: VisitorCategory[];
}

export default function VisitorCategoryChart({ data }: VisitorCategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="category" type="category" width={120} />
        <Tooltip
          formatter={(value) => {
            if (typeof value === 'number') return [`${value} entries`, 'Count'];
            return value;
          }}
        />
        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
