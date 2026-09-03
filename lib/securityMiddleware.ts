import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, number[]>();

export function rateLimit(key: string, maxRequests = 100, windowMs = 60_000): boolean {
  const now = Date.now();
  const requests = (rateLimitMap.get(key) || []).filter((time) => now - time < windowMs);
  if (requests.length >= maxRequests) return false;
  requests.push(now);
  rateLimitMap.set(key, requests);
  return true;
}

export function rateLimitByIP(request: NextRequest, maxRequests = 100, windowMs = 60_000): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') || 'unknown';
  return rateLimit(`ip:${ip}`, maxRequests, windowMs);
}

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return input.replace(/<[^>]*>/g, '').replace(/[<>\"'`;]/g, '').trim();
  }
  if (Array.isArray(input)) return input.map(sanitizeInput);
  if (input && typeof input === 'object') {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, sanitizeInput(value)]));
  }
  return input;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
}

export function isValidName(name: string): boolean {
  return name.length >= 2 && name.length <= 100;
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letters';
  if (!/[0-9]/.test(password)) return 'Password must contain numbers';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain special characters';
  return null;
}