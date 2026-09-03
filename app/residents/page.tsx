'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { getAdminSession } from '@/lib/admin';
import { getPersonsBySociety } from '@/lib/database';
import { getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, subscribeToSocietyContext } from '@/lib/society';
import type { Person } from '@/lib/types';

const wings = ['A', 'B', 'C', 'D'];
const floors = ['1', '2', '3', '4', '5', '6', '7', '8'];

function getFlatParts(flat?: string) {
  const value = flat?.trim() ?? '';
  if (!value) return { wing: '', floor: '', flat: '' };

  const normalized = value.replace(/\s+/g, '').toUpperCase();
  const wingMatch = normalized.match(/^([A-Z]+)[-_]?(\d+)/);
  const floorMatch = normalized.match(/[A-Z]+[-_]?((?:\d+))/);

  return {
    wing: wingMatch?.[1] ?? '',
    floor: floorMatch?.[1] ?? '',
    flat: normalized,
  };
}

export default function ResidentsDirectoryPage() {
  const router = useRouter();
  const [persons, setPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [selectedWing, setSelectedWing] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [backHref] = useState(() => getAdminSession() ? '/admin/dashboard' : '/dashboard');
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );

  useEffect(() => {
    async function load() {
      if (!societyId) return;
      const data = await getPersonsBySociety(societyId);
      setPersons(data.filter((person) => person.category === 'resident'));
    }

    void load();
  }, [societyId]);

  const filteredPersons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return persons.filter((person) => {
      const flatParts = getFlatParts(person.associatedFlat);
      const wingMatch = selectedWing === 'all' || flatParts.wing === selectedWing;
      const floorMatch = selectedFloor === 'all' || flatParts.floor === selectedFloor;
      const searchMatch =
        !query ||
        [person.name, person.phone, person.associatedFlat, person.relation]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      return wingMatch && floorMatch && searchMatch;
    });
  }, [persons, search, selectedFloor, selectedWing]);

  const households = useMemo(() => {
    const grouped = new Map<string, Person[]>();
    filteredPersons.forEach((person) => {
      const flat = person.associatedFlat || 'Unassigned flat';
      grouped.set(flat, [...(grouped.get(flat) || []), person]);
    });
    return Array.from(grouped.entries()).sort(([first], [second]) => first.localeCompare(second));
  }, [filteredPersons]);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button onClick={() => router.push(backHref || '/dashboard')} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Resident Directory</h1>
            <div className="w-20" aria-hidden="true" />
          </div>
          <p className="mt-2 text-slate-600">
            Organized by wing, floor, and flat for residents, family members, maids, and service staff.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resident, flat or phone"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            />

            <select
              value={selectedWing}
              onChange={(event) => setSelectedWing(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            >
              <option value="all">All wings</option>
              {wings.map((wing) => (
                <option key={wing} value={wing}>
                  Wing {wing}
                </option>
              ))}
            </select>

            <select
              value={selectedFloor}
              onChange={(event) => setSelectedFloor(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            >
              <option value="all">All floors</option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedWing('all');
                setSelectedFloor('all');
              }}
              className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Clear filters
            </button>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Household profiles</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Residents, tenants, family and helpers</h2>
            </div>
            <span className="text-sm text-slate-500">{filteredPersons.length} people</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {households.map(([flat, household]) => {
              const ordered = [...household].sort((first, second) => {
                const order = { owner: 0, tenant: 1, family: 2, helper: 3 };
                return (order[first.householdRole || 'family'] ?? 2) - (order[second.householdRole || 'family'] ?? 2);
              });
              return (
                <div key={flat} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Flat {flat}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{household.length} profiles</span>
                  </div>
                  <div className="space-y-3">
                    {ordered.map((person) => (
                      <div key={person.id} className="flex items-center gap-3 rounded-lg bg-white p-3">
                        {person.faceImage ? (
                          <img src={person.faceImage} alt={person.name} className="h-14 w-14 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">No photo</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">{person.name}</p>
                          <p className="text-sm capitalize text-blue-700">{person.householdRole || person.relation || 'Family member'}</p>
                          <p className="text-xs text-slate-500">{person.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          {wings.map((wing) => {
            const wingResidents = filteredPersons.filter((person) => {
              const flatParts = getFlatParts(person.associatedFlat);
              return flatParts.wing === wing || (!flatParts.wing && selectedWing === 'all');
            });

            return (
              <div key={wing} className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-200">
                <h2 className="mb-4 text-xl font-bold text-slate-800">Wing {wing}</h2>
                <div className="space-y-3">
                  {floors.map((floor) => {
                    const matches = wingResidents.filter((person) => {
                      const flatParts = getFlatParts(person.associatedFlat);
                      if (selectedFloor !== 'all' && flatParts.floor !== selectedFloor) return false;
                      if (selectedFloor === 'all') {
                        return flatParts.floor === floor || (!flatParts.floor && floor === '1');
                      }
                      return flatParts.floor === floor;
                    });

                    return (
                      <div key={`${wing}-${floor}`} className="rounded-xl border border-slate-200 p-3">
                        <div className="mb-2 text-sm font-semibold text-slate-700">Floor {floor}</div>
                        {matches.length === 0 ? (
                          <p className="text-xs text-slate-400">No residents assigned</p>
                        ) : (
                          <ul className="space-y-1 text-sm text-slate-700">
                            {matches.map((person) => (
                              <li key={person.id} className="flex justify-between gap-2">
                                <span>{person.name}</span>
                                <span className="text-slate-500">{person.associatedFlat || 'Unassigned'}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
