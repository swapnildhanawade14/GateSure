'use client';

import Link from 'next/link';

export default function RegisterChoicePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link href="/" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            ← Back
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            GateSure Registration
          </p>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Choose registration type</h1>
        <p className="mt-3 text-slate-600">
          Residents can register themselves and family members, while vendors get a separate form and QR flow.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/register/person"
            className="rounded-2xl border border-blue-200 bg-blue-50 p-6 transition hover:bg-blue-100"
          >
            <div className="text-lg font-semibold text-blue-700">Resident Registration</div>
            <p className="mt-2 text-sm text-slate-600">
              For homeowners, family members, maids, daily workers, and household staff.
            </p>
          </Link>

          <Link
            href="/register/vendor"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-slate-100"
          >
            <div className="text-lg font-semibold text-slate-800">Vendor Registration</div>
            <p className="mt-2 text-sm text-slate-600">
              For delivery and service persons with company, purpose, and separate vendor QR code.
            </p>
          </Link>
        </div>

        <div className="mt-6">
          <Link
            href="/register/qr"
            className="inline-flex rounded-lg bg-slate-800 px-5 py-3 font-medium text-white transition hover:bg-slate-900"
          >
            View Resident & Vendor QR Codes
          </Link>
        </div>
      </div>
    </main>
  );
}
