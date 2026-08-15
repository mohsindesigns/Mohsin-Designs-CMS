import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Role from '@/models/Role';
import { getAuthSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await hasPermission(req, 'users', 'update')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const session = await getAuthSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    await connectToDatabase();

    const oldRole = await Role.findById(id);
    if (!oldRole) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

    const newRole = await Role.findByIdAndUpdate(id, body, { new: true });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'UPDATE_ROLE',
      entity: 'Role',
      details: { 
        before: oldRole, 
        after: newRole,
        message: `Updated role: ${newRole.name}` 
      },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(newRole);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await hasPermission(req, 'users', 'delete')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const session = await getAuthSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    await connectToDatabase();
    const role = await Role.findById(id);
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

    if (!role.isCustom) {
      return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 400 });
    }

    await Role.findByIdAndDelete(id);

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'DELETE_ROLE',
      entity: 'Role',
      details: { before: role, message: `Deleted role: ${role.name}` },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
