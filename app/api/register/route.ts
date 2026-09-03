import { NextRequest, NextResponse } from 'next/server';
import { logAuditAction, registerPerson } from '@/lib/database';
import { getSocietyIdFromRequest } from '@/lib/middleware';
import type { RegisterPersonRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const societyId = getSocietyIdFromRequest(request);
    if (!societyId) {
      return NextResponse.json({ error: 'Missing society_id parameter' }, { status: 400 });
    }

    const data = (await request.json()) as RegisterPersonRequest;
    if (!data.name?.trim() || !data.phone?.trim() || !data.category) {
      return NextResponse.json({ error: 'Name, phone, and category are required' }, { status: 400 });
    }

    const personId = await registerPerson(societyId, {
      ...data,
      faceDescriptor: data.faceDescriptor ? new Float32Array(data.faceDescriptor) : undefined,
      name: data.name.trim(),
      phone: data.phone.trim(),
      registeredBy: data.registeredBy || 'admin',
    });

    await logAuditAction(societyId, {
      userId: data.registeredBy || 'admin',
      userEmail: '',
      societyId,
      action: 'person_created',
      resourceType: 'person',
      resourceId: personId,
    });

    return NextResponse.json({ success: true, personId, societyId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
