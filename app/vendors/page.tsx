'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { getPersonsBySociety } from '@/lib/database';
import { getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, subscribeToSocietyContext } from '@/lib/society';
import { toDate, type Person } from '@/lib/types';

export default function VendorsDirectoryPage() {
  const [vendors, setVendors] = useState<Person[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );

  useEffect(() => {
    async function load() {
      if (!societyId) return;
      const data = await getPersonsBySociety(societyId);
      setVendors(data.filter((person) => person.category === 'vendor'));
    }

    void load();
  }, [societyId]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(vendors.map((vendor) => vendor.purpose || 'Other'))).sort()],
    [vendors]
  );
  const filteredVendors = selectedCategory === 'all'
    ? vendors
    : vendors.filter((vendor) => (vendor.purpose || 'Other') === selectedCategory);


  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              href={societyId ? `/dashboard?society_id=${encodeURIComponent(societyId)}` : '/dashboard'}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Vendor Directory</h1>
            <div className="w-20" aria-hidden="true" />
          </div>
          <p className="mt-2 text-slate-600">
            Reference database for plumbers, drivers, carpenters, delivery staff, and other recurring service vendors.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {category === 'all' ? 'All work categories' : category}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No vendor records yet.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b border-slate-200">
                      <td className="px-4 py-3">
                        {vendor.faceImage ? <img src={vendor.faceImage} alt={vendor.name} className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">No photo</div>}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{vendor.name}</td>
                      <td className="px-4 py-3 text-slate-700">{vendor.phone}</td>
                      <td className="px-4 py-3 text-slate-700">{vendor.company || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-700">{vendor.purpose || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-700">{vendor.category}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {vendor.registeredAt ? toDate(vendor.registeredAt).toLocaleDateString() : 'N/A'}
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
