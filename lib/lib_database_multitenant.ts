// lib/database.ts - Multi-Tenant Version

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collectionGroup,
} from 'firebase/firestore';
import { db } from './firebase';
import { Person, Entry, Society, User, Vehicle, AuditLog } from './types';

function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined).map(removeUndefined) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefined(item)])
    ) as T;
  }

  return value;
}

// ============================================
// SOCIETY MANAGEMENT
// ============================================

/**
 * Create a new society (tenant)
 */
export async function createSociety(
  data: Omit<Society, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const societyRef = doc(collection(db, 'societies'));
    const societyId = societyRef.id;

    await setDoc(societyRef, {
      ...data,
      id: societyId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return societyId;
  } catch (error) {
    console.error('Error creating society:', error);
    throw error;
  }
}

/**
 * Get a society by ID
 */
export async function getSociety(societyId: string): Promise<Society | null> {
  try {
    const docRef = doc(db, 'societies', societyId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      subscriptionStartDate: data.subscriptionStartDate?.toDate?.() || new Date(),
      subscriptionEndDate: data.subscriptionEndDate?.toDate?.() || undefined,
    } as Society;
  } catch (error) {
    console.error('Error fetching society:', error);
    return null;
  }
}

/**
 * Update a society
 */
export async function updateSociety(
  societyId: string,
  data: Partial<Society>
): Promise<void> {
  try {
    const docRef = doc(db, 'societies', societyId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating society:', error);
    throw error;
  }
}

/**
 * Get all societies (admin only)
 */
export async function getAllSocieties(): Promise<Society[]> {
  try {
    const societiesRef = collection(db, 'societies');
    const querySnapshot = await getDocs(societiesRef);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Society;
    });
  } catch (error) {
    console.error('Error fetching societies:', error);
    return [];
  }
}

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Create a new user
 */
export async function createUser(
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const userRef = doc(collection(db, 'users'));
    const userId = userRef.id;

    await setDoc(userRef, {
      ...data,
      id: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    });

    return userId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get a user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      lastLogin: data.lastLogin?.toDate?.() || undefined,
    } as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Add a user to a society with a specific role
 */
export async function addUserToSociety(
  userId: string,
  societyId: string,
  role: 'admin' | 'guard' | 'resident' | 'viewer'
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const user = await getUser(userId);

    if (!user) throw new Error('User not found');

    await updateDoc(userRef, {
      [`societies.${societyId}`]: role,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding user to society:', error);
    throw error;
  }
}

/**
 * Remove a user from a society
 */
export async function removeUserFromSociety(
  userId: string,
  societyId: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const user = await getUser(userId);

    if (!user) throw new Error('User not found');

    const updatedSocieties = { ...user.societies };
    delete updatedSocieties[societyId];

    await updateDoc(userRef, {
      societies: updatedSocieties,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error removing user from society:', error);
    throw error;
  }
}

/**
 * Get all users in a society
 */
export async function getUsersBySociety(societyId: string): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where(`societies.${societyId}`, '!=', null));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as User;
    });
  } catch (error) {
    console.error('Error fetching users by society:', error);
    return [];
  }
}

// ============================================
// PERSON MANAGEMENT (TENANT-ISOLATED)
// ============================================

/**
 * Register a person in a specific society
 * Data is stored in: societies/{societyId}/persons
 */
export async function registerPerson(
  societyId: string,
  data: Omit<Person, 'id' | 'registeredAt'>
): Promise<string> {
  try {
    // Nested collection: societies/{societyId}/persons
    const personCollectionRef = collection(
      db,
      'societies',
      societyId,
      'persons'
    );

    const docRef = await addDoc(personCollectionRef, removeUndefined({
      ...data,
      faceDescriptor: data.faceDescriptor
        ? Array.from(data.faceDescriptor)
        : null,
      registeredAt: Timestamp.now(),
    }));

    return docRef.id;
  } catch (error) {
    console.error('Error registering person:', error);
    throw error;
  }
}

/**
 * Get a person by ID (within a society)
 */
export async function getPersonById(
  societyId: string,
  personId: string
): Promise<Person | null> {
  try {
    const docRef = doc(db, 'societies', societyId, 'persons', personId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      faceDescriptor: data.faceDescriptor
        ? new Float32Array(data.faceDescriptor)
        : undefined,
      registeredAt: data.registeredAt?.toDate?.() || new Date(),
    } as Person;
  } catch (error) {
    console.error('Error fetching person:', error);
    return null;
  }
}

/**
 * Get all persons in a society
 */
export async function getPersonsBySociety(societyId: string): Promise<Person[]> {
  try {
    const personCollectionRef = collection(
      db,
      'societies',
      societyId,
      'persons'
    );

    const querySnapshot = await getDocs(personCollectionRef);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        faceDescriptor: data.faceDescriptor
          ? new Float32Array(data.faceDescriptor)
          : undefined,
        registeredAt: data.registeredAt?.toDate?.() || new Date(),
      } as Person;
    });
  } catch (error) {
    console.error('Error fetching persons:', error);
    return [];
  }
}

