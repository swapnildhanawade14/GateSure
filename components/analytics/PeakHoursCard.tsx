'use client';

import React from 'react';

interface PeakHour {
  hour: string;
  count: number;
}

interface PeakHoursCardProps {
  peakHours: PeakHour[];
}

export default function PeakHoursCard({ peakHours }: PeakHoursCardProps) {
  return (
    <div className="mt-6 rounded-lg border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-6">
      <h3 className="mb-4 text-lg font-bold text-slate-900">⏰ Peak Entry Hours</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {peakHours.map((peak, index) => (
          <div key={`${peak.hour}-${index}`} className="rounded-lg border-l-4 border-red-500 bg-white p-4">
            <p className="mb-1 text-sm text-slate-600">Hour #{index + 1}</p>
            <p className="text-2xl font-bold text-slate-900">{peak.hour}</p>
            <p className="mt-1 text-sm font-semibold text-red-600">{peak.count} entries</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-600">
        💡 <strong>Insight:</strong> Plan extra security coverage during peak hours. These are the busiest times for entries.
      </p>
    </div>
  );
}
