import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import { signToken } from '@/lib/auth';
import { recordActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown';
  
  try {
    const body = await req.json();
    const { username, password } = body;

    await connectToDatabase();

    // Find user and populate role
    const user = await User.findOne({ username }).populate('role');

    if (!user) {
      await recordActivity({
        action: 'LOGIN_FAILURE',
        userName: username,
        ip,
        status: 'failure',
        details: { message: 'User not found' }
      });
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    if (user.status !== 'active') {
      await recordActivity({
        user: user._id,
        userName: user.username,
        action: 'LOGIN_FAILURE',
        ip,
        status: 'failure',
        details: { message: 'Account is disabled' }
      });
      return NextResponse.json({ error: 'Your account has been disabled.' }, { status: 403 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await recordActivity({
        user: user._id,
        userName: user.username,
        action: 'LOGIN_FAILURE',
        ip,
        status: 'failure',
        details: { message: 'Incorrect password' }
      });
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    // Success
    user.lastLogin = new Date();
    await user.save();

    const token = await signToken({
      userId: user._id.toString(),
      username: user.username,
      roleName: user.role.name,
      permissions: user.customPermissions || user.role.permissions
    });

    await recordActivity({
      user: user._id,
      userName: user.username,
      action: 'LOGIN_SUCCESS',
      ip,
      status: 'success'
    });

    const response = NextResponse.json({ 
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role.name
      }
    });

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;

  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
