import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { addUserToSociety, createSociety, createUser } from '@/lib/database';
import { rateLimitByIP, sanitizeInput, isValidEmail, isValidName, isValidPhone, validatePasswordStrength } from '@/lib/securityMiddleware';

export async function POST(request: NextRequest) {
  if (!rateLimitByIP(request, 5, 3_600_000)) {
    return NextResponse.json({ error: 'Too many registration attempts. Please try later.' }, { status: 429 });
  }

  try {
    const data = sanitizeInput(await request.json()) as Record<string, unknown>;
    const email = typeof data.email === 'string' ? data.email : '';
    const password = typeof data.password === 'string' ? data.password : '';
    const name = typeof data.name === 'string' ? data.name : '';
    const phone = typeof data.phone === 'string' ? data.phone : '';
    const societyName = typeof data.societyName === 'string' ? data.societyName : '';

    if (!email || !password || !name || !societyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidEmail(email) || !isValidName(name) || (phone && !isValidPhone(phone))) {
      return NextResponse.json({ error: 'Invalid registration details' }, { status: 400 });
    }
    const passwordError = validatePasswordStrength(password);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

    const firebaseUser = await registerUser(email, password);
    const userId = await createUser({
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      name,
      phone: phone || undefined,
      societies: {},
      isActive: true,
    });
    const societyId = await createSociety({
      name: societyName,
      address: typeof data.address === 'string' ? data.address : '',
      city: typeof data.city === 'string' ? data.city : '',
      state: typeof data.state === 'string' ? data.state : '',
      pincode: typeof data.pincode === 'string' ? data.pincode : '',
      adminEmail: email,
      adminPhone: phone,
      phone,
      subscriptionStatus: 'trial',
      subscriptionPlan: 'free',
      subscriptionStartDate: new Date(),
      createdBy: userId,
      status: 'active',
      settings: {
        faceThreshold: 0.6,
        faceConfidenceThreshold: 0.5,
        maxAllowedGates: 5,
        maxAllowedUsers: 50,
        maxStorageMB: 1000,
        enableGuest: true,
        enableVendor: true,
        enableServiceWorker: true,
        enableVehicleTracking: false,
        enableParcelDelivery: false,
        enableNotifications: true,
        entryLogRetentionDays: 90,
        faceImageStorageDays: 30,
        timezone: 'Asia/Kolkata',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        enableSMSNotifications: false,
        enableEmailNotifications: true,
        enablePushNotifications: false,
      },
    });
    await addUserToSociety(userId, societyId, 'admin');

    return NextResponse.json({ success: true, userId, societyId, message: 'Registration successful. Please verify your email.' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
