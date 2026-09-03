'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { getActiveSociety, getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, logoutSociety, subscribeToSocietyContext } from '@/lib/society';

const cards = [
  {
    title: 'Guard Dashboard',
    description: 'Face scanning, manual lookup, and visitor entry logging.',
    href: '/guard/dashboard',
    accent: 'from-blue-600 to-blue-500',
  },
  {
    title: 'Register Resident',
    description: 'Add residents, family members, maids, and daily workers to your flat.',
    href: '/register-resident',
    accent: 'from-green-600 to-emerald-500',
  },
  {
    title: 'Register Vendor',
    description: 'Add delivery and service vendors, couriers, and recurring external staff.',
    href: '/register/vendor',
    accent: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Vendor Directory',
    description: 'Browse vendors by work category, company, phone, and photo.',
    href: '/vendors',
    accent: 'from-cyan-600 to-sky-500',
  },
  {
    title: 'Digital Log Book',
    description: 'Track visits, filters, export, and daily movement records.',
    href: '/logbook',
    accent: 'from-emerald-600 to-teal-500',
  },
  {
    title: 'Resident Directory',
    description: 'Search residents by wing, floor, flat, and family details.',
    href: '/residents',
    accent: 'from-violet-600 to-purple-500',
  },
  {
    title: 'Analytics',
    description: 'Insights on traffic, entry trends, and visitor patterns.',
    href: '/analytics',
    accent: 'from-amber-500 to-orange-500',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );
  const society = getActiveSociety();

  const handleLogout = () => {
    logoutSociety();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Society Portal</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {society ? `${society.name} Dashboard` : 'Society Dashboard'}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={societyId ? `${card.href}?society_id=${encodeURIComponent(societyId)}` : card.href}
              className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`h-2 bg-gradient-to-r ${card.accent}`} />
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                <div className="mt-5 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 group-hover:bg-slate-200">
                  Open
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
