import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/database';
import { getSocietyIdFromRequest } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const societyId = getSocietyIdFromRequest(request);
    if (!societyId) {
      return NextResponse.json({ error: 'Missing society_id' }, { status: 400 });
    }

    const days = Number(request.nextUrl.searchParams.get('days') ?? '30');
    const logLimit = Number(request.nextUrl.searchParams.get('limit') ?? '100');
    if (!Number.isFinite(days) || days < 0 || !Number.isInteger(logLimit) || logLimit < 1) {
      return NextResponse.json({ error: 'Invalid days or limit' }, { status: 400 });
    }

    const logs = await getAuditLogs(societyId, days, logLimit);
    return NextResponse.json({ success: true, logs, societyId, count: logs.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
