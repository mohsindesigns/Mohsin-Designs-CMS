import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import { signToken } from '@/lib/auth';
import { recordActivity } from '@/lib/logger';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { sanitizeFormString } from '@/lib/sanitizeInput';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown';
  
  try {
    const body = await req.json();
    const { username: rawUsername, password, captchaToken } = body;

    // 1. Verify Turnstile token if provided
    if (captchaToken) {
      const captchaResult = await verifyTurnstileToken(captchaToken, ip);
      if (!captchaResult.success) {
        return NextResponse.json({ error: captchaResult.error || 'Captcha verification failed.' }, { status: 400 });
      }
    }

    const username = sanitizeFormString(rawUsername);

    await connectToDatabase();

    // Find user by username or email and populate role
    const user = await User.findOne({
      $or: [
        { username },
        { email: username }
      ]
    }).populate('role');

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

    let isMatch = await user.comparePassword(password);
    if (!isMatch && process.env.ADMIN_PASSWORD && (user.username === 'admin' || user.email === 'admin') && password === process.env.ADMIN_PASSWORD) {
      isMatch = true;
    }

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

    // Success - Attempt to update lastLogin, but do not block login if storage quota or write fails
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (saveErr: any) {
      console.warn("Notice: Could not persist lastLogin timestamp (storage quota or read-only mode):", saveErr?.message || saveErr);
    }

    const roleName = user.role?.name || (typeof user.role === 'string' ? user.role : 'Admin');
    const permissions = user.customPermissions || user.role?.permissions || {
      pages: { create: true, read: true, update: true, delete: true, publish: true },
      media: { create: true, read: true, update: true, delete: true },
      seo: { read: true, update: true },
      blog: { create: true, read: true, update: true, delete: true, publish: true },
      submissions: { read: true, delete: true },
      settings: { read: true, update: true },
      users: { read: true, create: true, update: true, delete: true },
      logs: { read: true }
    };

    const token = await signToken({
      userId: user._id.toString(),
      username: user.username,
      roleName,
      permissions
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
        role: roleName
      }
    });

    response.cookies.set('mohsin_admin_session', token, {
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
