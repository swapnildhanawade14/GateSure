import { addDoc, collection, doc, getDoc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Society {
  id: string;
  name: string;
  code: string;
  address: string;
  createdAt: string;
}

const SOCIETIES_KEY = 'gatesure_societies';
const ACTIVE_SOCIETY_KEY = 'gatesure_active_society';
const societyCollection = collection(db, 'societies');

function normalizeSocietyRecord(raw: Record<string, unknown>): Society {
  const createdAt =
    raw.createdAt instanceof Timestamp
      ? raw.createdAt.toDate().toISOString()
      : typeof raw.createdAt === 'string'
        ? raw.createdAt
        : new Date().toISOString();

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    code: String(raw.code ?? ''),
    address: String(raw.address ?? ''),
    createdAt,
  };
}

export function readLocalSocieties(): Society[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(SOCIETIES_KEY);
    return raw ? (JSON.parse(raw) as Society[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalSocieties(societies: Society[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SOCIETIES_KEY, JSON.stringify(societies));
}

export function getActiveSociety(): Society | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(ACTIVE_SOCIETY_KEY);
    if (!raw) return null;

    const activeSociety = JSON.parse(raw) as Society;
    if (activeSociety.id) return activeSociety;

    const recoveredSociety = readLocalSocieties().find(
      (society) => society.name === activeSociety.name && society.code === activeSociety.code && society.id
    );
    if (recoveredSociety) {
      window.localStorage.setItem(ACTIVE_SOCIETY_KEY, JSON.stringify(recoveredSociety));
      return recoveredSociety;
    }

    return null;
  } catch {
    return null;
  }
}

export function getSocietyIdFromUrlOrActive(): string | null {
  if (typeof window === 'undefined') return null;

  const queryId = new URLSearchParams(window.location.search).get('society_id')?.trim();
  const activeSocietyId = getActiveSociety()?.id;
  const cachedSocietyId = readLocalSocieties().find((society) => society.id)?.id;
  return queryId || activeSocietyId || cachedSocietyId || null;
}

export function subscribeToSocietyContext(onChange: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener('storage', onChange);
  window.addEventListener('gatesure-society-change', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('gatesure-society-change', onChange);
  };
}

export function getSocietyIdServerSnapshot() {
  return null;
}

export function setActiveSociety(society: Society | null) {
  if (typeof window === 'undefined') return;

  if (!society) {
    window.localStorage.removeItem(ACTIVE_SOCIETY_KEY);
    window.dispatchEvent(new Event('gatesure-society-change'));
    return;
  }

  window.localStorage.setItem(ACTIVE_SOCIETY_KEY, JSON.stringify(society));
  window.dispatchEvent(new Event('gatesure-society-change'));
}

export function logoutSociety() {
  setActiveSociety(null);
}

export async function readSocieties(): Promise<Society[]> {
  try {
    const snapshot = await getDocs(societyCollection);
    const societiesFromFirebase = snapshot.docs.map((docItem) => {
      const data = docItem.data();
      return normalizeSocietyRecord({ ...data, id: docItem.id });
    });

    if (societiesFromFirebase.length > 0) {
      writeLocalSocieties(societiesFromFirebase);
      return societiesFromFirebase;
    }

    const localSocieties = readLocalSocieties();
    if (localSocieties.length > 0) {
      writeLocalSocieties(localSocieties);
    }
    return localSocieties;
  } catch (error) {
    console.error('Error fetching societies:', error);
    return readLocalSocieties();
  }
}

export async function registerSociety(data: { name: string; code: string; address: string }) {
  const name = data.name.trim();
  const code = data.code.trim();
  const address = data.address.trim();

  if (!name || !code || !address) {
    throw new Error('Please fill in all society details.');
  }

  const societies = await readSocieties();
  const normalizedCode = code.toLowerCase();

  const exists = societies.some(
    (society) =>
      society.name.trim().toLowerCase() === name.toLowerCase() ||
      society.code.trim().toLowerCase() === normalizedCode
  );

  if (exists) {
    throw new Error('A society with this name or code already exists.');
  }

  const society: Society = {
    id: '',
    name,
    code,
    address,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(societyCollection, {
    ...society,
    createdAt: Timestamp.now(),
  });

  const savedSociety: Society = {
    ...society,
    id: docRef.id,
  };

  const updatedSocieties = [...societies, savedSociety];
  writeLocalSocieties(updatedSocieties);
  setActiveSociety(savedSociety);

  return savedSociety;
}

export async function updateSociety(societyId: string, updates: Partial<Society>) {
  const ref = doc(societyCollection, societyId);
  await updateDoc(ref, {
    ...updates,
  });

  const updatedSocieties = readLocalSocieties().map((society) =>
    society.id === societyId ? { ...society, ...updates } : society
  );

  writeLocalSocieties(updatedSocieties);

  const current = getActiveSociety();
  if (current && current.id === societyId) {
    setActiveSociety({ ...current, ...updates });
  }

  return { ...updates };
}

export async function getSocietyById(societyId: string): Promise<Society | null> {
  try {
    const ref = doc(societyCollection, societyId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return normalizeSocietyRecord({ id: snapshot.id, ...data });
  } catch (error) {
    console.error('Error fetching society by id:', error);
    return null;
  }
}

export async function loginSociety(name: string, code: string) {
  const societies = await readSocieties();
  const society = societies.find(
    (item) =>
      item.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      item.code.trim().toLowerCase() === code.trim().toLowerCase()
  );

  if (!society) {
    throw new Error('Invalid society name or code. Please register a society first.');
  }

  if (!society.id) {
    throw new Error('This society record is missing its ID. Please recreate the society from Admin Setup.');
  }

  setActiveSociety(society);
  return society;
}
