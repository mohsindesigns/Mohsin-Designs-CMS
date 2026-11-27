import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let u: any;
  try {
    await connectToDatabase();
    u = await User.findById((session as any).userId).select('status tokenVersion').lean();
  } catch {
    return NextResponse.json({ error: 'Could not verify session' }, { status: 500 });
  }

  if (!u || u.status !== 'active' || (u.tokenVersion || 0) !== ((session as any).tokenVersion || 0)) {
    const res = NextResponse.json({ error: 'Session expired' }, { status: 401 });
    res.cookies.set('mohsin_admin_session', '', { httpOnly: true, maxAge: 0, path: '/' });
    return res;
  }

  return NextResponse.json(session);
}
