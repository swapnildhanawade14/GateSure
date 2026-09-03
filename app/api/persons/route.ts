import { NextRequest, NextResponse } from 'next/server';
import { getPersonByPhone, getPersonsByCategory, getPersonsBySociety } from '@/lib/database';
import { getSocietyIdFromRequest } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const societyId = getSocietyIdFromRequest(request);
    if (!societyId) {
      return NextResponse.json({ error: 'Missing society_id' }, { status: 400 });
    }

    const phone = request.nextUrl.searchParams.get('phone');
    const category = request.nextUrl.searchParams.get('category');
    if (phone) {
      const person = await getPersonByPhone(societyId, phone);
      return NextResponse.json({ success: true, persons: person ? [person] : [], person, societyId });
    }

    const persons = category
      ? await getPersonsByCategory(societyId, category)
      : await getPersonsBySociety(societyId);
    return NextResponse.json({ success: true, persons, societyId, count: persons.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch persons' },
      { status: 500 }
    );
  }
}
