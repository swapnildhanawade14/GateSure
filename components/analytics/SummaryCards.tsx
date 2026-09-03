'use client';

import type React from 'react';

interface SummaryStats {
  totalEntries: number;
  uniqueVisitors: number;
  averageEntriesPerDay: number;
  averageEntriesPerHour: number;
  timeGuardSavedHours: number;
  mostCommonCategory: string;
}

interface SummaryCardsProps {
  stats: SummaryStats;
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    {
      icon: '🚪',
      label: 'Total Entries',
      value: stats.totalEntries.toLocaleString(),
      detail: '100% verified & logged',
      color: 'border-blue-200 bg-blue-50',
    },
    {
      icon: '👥',
      label: 'Unique Visitors',
      value: stats.uniqueVisitors.toLocaleString(),
      detail: `${((stats.uniqueVisitors / Math.max(stats.totalEntries, 1)) * 100).toFixed(1)}% repeat visitors`,
      color: 'border-green-200 bg-green-50',
    },
    {
      icon: '📊',
      label: 'Avg per Day',
      value: stats.averageEntriesPerDay.toString(),
      detail: `~${stats.averageEntriesPerHour} per hour`,
      color: 'border-purple-200 bg-purple-50',
    },
    {
      icon: '⏱️',
      label: 'Guard Time Saved',
      value: `${stats.timeGuardSavedHours.toString()}h`,
      detail: `${(stats.timeGuardSavedHours * 60).toFixed(0)} minutes saved`,
      color: 'border-orange-200 bg-orange-50',
    },
    {
      icon: '🏷️',
      label: 'Top Category',
      value: stats.mostCommonCategory
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      detail: 'Most common visitor type',
      color: 'border-pink-200 bg-pink-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => (
        <div key={`${card.label}-${index}`} className={`rounded-lg border-2 p-4 ${card.color}`}>
          <div className="mb-2 text-3xl">{card.icon}</div>
          <p className="text-xs uppercase tracking-wide text-slate-600">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
          <p className="mt-2 text-xs text-slate-500">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}
