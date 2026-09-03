import { NextRequest, NextResponse } from 'next/server';
import { getRecentEntries, logEntry } from '@/lib/database';
import { getSocietyIdFromRequest } from '@/lib/middleware';
import type { LogEntryRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const societyId = getSocietyIdFromRequest(request);
    if (!societyId) {
      return NextResponse.json({ error: 'Missing society_id' }, { status: 400 });
    }

    const data = (await request.json()) as LogEntryRequest;
    if (!data.personId || !data.personName || !data.personCategory || !data.loggedBy) {
      return NextResponse.json({ error: 'Person and logger details are required' }, { status: 400 });
    }

    const entryId = await logEntry(societyId, {
      ...data,
      entryTime: new Date(),
    });

    return NextResponse.json({ success: true, entryId, societyId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to log entry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const societyId = getSocietyIdFromRequest(request);
    if (!societyId) {
      return NextResponse.json({ error: 'Missing society_id' }, { status: 400 });
    }

    const hours = Number(request.nextUrl.searchParams.get('hours') ?? '24');
    if (!Number.isFinite(hours) || hours < 0) {
      return NextResponse.json({ error: 'hours must be a non-negative number' }, { status: 400 });
    }

    const entries = await getRecentEntries(societyId, hours);
    return NextResponse.json({ success: true, entries, societyId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}
