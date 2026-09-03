'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getAdminSession, logoutAdmin } from '@/lib/admin';
import { registerSociety } from '@/lib/society';

export default function AdminSetupPage() {
  const router = useRouter();
  const [societyName, setSocietyName] = useState('');
  const [societyCode, setSocietyCode] = useState('');
  const [societyAddress, setSocietyAddress] = useState('');
  const [message, setMessage] = useState('');

  if (typeof window !== 'undefined' && !getAdminSession()) {
    router.replace('/admin');
    return null;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await registerSociety({
        name: societyName,
        code: societyCode,
        address: societyAddress,
      });
      setMessage('Society has been set up successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create society.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin');
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ← Back to admin dashboard
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Admin Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Society Setup</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="setup-society-name" className="mb-2 block text-sm font-medium text-slate-700">
              Society name
            </label>
            <input
              id="setup-society-name"
              type="text"
              value={societyName}
              onChange={(event) => setSocietyName(event.target.value)}
              placeholder="Enter society name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label htmlFor="setup-society-code" className="mb-2 block text-sm font-medium text-slate-700">
              Society code
            </label>
            <input
              id="setup-society-code"
              type="text"
              value={societyCode}
              onChange={(event) => setSocietyCode(event.target.value)}
              placeholder="Create society code"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label htmlFor="setup-society-address" className="mb-2 block text-sm font-medium text-slate-700">
              Society address
            </label>
            <input
              id="setup-society-address"
              type="text"
              value={societyAddress}
              onChange={(event) => setSocietyAddress(event.target.value)}
              placeholder="Enter society address"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          {message && (
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Create Society
          </button>
        </form>
      </div>
    </main>
  );
}
