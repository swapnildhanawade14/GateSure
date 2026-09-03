// lib/middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function getSocietyIdFromRequest(request: NextRequest): string | null {
  // Try query params first
  const queryId = request.nextUrl.searchParams.get('society_id');
  if (queryId?.trim()) return queryId.trim();

  // Try custom header
  const headerId = request.headers.get('x-society-id');
  if (headerId?.trim()) return headerId.trim();

  return null;
}

export async function withSocietyValidation(
  handler: (request: NextRequest, societyId: string) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const societyId = getSocietyIdFromRequest(request);
    if (!societyId) {
      return NextResponse.json({ error: 'Missing society_id' }, { status: 400 });
    }

    try {
      return await handler(request, societyId);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Internal error' },
        { status: 500 }
      );
    }
  };
}