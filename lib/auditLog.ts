import { logAuditAction } from './database';
import type { AuditLog } from './types';

export async function createAuditLog(data: Omit<AuditLog, 'id' | 'createdAt'>) {
  return logAuditAction(data.societyId, data);
}

export async function logSecurityEvent(
  societyId: string,
  userId: string,
  userEmail: string,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, unknown>
) {
  await createAuditLog({
    societyId,
    userId,
    userEmail,
    action: `security_${eventType}`,
    resourceType: 'security',
    resourceId: `${eventType}-${Date.now()}`,
    metadata: { severity, ...details },
  });
}

export async function logFailedLoginAttempt(email: string, ip: string) {
  console.warn('Failed login attempt', { email, ip, timestamp: new Date().toISOString() });
}