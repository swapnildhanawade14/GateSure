'use client';

import { QRCodeSVG } from 'qrcode.react';

interface RegistrationQrCardProps {
  title: string;
  value: string;
  description: string;
}

export default function RegistrationQrCard({ title, value, description }: RegistrationQrCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center shadow-sm">
      <div className="mb-3 text-lg font-semibold text-slate-800">{title}</div>
      <div className="flex justify-center rounded-xl bg-white p-3">
        <QRCodeSVG value={value} size={130} includeMargin />
      </div>
      <p className="mt-3 text-xs text-slate-600">{description}</p>
      <p className="mt-2 break-all text-[11px] font-medium text-slate-500">{value}</p>
    </div>
  );
}
