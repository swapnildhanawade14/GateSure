'use client';

import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { getAdminSession } from '@/lib/admin';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, subscribeToSocietyContext } from '@/lib/society';

export default function AnalyticsPage() {
  const router = useRouter();
  const [backHref] = useState(() => getAdminSession() ? '/admin/dashboard' : '/dashboard');
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push(backHref || '/dashboard')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ← Back
          </button>
          <div className="w-20" aria-hidden="true" />
        </div>
        {societyId && <AnalyticsDashboard societyId={societyId} />}
      </div>
    </main>
  );
}
