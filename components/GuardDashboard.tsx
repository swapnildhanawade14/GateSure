'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getPersonsBySociety, getRecentEntries, logEntry, markPersonExit, updatePerson } from '@/lib/database';
import {
  captureAndExtractFace,
  capturePhotoBase64,
  compareFaceDescriptors,
  isFaceMatch,
  loadModels,
} from '@/lib/faceRecognition';
import { logoutSociety } from '@/lib/society';
import { toDate, type Entry, type Person } from '@/lib/types';

interface GuardDashboardProps {
  societyId: string;
}

export default function GuardDashboard({ societyId }: GuardDashboardProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [matchedPerson, setMatchedPerson] = useState<Person | null>(null);
  const [selectedFlat, setSelectedFlat] = useState('');
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [manualLookup, setManualLookup] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [nextAction, setNextAction] = useState<'entry' | 'exit'>('entry');

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCamera = async () => {
    if (streamRef.current) return true;
    if (!navigator.mediaDevices?.getUserMedia) return false;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: { ideal: 'user' },
      },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => undefined);
    }
    return true;
  };

  useEffect(() => {
    async function init() {
      try {
        await loadModels();
        const allPersons = await getPersonsBySociety(societyId);
        setPersons(allPersons);
        const entries = await getRecentEntries(societyId, 24);
        setRecentEntries(entries);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setStatus('This browser does not support camera access.');
          return;
        }

        await startCamera();

        setStatus('Ready to scan faces');
      } catch (error) {
        const message =
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please allow access and reload the page.'
            : 'Failed to initialize camera. Please use localhost or HTTPS and permit camera access.';
        setStatus(message);
      }
    }

    void init();

    return () => {
      stopCamera();
    };
  }, [societyId]);

  const refreshEntries = async () => {
    const entries = await getRecentEntries(societyId, 24);
    setRecentEntries(entries);
  };

  const getNextAction = (person: Person, entries = recentEntries): 'entry' | 'exit' => {
    const latestEntry = entries
      .filter((entry) => entry.personId === person.id)
      .sort((first, second) =>
        toDate(second.entryTime).getTime() - toDate(first.entryTime).getTime()
      )[0];
    if (person.category === 'resident') {
      if (person.movementStatus === 'outside') return 'entry';
      if (person.movementStatus === 'inside') return 'exit';
      return latestEntry?.status === 'exit' ? 'entry' : 'exit';
    }
    return latestEntry && !latestEntry.exitTime && latestEntry.status !== 'exit' ? 'exit' : 'entry';
  };

  const handleScanFace = async () => {
    if (!videoRef.current || !matchedPerson || !selectedFlat) {
      setStatus('Please match a face and select a flat first');
      return;
    }

    setScanning(true);
    setStatus('Logging entry...');

    try {
      const photoBase64 = capturedPhoto || await capturePhotoBase64(videoRef.current);
      const entryId = await logEntry(societyId, {
        personId: matchedPerson.id,
        personName: matchedPerson.name,
        phone: matchedPerson.phone,
        personCategory: matchedPerson.category,
        associatedFlat: selectedFlat,
        company: matchedPerson.company,
        purpose: matchedPerson.purpose,
        status: 'entry',
        verificationMethod: 'face',
        accuracy: 0.95,
        entryTime: new Date(),
        faceImage: photoBase64,
      } as unknown as Entry);

      setStatus(`Entry logged! ID: ${entryId}`);
      setMatchedPerson(null);
      setSelectedFlat('');
      setCapturedPhoto(null);
      setNextAction('exit');
      if (matchedPerson.category === 'resident') {
        await updatePerson(societyId, matchedPerson.id, { movementStatus: 'inside' });
        setPersons((current) => current.map((person) =>
          person.id === matchedPerson?.id ? { ...person, movementStatus: 'inside' } : person
        ));
      }
      await refreshEntries();
    } catch (error) {
      setStatus('Failed to log entry: ' + String(error));
    } finally {
      setScanning(false);
    }
  };

  const handleLogExit = async () => {
    if (!matchedPerson) return;

    setScanning(true);
    try {
      if (matchedPerson.category === 'resident') {
        await logEntry(societyId, {
          personId: matchedPerson.id,
          personName: matchedPerson.name,
          phone: matchedPerson.phone,
          personCategory: matchedPerson.category,
          associatedFlat: selectedFlat,
          company: matchedPerson.company,
          purpose: matchedPerson.purpose,
          status: 'exit',
          verificationMethod: 'manual',
          entryTime: new Date(),
        } as Entry);
        await updatePerson(societyId, matchedPerson.id, { movementStatus: 'outside' });
        setPersons((current) => current.map((person) =>
          person.id === matchedPerson?.id ? { ...person, movementStatus: 'outside' } : person
        ));
      } else {
        await markPersonExit(societyId, matchedPerson.id);
      }
      setStatus(`${matchedPerson.name} exit logged successfully`);
      setMatchedPerson(null);
      setSelectedFlat('');
      setNextAction('entry');
      await refreshEntries();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to log exit');
    } finally {
      setScanning(false);
    }
  };

  const handleFaceCapture = async () => {
    if (!videoRef.current || !(videoRef.current.srcObject instanceof MediaStream)) {
      const started = await startCamera();
      if (!started || !videoRef.current) {
        setStatus('Camera is not available. Please allow camera access and try again.');
        return;
      }
    }

    setScanning(true);
    setStatus('Detecting face...');

    try {
      const descriptor = await captureAndExtractFace(videoRef.current);

      if (!descriptor) {
        setStatus('No face detected. Try again.');
        return;
      }

      setCapturedPhoto(await capturePhotoBase64(videoRef.current));

      const threshold = Number(process.env.NEXT_PUBLIC_FACE_DETECTION_THRESHOLD ?? '0.6');
      let bestMatch: { person: Person; distance: number } | null = null;

      for (const person of persons) {
        if (!person.faceDescriptor) continue;

        const storedDescriptor = person.faceDescriptor instanceof Float32Array
          ? person.faceDescriptor
          : new Float32Array(person.faceDescriptor);
        const distance = compareFaceDescriptors(descriptor, storedDescriptor, threshold);

        if (isFaceMatch(distance, threshold)) {
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = { person, distance };
          }
        }
      }

      if (bestMatch) {
        const latestEntries = await getRecentEntries(societyId, 24 * 30);
        setRecentEntries(latestEntries);
        setMatchedPerson(bestMatch.person);
        setNextAction(getNextAction(bestMatch.person, latestEntries));
        if (!selectedFlat && bestMatch.person.associatedFlat) {
          setSelectedFlat(bestMatch.person.associatedFlat);
        }
        setStatus(`Match found: ${bestMatch.person.name} (${bestMatch.person.category})`);
      } else {
        setStatus('No match found. Try manual lookup.');
      }
      stopCamera();
    } catch (error) {
      setStatus('Detection failed: ' + String(error));
    } finally {
      setScanning(false);
    }
  };

  const handleManualLookup = async () => {
    if (!manualLookup) return;

    const found = persons.find((person) => person.phone === manualLookup);
    if (found) {
      const latestEntries = await getRecentEntries(societyId, 24 * 30);
      setRecentEntries(latestEntries);
      setMatchedPerson(found);
      setNextAction(getNextAction(found, latestEntries));
      if (!selectedFlat && found.associatedFlat) {
        setSelectedFlat(found.associatedFlat);
      }
      setStatus(`Found: ${found.name}`);
      setManualLookup('');
    } else {
      setStatus('Person not found');
    }
  };

  const handleLogout = () => {
    logoutSociety();
    router.push('/');
  };

  return (
    <div className="grid min-h-screen gap-6 bg-slate-100 p-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ← Back to Dashboard
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200">
          <h2 className="mb-4 text-2xl font-bold text-slate-800">Face Detection</h2>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="mb-4 h-96 w-full rounded-xl bg-black object-cover"
          />

          <button
            type="button"
            onClick={handleFaceCapture}
            disabled={scanning}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {scanning ? 'Scanning...' : 'Scan Face'}
          </button>

          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-slate-700">{status}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Manual Lookup</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter phone number"
              value={manualLookup}
              onChange={(event) => setManualLookup(event.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleManualLookup}
              className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
            >
              Search
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Recent Entries (Last 24h)</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {recentEntries.length === 0 ? (
              <p className="text-sm text-slate-500">No entries logged yet.</p>
            ) : (
              recentEntries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{entry.personName}</p>
                    <p className="text-xs text-slate-500">{entry.personCategory}</p>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <div>{toDate(entry.entryTime).toLocaleTimeString()}</div>
                    <div>{entry.associatedFlat ?? 'N/A'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {matchedPerson ? (
          <div className="rounded-2xl border-2 border-green-500 bg-white p-6 shadow-lg shadow-slate-200">
            <h3 className="mb-4 text-lg font-semibold text-green-700">✓ Person Matched</h3>

            {matchedPerson.faceImage && (
              <img
                src={matchedPerson.faceImage}
                alt={matchedPerson.name}
                className="mb-4 h-40 w-full rounded-lg object-cover"
              />
            )}

            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">Name:</span> {matchedPerson.name}</p>
              <p><span className="font-semibold">Category:</span> {matchedPerson.category}</p>
              <p><span className="font-semibold">Phone:</span> {matchedPerson.phone}</p>
              {matchedPerson.associatedFlat && (
                <p><span className="font-semibold">Flat:</span> {matchedPerson.associatedFlat}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Select Flat *</label>
              <input
                type="text"
                value={selectedFlat}
                onChange={(event) => setSelectedFlat(event.target.value)}
                placeholder="e.g., 501"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </div>

            {nextAction === 'exit' ? (
              <button
                type="button"
                onClick={handleLogExit}
                disabled={scanning}
                className="mt-4 w-full rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {scanning ? 'Logging...' : matchedPerson.category === 'resident' ? 'Log Resident Exit' : 'Log Exit'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleScanFace}
                disabled={!selectedFlat || scanning}
                className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {scanning ? 'Logging...' : matchedPerson.category === 'resident' ? 'Log Resident Entry' : '✓ Log Entry'}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMatchedPerson(null);
                setSelectedFlat('');
                setNextAction('entry');
              }}
              className="mt-2 w-full rounded-lg bg-slate-300 px-4 py-2 font-medium text-slate-800 transition hover:bg-slate-400"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-lg shadow-slate-200">
            <h3 className="mb-4 text-lg font-semibold text-slate-700">No Match</h3>
            <p className="text-sm text-slate-600">
              Scan a face or use manual lookup to find a registered person.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
