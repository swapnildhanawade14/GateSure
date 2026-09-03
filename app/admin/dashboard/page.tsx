'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAdminSession, logoutAdmin } from '@/lib/admin';

const adminCards = [
  { title: 'Society Setup', description: 'Manage societies, codes, and onboarding details.', href: '/admin/setup', accent: 'from-blue-600 to-cyan-500' },
  { title: 'Societies', description: 'View all onboarded societies and manage each society profile.', href: '/admin/societies', accent: 'from-indigo-600 to-blue-500' },
  { title: 'Residents', description: 'Review resident records, family, and flat data.', href: '/residents', accent: 'from-violet-600 to-purple-500' },
  { title: 'Visitors & Vendors', description: 'Monitor log entries, visitor activity, and vendor movement.', href: '/logbook', accent: 'from-emerald-600 to-teal-500' },
  { title: 'Analytics', description: 'View trends, frequency, and peak-time monitoring.', href: '/analytics', accent: 'from-amber-500 to-orange-500' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated] = useState(() => getAdminSession());

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Admin Portal</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Control Center</h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {adminCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
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
