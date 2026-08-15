import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { recordActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  const ip = req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown';

  if (session) {
    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'LOGOUT',
      ip,
      status: 'success'
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
