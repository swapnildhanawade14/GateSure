import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getCurrentUser, loginUser } from '@/lib/auth';
import { isValidEmail, rateLimitByIP, sanitizeInput } from '@/lib/securityMiddleware';

export async function POST(request: NextRequest) {
  if (!rateLimitByIP(request, 10, 3_600_000)) {
    return NextResponse.json({ error: 'Too many login attempts. Please try later.' }, { status: 429 });
  }

  try {
    const data = sanitizeInput(await request.json()) as Record<string, unknown>;
    const email = typeof data.email === 'string' ? data.email : '';
    const password = typeof data.password === 'string' ? data.password : '';
    if (!email || !password || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const firebaseUser = await loginUser(email, password);
    const user = await getCurrentUser();
    if (!user || Object.keys(user.societies).length === 0) {
      return NextResponse.json({ error: 'No societies assigned' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      name: user.name,
      societies: user.societies,
      token: await getAuthToken(),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 401 });
  }
}
