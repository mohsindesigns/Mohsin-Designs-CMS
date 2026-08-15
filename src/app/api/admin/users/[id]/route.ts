import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'users', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await connectToDatabase();
    const body = await req.json();
    const { username, email, password, roleId, status } = body;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const before = { username: user.username, email: user.email, roleId: user.role.toString(), status: user.status };

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = roleId || user.role;
    user.status = status || user.status;
    if (password) user.password = password;

    await user.save();

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: id,
      details: { before, after: { username, email, roleId, status } },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'users', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await connectToDatabase();
    
    // Check if trying to delete self
    if (id === (session as any).userId) {
      return NextResponse.json({ error: 'You cannot delete yourself' }, { status: 400 });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: id,
      details: { username: user.username },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
