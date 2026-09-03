'use client';

import { useSyncExternalStore } from 'react';
import GuardDashboard from '@/components/GuardDashboard';
import { getSocietyIdFromUrlOrActive, getSocietyIdServerSnapshot, subscribeToSocietyContext } from '@/lib/society';

export default function GuardPage() {
  const societyId = useSyncExternalStore(
    subscribeToSocietyContext,
    getSocietyIdFromUrlOrActive,
    getSocietyIdServerSnapshot
  );

  return societyId ? <GuardDashboard societyId={societyId} /> : null;
}
