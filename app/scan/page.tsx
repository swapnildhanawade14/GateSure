'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getPersonsBySociety } from '@/lib/database';
import { parseRegistrationQrCode } from '@/lib/registration';
import { getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, subscribeToSocietyContext } from '@/lib/society';
import type { Person } from '@/lib/types';

export default function ScanEntryPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [status, setStatus] = useState('Initializing camera...');
  const [selectedType, setSelectedType] = useState<'resident' | 'vendor'>('resident');
  const [currentMatch, setCurrentMatch] = useState<Person | null>(null);
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );

  useEffect(() => {
    async function load() {
      if (!societyId) return;
      const personsData = await getPersonsBySociety(societyId);
      setPersons(personsData);
    }

    void load();
  }, [societyId]);


  useEffect(() => {
    async function initCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('Camera not supported in this browser.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus('Camera ready. Scan a resident or vendor code.');
      } catch {
        setStatus('Camera permission is blocked. Please allow camera access.');
      }
    }

    void initCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleQrLookup = () => {
    const code = selectedType === 'resident' ? 'RESIDENT:RES-001' : 'VENDOR:VEN-001';
    const parsed = parseRegistrationQrCode(code);

    if (!parsed) {
      setStatus('Invalid QR code format.');
      return;
    }

    const matched = persons.find((person) => {
      const personType = person.registrationType ?? (person.category === 'vendor' ? 'vendor' : 'resident');
      return personType === parsed.type && person.id === parsed.id;
    });

    if (!matched) {
      setStatus(`No matching ${selectedType} record found for scanned QR code.`);
      setCurrentMatch(null);
      return;
    }

    setCurrentMatch(matched);
    setStatus(`${selectedType === 'resident' ? 'Resident' : 'Vendor'} QR scanned: ${matched.name}`);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-xl shadow-slate-200">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              ← Back
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">QR Entry</p>
              <h1 className="text-3xl font-bold text-slate-900">Resident and Vendor Check-in</h1>
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as 'resident' | 'vendor')}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
          >
            <option value="resident">Resident QR</option>
            <option value="vendor">Vendor QR</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl bg-slate-900 p-4">
            <video ref={videoRef} autoPlay playsInline muted className="h-[360px] w-full rounded-xl bg-black object-cover" />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Status</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">{status}</p>
            </div>

            <button
              type="button"
              onClick={handleQrLookup}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Scan {selectedType === 'resident' ? 'Resident' : 'Vendor'} QR
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold text-slate-800">Matched record</h2>
              {currentMatch ? (
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold">Name:</span> {currentMatch.name}</p>
                  <p><span className="font-semibold">Mobile:</span> {currentMatch.phone}</p>
                  <p><span className="font-semibold">Category:</span> {currentMatch.category}</p>
                  <p><span className="font-semibold">Flat:</span> {currentMatch.associatedFlat || 'N/A'}</p>
                  <p><span className="font-semibold">Company:</span> {currentMatch.company || 'N/A'}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No QR match yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
