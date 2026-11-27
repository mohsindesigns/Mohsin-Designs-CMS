import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Redirect from '@/models/Redirect';

// Called fire-and-forget by src/middleware.ts whenever a redirect rule fires, so the Redirect
// Manager's Hits / Last accessed columns reflect real traffic. Middleware matches rules in memory
// and never calls /api/redirects/match with a real path, so this is the only place hits are counted.
// Guarded by INTERNAL_API_SECRET; when that env var is unset, hit counting is disabled.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  const given = req.headers.get('x-internal-secret');
  if (!secret || !given) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    // Drop the hit rather than letting it sit in Mongoose's command buffer during an outage.
    if ((await connectToDatabase()) === null || mongoose.connection.readyState !== 1) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    await Redirect.findByIdAndUpdate(id, { $inc: { hits: 1 }, $set: { lastAccessed: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Redirect hit error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
