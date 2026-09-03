'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { setAdminSession } from '@/lib/admin';
import { loginSociety, setActiveSociety } from '@/lib/society';

export default function Home() {
  const router = useRouter();
  const [societyName, setSocietyName] = useState('');
  const [societyCode, setSocietyCode] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'login' | 'admin'>('login');

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const society = await loginSociety(societyName, societyCode);
      setAdminSession(false);
      setMessage(`Welcome to ${society.name}.`);
      router.push(`/dashboard?society_id=${encodeURIComponent(society.id)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed.');
    }
  };

  const handleAdminLogin = (event: FormEvent) => {
    event.preventDefault();

    if (adminUsername.trim() === 'admin' && adminPassword === 'admin123') {
      setActiveSociety(null);
      setAdminSession(true);
      router.push('/admin/dashboard');
      return;
    }

    setMessage('Invalid admin username or password.');
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background image - full coverage */}
      <Image
        src="/gatesure-gate-entrance.png"
        alt="GateSure security gate entrance"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content - Positioned on the right side */}
      <div className="relative z-10 flex min-h-screen items-center justify-end px-6 py-8 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Login Card - Transparent */}
          <div className="rounded-2xl border border-cyan-400/40 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-lg">
            
            {/* Mode Toggle Tabs */}
            <div className="mb-6 flex gap-2 rounded-xl border border-cyan-400/20 bg-slate-800/60 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMessage('');
                }}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-cyan-500/80 text-white shadow-lg shadow-cyan-500/40'
                    : 'text-cyan-300 hover:bg-slate-700/50'
                }`}
              >
                Society
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('admin');
                  setMessage('');
                }}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'admin'
                    ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/40'
                    : 'text-cyan-300 hover:bg-slate-700/50'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Form Content */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="society-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Society Name
                  </label>
                  <input
                    id="society-name"
                    type="text"
                    value={societyName}
                    onChange={(event) => setSocietyName(event.target.value)}
                    placeholder="Enter society name"
                    className="w-full rounded-lg border border-cyan-400/30 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="society-code" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Society Code
                  </label>
                  <input
                    id="society-code"
                    type="text"
                    value={societyCode}
                    onChange={(event) => setSocietyCode(event.target.value)}
                    placeholder="Enter society code"
                    className="w-full rounded-lg border border-cyan-400/30 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    required
                  />
                </div>

                {message && (
                  <div className={`rounded-lg px-4 py-3 text-xs font-medium ${
                    message.includes('Welcome')
                      ? 'border border-green-400/40 bg-green-500/15 text-green-300'
                      : 'border border-red-400/40 bg-red-500/15 text-red-300'
                  }`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/40 transition hover:shadow-xl hover:shadow-cyan-500/50 hover:from-cyan-400 hover:to-blue-400"
                >
                  Login
                </button>

                <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-4 text-center text-xs text-cyan-200">
                  <p className="font-semibold">New to GateSure?</p>
                  <p className="mt-1 text-slate-400">Contact your society administrator</p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label htmlFor="admin-username" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Username
                  </label>
                  <input
                    id="admin-username"
                    type="text"
                    value={adminUsername}
                    onChange={(event) => setAdminUsername(event.target.value)}
                    placeholder="Enter username"
                    className="w-full rounded-lg border border-cyan-400/30 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-cyan-400/30 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    required
                  />
                </div>

                {message && (
                  <div className="rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-xs font-medium text-red-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-700/40 transition hover:shadow-xl hover:shadow-slate-600/50 hover:from-slate-600 hover:to-slate-500"
                >
                  Admin Login
                </button>

                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-xs text-yellow-200">
                  <p className="font-semibold">Demo Credentials</p>
                  <div className="mt-2 space-y-1 font-mono text-slate-400">
                    <p>Username: <span className="text-yellow-300">admin</span></p>
                    <p>Password: <span className="text-yellow-300">admin123</span></p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
