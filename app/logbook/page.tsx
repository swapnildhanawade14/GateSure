'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { getAdminSession } from '@/lib/admin';
import { getPersonsBySociety, getRecentEntries } from '@/lib/database';
import { getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, subscribeToSocietyContext } from '@/lib/society';
import { toDate as firestoreToDate, type Entry, type Person } from '@/lib/types';

const exportCsv = (entries: Entry[]) => {
  const rows = [
    ['Name', 'Mobile', 'Category', 'Purpose', 'Flat', 'Company', 'Entry Time', 'Status'],
    ...entries.map((entry) => [
      entry.personName,
      entry.phone ?? '',
      entry.personCategory,
      entry.purpose ?? '',
      entry.associatedFlat ?? '',
      entry.company ?? '',
      firestoreToDate(entry.entryTime).toISOString(),
      entry.status,
    ]),
  ];

  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gatesure-logbook.csv';
  link.click();
  URL.revokeObjectURL(url);
};

export default function LogBookPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'resident' | 'vendor'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [backHref] = useState(() => getAdminSession() ? '/admin/dashboard' : '/dashboard');
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );

  useEffect(() => {
    async function load() {
      if (!societyId) return;
      const data = await getRecentEntries(societyId, 90 * 24);
      setEntries(data);
      setPersons(await getPersonsBySociety(societyId));
    }

    void load();
  }, [societyId]);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesType =
        selectedType === 'all' || entry.personCategory === selectedType || entry.personCategory === selectedType;
      const entryDate = firestoreToDate(entry.entryTime);
      const matchesDateFrom = !fromDate || entryDate >= new Date(`${fromDate}T00:00:00`);
      const matchesDateTo = !toDate || entryDate <= new Date(`${toDate}T23:59:59`);
      const matchesQuery =
        !query ||
        [
          entry.personName,
          entry.phone,
          entry.personCategory,
          entry.associatedFlat,
          entry.purpose,
          entry.company,
          entry.personId,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchesType && matchesDateFrom && matchesDateTo && matchesQuery;
    });
  }, [entries, fromDate, search, selectedType, toDate]);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => router.push(backHref || '/dashboard')}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Digital Log Book</h1>
            <div className="w-20" aria-hidden="true" />
          </div>
          <p className="mt-2 text-slate-600">
            Name, mobile number, purpose, flat, company, and entry details for all resident and vendor visits.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, flat, purpose, company, phone..."
              className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            />

            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value as 'all' | 'resident' | 'vendor')}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            >
              <option value="all">All visitors</option>
              <option value="resident">Residents</option>
              <option value="vendor">Vendors</option>
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            />

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => exportCsv(filteredEntries)}
              className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white transition hover:bg-slate-900"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Flat</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Entry Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No matching log entries found.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-200">
                      <td className="px-4 py-3">
                        {(entry.faceImage || persons.find((person) => person.id === entry.personId)?.faceImage) ? (
                          <img src={entry.faceImage || persons.find((person) => person.id === entry.personId)?.faceImage} alt={`${entry.personName} entry`} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">No photo</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{entry.personName}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.phone ?? 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.personCategory}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.purpose || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.associatedFlat || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.company || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {firestoreToDate(entry.entryTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
