'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import PersonForm from '@/components/PersonForm';
import { getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, subscribeToSocietyContext } from '@/lib/society';

export default function RegisterResidentPage() {
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );
  const isAuthorized = Boolean(societyId);

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <p className="mx-auto max-w-4xl rounded-xl bg-white p-6 text-slate-600">
          Select a society before registering a resident.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Resident access</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Register Resident & Family</h1>
          <p className="mt-2 text-slate-600">Add residents, family members, maids, daily workers, and other household staff to your flat</p>
        </div>

        {societyId && <PersonForm category="resident" societyId={societyId} />}
      </div>
    </main>
  );
}