/**
 * Search person by phone in a society
 */
export async function getPersonByPhone(
  societyId: string,
  phone: string
): Promise<Person | null> {
  try {
    const personCollectionRef = collection(
      db,
      'societies',
      societyId,
      'persons'
    );

    const q = query(personCollectionRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      faceDescriptor: data.faceDescriptor
        ? new Float32Array(data.faceDescriptor)
        : undefined,
      registeredAt: data.registeredAt?.toDate?.() || new Date(),
    } as Person;
  } catch (error) {
    console.error('Error searching person:', error);
    return null;
  }
}

/**
 * Get persons by category in a society
 */
export async function getPersonsByCategory(
  societyId: string,
  category: string
): Promise<Person[]> {
  try {
    const personCollectionRef = collection(
      db,
      'societies',
      societyId,
      'persons'
    );

    const q = query(personCollectionRef, where('category', '==', category));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        faceDescriptor: data.faceDescriptor
          ? new Float32Array(data.faceDescriptor)
          : undefined,
        registeredAt: data.registeredAt?.toDate?.() || new Date(),
      } as Person;
    });
  } catch (error) {
    console.error('Error fetching persons by category:', error);
    return [];
  }
}

/**
 * Update a person in a society
 */
export async function updatePerson(
  societyId: string,
  personId: string,
  data: Partial<Person>
): Promise<void> {
  try {
    const docRef = doc(db, 'societies', societyId, 'persons', personId);
    await updateDoc(docRef, {
      ...data,
      faceDescriptor: data.faceDescriptor
        ? Array.from(data.faceDescriptor)
        : undefined,
    });
  } catch (error) {
    console.error('Error updating person:', error);
    throw error;
  }
}

/**
 * Delete a person from a society
 */
export async function deletePerson(
  societyId: string,
  personId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'societies', societyId, 'persons', personId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting person:', error);
    throw error;
  }
}

// ============================================
// ENTRY/EXIT LOGGING (TENANT-ISOLATED)
// ============================================

/**
 * Log an entry/exit in a society
 */
export async function logEntry(
  societyId: string,
  data: Omit<Entry, 'id'>
): Promise<string> {
  try {
    const entryCollectionRef = collection(
      db,
      'societies',
      societyId,
      'entries'
    );

    const docRef = await addDoc(entryCollectionRef, removeUndefined({
      ...data,
      entryTime: Timestamp.now(),
    }));

    return docRef.id;
  } catch (error) {
    console.error('Error logging entry:', error);
    throw error;
  }
}

/**
 * Get recent entries in a society
 */
export async function getRecentEntries(
  societyId: string,
  hours: number = 24
): Promise<Entry[]> {
  try {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const entryCollectionRef = collection(
      db,
      'societies',
      societyId,
      'entries'
    );

    const querySnapshot = await getDocs(entryCollectionRef);

    return querySnapshot.docs
      .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        entryTime: data.entryTime?.toDate?.() || new Date(),
        exitTime: data.exitTime?.toDate?.() || undefined,
      } as Entry;
      })
      .filter((entry) => new Date(entry.entryTime as Date).getTime() >= cutoffTime.getTime())
      .sort((first, second) =>
        new Date(second.entryTime as Date).getTime() - new Date(first.entryTime as Date).getTime()
      )
      .slice(0, 100);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return [];
  }
}

export async function markPersonExit(societyId: string, personId: string): Promise<string> {
  const entries = await getRecentEntries(societyId, 24 * 30);
  const openEntry = entries.find(
    (entry) => entry.personId === personId && !entry.exitTime && entry.status !== 'exit'
  );

  if (!openEntry) {
    throw new Error('No active entry found for this person');
  }

  const entryRef = doc(db, 'societies', societyId, 'entries', openEntry.id);
  await updateDoc(entryRef, {
    exitTime: Timestamp.now(),
    status: 'exit',
  });
  return openEntry.id;
}

/**
 * Get entries for a specific person in a society
 */
export async function getPersonEntries(
  societyId: string,
  personId: string,
  days: number = 30
): Promise<Entry[]> {
  try {
    const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const entryCollectionRef = collection(
      db,
      'societies',
      societyId,
      'entries'
    );

    const q = query(
      entryCollectionRef,
      where('personId', '==', personId),
      where('entryTime', '>=', Timestamp.fromDate(cutoffTime)),
      orderBy('entryTime', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        entryTime: data.entryTime?.toDate?.() || new Date(),
        exitTime: data.exitTime?.toDate?.() || undefined,
      } as Entry;
    });
  } catch (error) {
    console.error('Error fetching person entries:', error);
    return [];
  }
}

/**
 * Delete an entry from a society
 */
export async function deleteEntry(
  societyId: string,
  entryId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'societies', societyId, 'entries', entryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
}

