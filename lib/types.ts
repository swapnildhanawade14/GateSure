// lib/types.ts - Multi-Tenant Version

import { Timestamp } from 'firebase/firestore';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function toDate(value: Date | Timestamp): Date {
  return value instanceof Timestamp ? value.toDate() : value;
}

// ============================================
// PERSON & ENTRY TYPES (Same as before, but used per-tenant)
// ============================================

export interface Person {
  id: string;
  name: string;
  phone: string;
  category: 'resident' | 'daily-labor' | 'service-worker' | 'vendor' | 'guest';
  associatedFlat?: string;
  wing?: string;
  floor?: string;
  roomNumber?: string;
  relation?: string;
  registrationType?: 'resident' | 'vendor';
  movementStatus?: 'inside' | 'outside';
  householdRole?: 'owner' | 'tenant' | 'family' | 'helper';
  purpose?: string;
  company?: string;
  faceDescriptor?: Float32Array;
  faceImage?: string; // Base64 encoded
  registeredAt: Date | Timestamp;
  registeredBy: string;
}

export interface Entry {
  id: string;
  personId: string;
  personName: string;
  personCategory: string;
  associatedFlat?: string;
  entryTime: Date | Timestamp;
  exitTime?: Date | Timestamp;
  loggedBy: string;
  purpose?: string;
  notes?: string;
  phone?: string;
  company?: string;
  status?: string;
  verificationMethod?: string;
  accuracy?: number;
  faceImage?: string;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  ownerName: string;
  ownerPhone: string;
  associatedFlat?: string;
  vehicleType: 'car' | 'bike' | 'auto' | 'other';
  vehicleImage?: string;
  registeredAt: Date | Timestamp;
  registeredBy: string;
}

// ============================================
// NEW: USER TYPE (WITH SOCIETY MEMBERSHIP)
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  
  // Mapping: societyId -> role
  // Example: { 'society-123': 'admin', 'society-456': 'guard' }
  societies: Record<string, 'admin' | 'guard' | 'resident' | 'viewer'>;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastLogin?: Date | Timestamp;
  isActive: boolean;
}

// ============================================
// NEW: SOCIETY TYPE (TENANT)
// ============================================

export interface Society {
  id: string;
  
  // Basic Info
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  
  // Contact
  adminEmail: string;
  adminPhone: string;
  phone: string;
  
  // Logo/Branding
  logo?: string;
  logoUrl?: string;
  
  // Subscription Info
  subscriptionId?: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'suspended' | 'cancelled';
  subscriptionPlan: 'free' | 'starter' | 'professional' | 'enterprise';
  subscriptionStartDate: Date | Timestamp;
  subscriptionEndDate?: Date | Timestamp;
  subscriptionRenewalDate?: Date | Timestamp;
  
  // Usage Limits
  usageStats?: {
    totalPersons: number;
    totalEntries: number;
    totalUsers: number;
    lastUpdated: Date | Timestamp;
  };
  
  // Settings
  settings: {
    // Face Recognition
    faceThreshold: number; // 0.6 default
    faceConfidenceThreshold: number; // 0.5 default
    
    // System
    maxAllowedGates: number; // How many entry points
    maxAllowedUsers: number; // How many users
    maxStorageMB: number; // Cloud storage limit
    
    // Features
    enableGuest: boolean;
    enableVendor: boolean;
    enableServiceWorker: boolean;
    enableVehicleTracking: boolean;
    enableParcelDelivery: boolean;
    enableNotifications: boolean;
    
    // Data
    entryLogRetentionDays: number; // How long to keep logs
    faceImageStorageDays: number; // How long to keep photos
    
    // Localization
    timezone: string; // 'Asia/Kolkata'
    language: string; // 'en', 'hi'
    dateFormat: string; // 'DD/MM/YYYY'
    
    // Notifications
    enableSMSNotifications: boolean;
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
  };
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string; // userId of society creator
  status: 'active' | 'inactive' | 'archived';
}

// ============================================
// NEW: SUBSCRIPTION TYPE
// ============================================

export interface Subscription {
  id: string;
  
  // Link to Society
  societyId: string;
  societyName: string;
  
  // Plan Info
  planId: string; // 'free', 'starter', 'professional', 'enterprise'
  planName: string;
  planPrice: number; // In INR
  billingCycle: 'monthly' | 'yearly';
  
  // Payment
  paymentMethod?: string; // 'card', 'upi', 'bank_transfer'
  paymentStatus: 'pending' | 'completed' | 'failed';
  
  // Dates
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  renewalDate: Date | Timestamp;
  cancelledDate?: Date | Timestamp;
  
  // Status
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// ============================================
// NEW: AUDIT LOG TYPE (COMPLIANCE)
// ============================================

export interface AuditLog {
  id: string;
  
  // Context
  societyId: string;
  userId: string;
  userEmail: string;
  
  // Action
  action: string; // 'person_created', 'entry_logged', 'user_added', etc.
  resourceType: string; // 'person', 'entry', 'user', 'society'
  resourceId: string;
  
  // Data
  changes?: Record<string, { before: JsonValue; after: JsonValue }>;
  metadata?: Record<string, JsonValue>;
  
  // Timestamp
  createdAt: Date | Timestamp;
  
  // IP & User Agent
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// CONTEXT TYPES
// ============================================

/**
 * Society context for current user + society
 * Used to validate user has access to this society
 */
export interface SocietyContext {
  societyId: string;
  userId: string;
  userEmail: string;
  role: 'admin' | 'guard' | 'resident' | 'viewer';
  society: Society;
  user: User;
}

/**
 * Auth context for current user
 */
export interface AuthContext {
  userId: string;
  email: string;
  user: User | null;
  isLoading: boolean;
  isError: boolean;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface RegisterPersonRequest {
  name: string;
  phone: string;
  category: 'resident' | 'daily-labor' | 'service-worker' | 'vendor' | 'guest';
  associatedFlat?: string;
  purpose?: string;
  company?: string;
  faceDescriptor?: number[] | Float32Array;
  faceImage?: string;
  registeredBy?: string;
}

export interface LogEntryRequest {
  personId: string;
  personName: string;
  personCategory: string;
  associatedFlat?: string;
  loggedBy: string;
  purpose?: string;
  notes?: string;
}

export interface CreateSocietyRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  adminEmail: string;
  adminPhone: string;
  phone: string;
  subscriptionPlan?: 'free' | 'starter' | 'professional' | 'enterprise';
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface PersonFilter {
  societyId: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'phone' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface EntryFilter {
  societyId: string;
  personId?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  page?: number;
  limit?: number;
}

// ============================================
// FORM TYPES
// ============================================

export interface PersonFormData {
  name: string;
  phone: string;
  associatedFlat: string;
  purpose: string;
  company: string;
}

export interface SocietyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  adminEmail: string;
  adminPhone: string;
  phone: string;
}
