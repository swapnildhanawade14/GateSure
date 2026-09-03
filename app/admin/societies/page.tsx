'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getAdminSession, logoutAdmin } from '@/lib/admin';
import { getSocietyById, readSocieties, type Society } from '@/lib/society';

export default function AdminSocietiesPage() {
  const router = useRouter();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [societyName, setSocietyName] = useState('');
  const [societyAddress, setSocietyAddress] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !getAdminSession()) {
      router.replace('/admin');
      return;
    }

    async function load() {
      const allSocieties = await readSocieties();
      setSocieties(allSocieties);
      if (allSocieties.length > 0) {
        setSelectedSocietyId(allSocieties[0].id);
        setSocietyName(allSocieties[0].name);
        setSocietyAddress(allSocieties[0].address);
      }
    }

    void load();
  }, [router]);

  useEffect(() => {
    async function loadSelected() {
      if (!selectedSocietyId) return;
      const society = await getSocietyById(selectedSocietyId);
      if (society) {
        setSocietyName(society.name);
        setSocietyAddress(society.address);
      }
    }

    void loadSelected();
  }, [selectedSocietyId, societies]);

  const selectedSocietyData = useMemo(
    () => societies.find((society) => society.id === selectedSocietyId) ?? null,
    [selectedSocietyId, societies]
  );

  const handleSave = async () => {
    if (!selectedSocietyId) return;

    const nextSociety = await getSocietyById(selectedSocietyId);
    if (!nextSociety) return;

    const localSocieties = societies.map((society) =>
      society.id === selectedSocietyId ? { ...society, name: societyName, address: societyAddress } : society
    );

    setSocieties(localSocieties);
    setEditing(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin');
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Admin Portal</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Onboarded Societies</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              ← Back to dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-200">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Society list</h2>
            <div className="space-y-3">
              {societies.length === 0 ? (
                <p className="text-sm text-slate-500">No societies onboarded yet.</p>
              ) : (
                societies.map((society) => (
                  <button
                    key={society.id}
                    type="button"
                    onClick={() => setSelectedSocietyId(society.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedSocietyId === society.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-base font-semibold text-slate-900">{society.name}</div>
                    <div className="mt-1 text-sm text-slate-600">{society.code}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-200">
            {selectedSocietyData ? (
              <>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Society profile</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedSocietyData.name}</h2>
                  </div>

                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Society name</label>
                    <input
                      type="text"
                      value={societyName}
                      onChange={(event) => setSocietyName(event.target.value)}
                      disabled={!editing}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Society code</label>
                    <input
                      type="text"
                      value={selectedSocietyData.code}
                      disabled
                      className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
                    <input
                      type="text"
                      value={societyAddress}
                      onChange={(event) => setSocietyAddress(event.target.value)}
                      disabled={!editing}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-600">Created</div>
                  <div className="mt-1 text-base font-medium text-slate-900">
                    {new Date(selectedSocietyData.createdAt).toLocaleString()}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500">Select a society to view details.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
