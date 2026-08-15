import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Role from '@/models/Role';
import { getAuthSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

export async function GET() {
  try {
    await connectToDatabase();
    const roles = await Role.find().sort({ name: 1 });
    return NextResponse.json(roles);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await hasPermission(req, 'users', 'create')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const session = await getAuthSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    await connectToDatabase();

    const role = await Role.create(body);

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'CREATE_ROLE',
      entity: 'Role',
      details: { after: role, message: `Created role: ${role.name}` },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(role);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
