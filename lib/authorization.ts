import { getSociety, getUser } from './database';
import { getCurrentFirebaseUser } from './auth';
import type { SocietyContext } from './types';

export async function getUserRoleInSociety(userId: string, societyId: string) {
  const user = await getUser(userId);
  return user?.societies[societyId] || null;
}

export async function userHasAccessToSociety(userId: string, societyId: string) {
  return (await getUserRoleInSociety(userId, societyId)) !== null;
}

export async function isUserAdminOfSociety(userId: string, societyId: string) {
  return (await getUserRoleInSociety(userId, societyId)) === 'admin';
}

export async function isUserGuardOrAdmin(userId: string, societyId: string) {
  const role = await getUserRoleInSociety(userId, societyId);
  return role === 'guard' || role === 'admin';
}

export async function getCurrentUserSocietyContext(societyId: string): Promise<SocietyContext | null> {
  const firebaseUser = getCurrentFirebaseUser();
  if (!firebaseUser) return null;
  const user = await getUser(firebaseUser.uid);
  const role = user?.societies[societyId];
  const society = await getSociety(societyId);
  if (!user || !role || !society) return null;
  return { societyId, userId: firebaseUser.uid, userEmail: firebaseUser.email || '', role, society, user };
}

export class AuthorizationError extends Error {
  constructor(message = 'Authorization failed') {
    super(message);
    this.name = 'AuthorizationError';
  }
}