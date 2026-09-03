import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';
import { getSociety, getUser } from './database';
import type { SocietyContext, User } from './types';

if (typeof window !== 'undefined') {
  void setPersistence(auth, browserLocalPersistence);
}

export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
}

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  if (!userCredential.user.emailVerified) {
    await firebaseSignOut(auth);
    throw new Error('Please verify your email before logging in');
  }
  return userCredential.user;
}

export async function getAuthToken(): Promise<string | null> {
  const user = getCurrentFirebaseUser();
  return user ? getIdToken(user) : null;
}

export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = getCurrentFirebaseUser();
  return firebaseUser ? getUser(firebaseUser.uid) : null;
}

export async function getSocietyContext(societyId: string): Promise<SocietyContext | null> {
  const firebaseUser = getCurrentFirebaseUser();
  if (!firebaseUser) return null;

  const user = await getUser(firebaseUser.uid);
  const role = user?.societies[societyId];
  if (!user || !role) return null;

  const society = await getSociety(societyId);
  if (!society) return null;

  return {
    societyId,
    userId: firebaseUser.uid,
    userEmail: firebaseUser.email || '',
    role,
    society,
    user,
  };
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signOut() {
  await firebaseSignOut(auth);
}