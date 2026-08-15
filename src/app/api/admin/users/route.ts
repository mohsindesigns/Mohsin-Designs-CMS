import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'users', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const users = await User.find({}).populate('role', 'name').select('-password');
    
    const session = await getSessionUser(req);
    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'VIEW_USERS',
      entity: 'User',
      details: { count: users.length },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'users', 'create'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();
    const { username, email, password, roleId } = body;

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    const newUser = await User.create({
      username,
      email,
      password, // Will be hashed by pre-save hook
      role: roleId,
      status: 'active'
    });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: newUser._id.toString(),
      details: { after: { username, email, roleId } },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(newUser);
  } catch (err: any) {
    console.error("User creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
