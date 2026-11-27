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

    // 1. Turnstile. With a real secret configured the token is REQUIRED - "verify only if
    //    provided" let anyone skip the captcha by simply omitting the field. Without a secret
    //    (local dev) the always-pass test keys are in use and a missing token is tolerated.
    if (captchaToken || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      const captchaResult = await verifyTurnstileToken(captchaToken, ip);
      if (!captchaResult.success) {
        return NextResponse.json({ error: captchaResult.error || 'Captcha verification failed.' }, { status: 400 });
      }
    }

    const username = sanitizeFormString(rawUsername);

    await connectToDatabase();

    // Find user by username or email and populate role
    const escapedEmail = String(username || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({
      $or: [
        { username },
        { email: new RegExp(`^${escapedEmail}$`, 'i') }
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

    if (!user.customPermissions && (!user.role || typeof user.role !== 'object' || !user.role.permissions)) {
      return NextResponse.json({ error: 'Your role no longer exists. Ask an administrator to assign one.' }, { status: 403 });
    }
    const roleName = user.role?.name || 'Custom';
    const permissions = user.customPermissions || user.role.permissions;

    const token = await signToken({
      userId: user._id.toString(),
      username: user.username,
      roleName,
      permissions,
      tokenVersion: user.tokenVersion || 0
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
