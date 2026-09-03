'use client';

import RegistrationQrCard from '@/components/RegistrationQrCard';
import { buildRegistrationQrCode } from '@/lib/registration';

export default function RegistrationQrPage() {
  const residentCode = buildRegistrationQrCode('resident', 'RES-001');
  const vendorCode = buildRegistrationQrCode('vendor', 'VEN-001');

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Registration QR</p>
        <h1 className="text-3xl font-bold text-slate-900">Resident and Vendor QR Codes</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Separate QR codes ensure residents and vendors are kept in different registration streams for secure access control.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <RegistrationQrCard
            title="Resident QR"
            value={residentCode}
            description="Use for residents, family members, maids, daily workers, and household staff."
          />
          <RegistrationQrCard
            title="Vendor QR"
            value={vendorCode}
            description="Use for vendors, delivery persons, and service providers from Amazon, Flipkart, Swiggy, Zomato, and others."
          />
        </div>
      </div>
    </main>
  );
}