// ============================================
// VEHICLE MANAGEMENT (TENANT-ISOLATED)
// ============================================

/**
 * Register a vehicle in a society
 */
export async function registerVehicle(
  societyId: string,
  data: Omit<Vehicle, 'id' | 'registeredAt'>
): Promise<string> {
  try {
    const vehicleCollectionRef = collection(
      db,
      'societies',
      societyId,
      'vehicles'
    );

    const docRef = await addDoc(vehicleCollectionRef, removeUndefined({
      ...data,
      registeredAt: Timestamp.now(),
    }));

    return docRef.id;
  } catch (error) {
    console.error('Error registering vehicle:', error);
    throw error;
  }
}

/**
 * Get a vehicle by ID
 */
export async function getVehicleById(
  societyId: string,
  vehicleId: string
): Promise<Vehicle | null> {
  try {
    const docRef = doc(db, 'societies', societyId, 'vehicles', vehicleId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      registeredAt: data.registeredAt?.toDate?.() || new Date(),
    } as Vehicle;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
}

/**
 * Get all vehicles in a society
 */
export async function getVehiclesBySociety(societyId: string): Promise<Vehicle[]> {
  try {
    const vehicleCollectionRef = collection(
      db,
      'societies',
      societyId,
      'vehicles'
    );

    const querySnapshot = await getDocs(vehicleCollectionRef);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        registeredAt: data.registeredAt?.toDate?.() || new Date(),
      } as Vehicle;
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
}

/**
 * Search vehicle by license plate
 */
export async function getVehicleByPlate(
  societyId: string,
  licensePlate: string
): Promise<Vehicle | null> {
  try {
    const vehicleCollectionRef = collection(
      db,
      'societies',
      societyId,
      'vehicles'
    );

    const q = query(
      vehicleCollectionRef,
      where('licensePlate', '==', licensePlate.toUpperCase())
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      registeredAt: data.registeredAt?.toDate?.() || new Date(),
    } as Vehicle;
  } catch (error) {
    console.error('Error searching vehicle:', error);
    return null;
  }
}

// ============================================
// AUDIT LOGGING (FOR COMPLIANCE)
// ============================================

/**
 * Log an action for audit trail
 */
export async function logAuditAction(
  societyId: string,
  data: Omit<AuditLog, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const auditCollectionRef = collection(
      db,
      'societies',
      societyId,
      'auditLogs'
    );

    const docRef = await addDoc(auditCollectionRef, removeUndefined({
      ...data,
      createdAt: Timestamp.now(),
    }));

    return docRef.id;
  } catch (error) {
    console.error('Error logging audit action:', error);
    throw error;
  }
}

/**
 * Get audit logs for a society
 */
export async function getAuditLogs(
  societyId: string,
  days: number = 30,
  limit_count: number = 100
): Promise<AuditLog[]> {
  try {
    const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const auditCollectionRef = collection(
      db,
      'societies',
      societyId,
      'auditLogs'
    );

    const q = query(
      auditCollectionRef,
      where('createdAt', '>=', Timestamp.fromDate(cutoffTime)),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      } as AuditLog;
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verify that a user has access to a society
 * Returns the user's role if they have access, null otherwise
 */
export async function verifyUserSocietyAccess(
  userId: string,
  societyId: string
): Promise<string | null> {
  try {
    const user = await getUser(userId);
    if (!user) return null;

    return user.societies[societyId] || null;
  } catch (error) {
    console.error('Error verifying user access:', error);
    return null;
  }
}

/**
 * Get count of persons in a society
 */
export async function getPersonsCount(societyId: string): Promise<number> {
  try {
    const persons = await getPersonsBySociety(societyId);
    return persons.length;
  } catch (error) {
    console.error('Error getting persons count:', error);
    return 0;
  }
}

/**
 * Get count of entries in a society (last 24 hours)
 */
export async function getEntriesCount(societyId: string): Promise<number> {
  try {
    const entries = await getRecentEntries(societyId, 24);
    return entries.length;
  } catch (error) {
    console.error('Error getting entries count:', error);
    return 0;
  }
}

export default {
  // Societies
  createSociety,
  getSociety,
  updateSociety,
  getAllSocieties,

  // Users
  createUser,
  getUser,
  addUserToSociety,
  removeUserFromSociety,
  getUsersBySociety,

  // Persons
  registerPerson,
  getPersonById,
  getPersonsBySociety,
  getPersonByPhone,
  getPersonsByCategory,
  updatePerson,
  deletePerson,

  // Entries
  logEntry,
  getRecentEntries,
  markPersonExit,
  getPersonEntries,
  deleteEntry,

  // Vehicles
  registerVehicle,
  getVehicleById,
  getVehiclesBySociety,
  getVehicleByPlate,

  // Audit
  logAuditAction,
  getAuditLogs,

  // Helpers
  verifyUserSocietyAccess,
  getPersonsCount,
  getEntriesCount,
};
