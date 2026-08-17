import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log("=== DEBUG /api/admin/me ===");
  const cookieHeader = req.headers.get('cookie') || "";
  console.log("Raw Cookie header in request:", cookieHeader);
  const session = await getAuthSession(req);
  console.log("Resolved getAuthSession payload:", session);
  
  if (!session) {
    console.log("No session found or verifyToken failed. Returning 401.");
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  return NextResponse.json(session);
}
