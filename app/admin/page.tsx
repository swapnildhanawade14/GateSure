'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_USERNAME, getAdminSession, setAdminSession } from '@/lib/admin';
import { setActiveSociety } from '@/lib/society';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  if (typeof window !== 'undefined' && getAdminSession()) {
    router.replace('/admin/dashboard');
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (username.trim() === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) {
      setActiveSociety(null);
      setAdminSession(true);
      router.push('/admin/dashboard');
      return;
    }

    setMessage('Invalid username or password.');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Admin Portal</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-username" className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter admin username"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          {message && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Login to Admin Portal
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Demo credentials</p>
          <p>Username: admin</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </main>
  );
}
