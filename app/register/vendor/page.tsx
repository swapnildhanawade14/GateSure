'use client';

import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import PersonForm from '@/components/PersonForm';
import { getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, subscribeToSocietyContext } from '@/lib/society';

export default function RegisterVendorPage() {
  const router = useRouter();
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );
  const isAuthorized = Boolean(societyId);

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <p className="mx-auto max-w-5xl rounded-xl bg-white p-6 text-slate-600">
          Select a society before registering a vendor.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ← Back to Dashboard
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Vendor access</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Create vendor profile</h1>
          </div>
          <div className="w-24" aria-hidden="true" />
        </div>
        {societyId && <PersonForm category="vendor" societyId={societyId} />}
      </div>
    </main>
  );
}
