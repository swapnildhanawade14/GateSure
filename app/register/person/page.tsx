'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import PersonForm from '@/components/PersonForm';
import { getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, subscribeToSocietyContext } from '@/lib/society';

export default function RegisterPersonPage() {
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );

  if (!societyId) return null;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-2">
          <Link href="/register" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            ← Back
          </Link>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Resident access</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Create resident and family profiles</h1>
          </div>
          <div className="w-24" aria-hidden="true" />
        </div>
        <PersonForm category="resident" societyId={societyId} />
      </div>
    </main>
  );
}
