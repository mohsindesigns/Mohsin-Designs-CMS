import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { recordActivity } from '@/lib/logger';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  const ip = req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown';

  if (session) {
    try {
      await connectToDatabase();
      await User.updateOne({ _id: (session as any).userId }, { $inc: { tokenVersion: 1 } });
    } catch (err) {
      console.error('Logout: could not revoke session', err);
    }
    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'LOGOUT',
      ip,
      status: 'success'
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('mohsin_admin_session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
