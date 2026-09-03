import { NextRequest, NextResponse } from 'next/server';
import { createSociety, getAllSocieties } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const requiredFields = ['name', 'address', 'city', 'state', 'pincode', 'adminEmail', 'adminPhone', 'phone'];
    if (requiredFields.some((field) => typeof data[field] !== 'string' || !data[field].trim())) {
      return NextResponse.json({ error: 'All society and contact fields are required' }, { status: 400 });
    }

    const societyId = await createSociety({
      ...data,
      subscriptionStatus: 'trial',
      subscriptionPlan: data.subscriptionPlan || 'free',
      subscriptionStartDate: new Date(),
      createdBy: data.createdBy || 'admin',
      status: 'active',
      settings: data.settings || {
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

    return NextResponse.json({ success: true, societyId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create society' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const societies = await getAllSocieties();
    return NextResponse.json({ success: true, societies, count: societies.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch societies' },
      { status: 500 }
    );
  }
}
