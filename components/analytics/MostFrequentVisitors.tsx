'use client';

import React from 'react';

interface Visitor {
  personId: string;
  personName: string;
  personCategory: string;
  visitCount: number;
}

interface MostFrequentVisitorsProps {
  visitors: Visitor[];
}

const categoryIcons: Record<string, string> = {
  resident: '🏠',
  'daily-labor': '👷',
  'service-worker': '🔧',
  vendor: '📦',
  guest: '👥',
};

export default function MostFrequentVisitors({ visitors }: MostFrequentVisitorsProps) {
  if (visitors.length === 0) {
    return <p className="py-8 text-center text-slate-500">No visitor data available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Category</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Visits</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Avg per Day</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor, index) => (
            <tr key={visitor.personId} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">#{index + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{categoryIcons[visitor.personCategory] ?? '👤'}</span>
                  <span className="font-medium text-slate-900">{visitor.personName}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  {visitor.personCategory
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900">{visitor.visitCount}</td>
              <td className="px-4 py-3 text-right text-slate-600">{(visitor.visitCount / 7).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
